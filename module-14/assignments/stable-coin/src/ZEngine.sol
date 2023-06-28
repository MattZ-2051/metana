// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {StableCoin} from "./ZCoin.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract ZEngine is ReentrancyGuard {
    error ZEngine_NeedsMoreThanZero();
    error ZEngine_TokenAndPriceAddress();
    error ZEngine_TokenNotAllowed();
    error ZEngine_TransferFailed();
    error ZEngine_BreaksHealthFactor(uint256 healthFactor);
    error ZEngine_MintFailed();
    error ZEngine_HealthFactorOk();

    uint256 private constant FEED_PRECISION = 1e10;
    uint256 private constant PRECISION = 1e18;
    uint256 private constant LIQUIDATION_THRESHOLD = 50;
    uint256 private constant MIN_HEALTH_FACTOR = 1e18;
    uint256 private constant LIQUIDATION_BONUS = 10;

    mapping(address token => address priceFeed) private s_priceFeeds;
    mapping(address user => mapping(address token => uint256 amount)) private s_collateralDeposited;
    mapping(address user => uint256 zCoinMinted) private s_zCoinMinted;
    address[] private s_collateralTokens;
    StableCoin private immutable zcoin;

    event Deposit(address indexed user, address indexed token, uint256 indexed amount);
    event Redemption(address indexed redeemedFrom, address indexed redeemedTo, address indexed token, uint256 amount);

    modifier moreThanZero(uint256 _amount) {
        if (_amount == 0) {
            revert ZEngine_NeedsMoreThanZero();
        }
        _;
    }

    modifier isAllowedCollateral(address _token) {
        if (s_priceFeeds[_token] == address(0)) {
            revert ZEngine_TokenNotAllowed();
        }

        _;
    }

    constructor(address[] memory _tokenAddresses, address[] memory _priceFeedAddresses, address _zcoinAddress) {
        if (_tokenAddresses.length != _priceFeedAddresses.length) {
            revert ZEngine_TokenAndPriceAddress();
        }
        for (uint256 i = 0; i < _tokenAddresses.length; i++) {
            s_priceFeeds[_tokenAddresses[i]] = _priceFeedAddresses[i];
            s_collateralTokens.push(_tokenAddresses[i]);
        }
        zcoin = StableCoin(_zcoinAddress);
    }

    function deposit(address _tokenCollateralAddress, uint256 _amount)
        public
        moreThanZero(_amount)
        isAllowedCollateral(_tokenCollateralAddress)
        nonReentrant
    {
        s_collateralDeposited[msg.sender][_tokenCollateralAddress] += _amount;
        emit Deposit(msg.sender, _tokenCollateralAddress, _amount);
        bool success = IERC20(_tokenCollateralAddress).transferFrom(msg.sender, address(this), _amount);
        if (!success) {
            revert ZEngine_TransferFailed();
        }
    }

    function redeemCollateral(address _tokenCollateralAddress, uint256 _amountToRedeem)
        public
        moreThanZero(_amountToRedeem)
        nonReentrant
    {
        _redeemCollateral(_tokenCollateralAddress, _amountToRedeem, msg.sender, msg.sender);
        _checkHealthFactor(msg.sender);
    }

    function redeemCollateralForZCoin(address _tokenCollateralAddress, uint256 _amountCollateral, uint256 _amountToBurn)
        external
    {
        burnZCoin(_amountToBurn);
        redeemCollateral(_tokenCollateralAddress, _amountCollateral);
    }

    function mintZCoin(uint256 _amount) public moreThanZero(_amount) nonReentrant {
        s_zCoinMinted[msg.sender] += _amount;
        _checkHealthFactor(msg.sender);
        bool minted = zcoin.mint(msg.sender, _amount);
        if (!minted) {
            revert ZEngine_MintFailed();
        }
    }

    function depositAndMint(address _tokenCollateralAddress, uint256 _depositCollateralAmount, uint256 _amountToMint)
        external
    {
        deposit(_tokenCollateralAddress, _depositCollateralAmount);
        mintZCoin(_amountToMint);
    }

    function burnZCoin(uint256 _amount) public moreThanZero(_amount) {
        _burnCoins(_amount, msg.sender, msg.sender);
        _checkHealthFactor(msg.sender);
    }

    function liquidate(address _collateral, address _user, uint256 _debtToCover)
        public
        moreThanZero(_debtToCover)
        nonReentrant
    {
        uint256 healthFactor = _healthFactor(_user);
        if (healthFactor >= MIN_HEALTH_FACTOR) {
            revert ZEngine_HealthFactorOk();
        }

        uint256 tokenAmountFromDebt = getTokenAmountFromUsd(_collateral, _debtToCover);

        uint256 bonus = (tokenAmountFromDebt * LIQUIDATION_BONUS) / 100;
        uint256 amountToRedeem = bonus + tokenAmountFromDebt;
        _redeemCollateral(_collateral, amountToRedeem, _user, msg.sender);
        _burnCoins(_debtToCover, _user, msg.sender);

        uint256 endingHealthFactor = _healthFactor(_user);
        if (endingHealthFactor <= healthFactor) {
            revert ZEngine_BreaksHealthFactor(endingHealthFactor);
        }

        _checkHealthFactor(msg.sender);
    }

    function _burnCoins(uint256 _amountToBurn, address _behalfOf, address _from) private {
        s_zCoinMinted[_behalfOf] -= _amountToBurn;
        bool success = zcoin.transferFrom(_from, address(this), _amountToBurn);

        if (!success) {
            revert ZEngine_TransferFailed();
        }

        zcoin.burn(_amountToBurn);
    }

    function _redeemCollateral(address _tokenCollateralAddress, uint256 _amountToRedeem, address _from, address _to)
        private
    {
        s_collateralDeposited[_from][_tokenCollateralAddress] -= _amountToRedeem;
        emit Redemption(_from, _to, _tokenCollateralAddress, _amountToRedeem);
        bool success = IERC20(_tokenCollateralAddress).transfer(_to, _amountToRedeem);
        if (!success) {
            revert ZEngine_TransferFailed();
        }
    }

    function _getAccountInfo(address _user) private view returns (uint256 totalCoins, uint256 collateralValue) {
        totalCoins = s_zCoinMinted[_user];
        collateralValue = getAccountCollateralValue(_user);
        return (totalCoins, collateralValue);
    }

    function _healthFactor(address _user) private view returns (uint256) {
        (uint256 totalDscMinted, uint256 collateralValueInUsd) = _getAccountInfo(_user);
        return _calculateHealthFactor(totalDscMinted, collateralValueInUsd);
    }

    function _calculateHealthFactor(uint256 _totalCoinsMintered, uint256 _collateralValueInUsd)
        internal
        pure
        returns (uint256)
    {
        if (_totalCoinsMintered == 0) return type(uint256).max;
        uint256 collateralAdjustedForThreshold = (_collateralValueInUsd * LIQUIDATION_THRESHOLD) / 100;
        return (collateralAdjustedForThreshold * 1e18) / _totalCoinsMintered;
    }

    function _checkHealthFactor(address _user) internal view {
        (uint256 totalCoins, uint256 collateralValue) = _getAccountInfo(_user);
        uint256 collateralAdjusted = (collateralValue * LIQUIDATION_THRESHOLD) / 100;
        uint256 healthFactor = (collateralAdjusted * PRECISION) / totalCoins;
        if (healthFactor < MIN_HEALTH_FACTOR) {
            revert ZEngine_BreaksHealthFactor(healthFactor);
        }
    }

    function getAccountCollateralValue(address _user) public view returns (uint256 totalCollateralInUsd) {
        for (uint256 i = 0; i < s_collateralTokens.length; i++) {
            address token = s_collateralTokens[i];
            uint256 amount = s_collateralDeposited[_user][token];
            totalCollateralInUsd += getUsdValue(token, amount);
        }

        return totalCollateralInUsd;
    }

    function getUsdValue(address _token, uint256 _amount) public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(s_priceFeeds[_token]);
        (, int256 answer,,,) = priceFeed.latestRoundData();
        return ((uint256(answer) * FEED_PRECISION) * _amount) / PRECISION;
    }

    function getTokenAmountFromUsd(address _token, uint256 _amount) public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(s_priceFeeds[_token]);
        (, int256 price,,,) = priceFeed.latestRoundData();
        return (_amount * PRECISION) / (uint256(price) * FEED_PRECISION);
    }
}
