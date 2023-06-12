// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {StableCoin} from "./ZCoin.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract ZEngine is ReentrancyGuard {
    error ZEngine_NeedsMoreThanZero();
    error ZEngine_TokenAndPriceAddress(string message);
    error ZEngine_TokenNotAllowed();
    error ZEngine_TransferFailed();
    error ZEngine_BreaksHealthFactor(uint256 healthFactor);

    uint256 private constant FEED_PRECISION = 1e10;
    uint256 private constant PRECISION = 1e18;
    uint256 private constant LIQUIDATION_THRESHOLD = 50;
    uint256 private constant MIN_HEALTH_FACTOR = 1;
    mapping(address token => address priceFeed) private s_priceFeeds;
    mapping(address user => mapping(address token => uint256 amount)) private s_collateralDeposited;
    mapping(address user => uint256 zCoinMinted) private s_zCoinMinted;
    address[] private s_collateralTokens;
    StableCoin private immutable zcoin;

    event Deposit(address indexed user, address indexed token, uint256 indexed amount);

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
            revert ZEngine_TokenAndPriceAddress("token address and price feed address not the same length");
        }
        for (uint256 i = 0; i < _tokenAddresses.length; i++) {
            s_priceFeeds[_tokenAddresses[i]] = _priceFeedAddresses[i];
            s_collateralTokens.push(_tokenAddresses[i]);
        }
        zcoin = StableCoin(_zcoinAddress);
    }

    function deposit(address _tokenCollateralAddress, uint256 _amount)
        external
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

    function mintZCoin(uint256 _amount) external moreThanZero(_amount) nonReentrant {
        s_zCoinMinted[msg.sender] += _amount;
    }

    function _getAccountInfo(address _user) private view returns (uint256 totalCoins, uint256 collateralValue) {
        totalCoins = s_zCoinMinted[_user];
        collateralValue = getAccountCollateralValue(_user);
        return (totalCoins, collateralValue);
    }

    function _checkHealthFactor(address _user) internal view {
        (uint256 totalCoins, uint256 collateralValue) = _getAccountInfo(user);
        uint256 collateralAdjusted = (collateralValue * LIQUIDATION_THRESHOLD) / 100;
        uint256 healthFactor = (collateralAdjusted * PRECISION) / totalCoins;
        if (healthFactor < MIN_HEALTH_FACTOR) {
            revert ZEngine_BreaksHealthFactor(healthFactor);
        }
    }

    function getAccountCollateralValue(address _user) public view returns (uint256 totalCollateralInUsd) {
        for (i = 0; i < s_collateralTokens.length; i++) {
            address token = s_collateralTokens[i];
            uint256 amount = s_collateralDeposited[user][token];
            totalCollateralInUsd += getUsdValue(token, amount);
        }

        return totalCollateralInUsd;
    }

    function getUsdValue(address _token, uint256 _amount) public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(s_priceFeeds[_token]);
        (uint256 price) = priceFeed.latestRoundData();
        return ((uint256(price) * FEED_PRECISION) * _amount) / PRECISION;
    }
}
