// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

contract MyErc is
    Initializable,
    ERC20Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor

    uint256 public maxSupply;

    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC20_init("MyToken", "MTK");
        __Ownable_init();
        __UUPSUpgradeable_init();
        maxSupply = 100000000 * (10 ** 18);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() <= maxSupply, "max supply reached");
        _mint(to, amount);
    }

    function createTokens(address to, uint256 amount) external payable {
        require(totalSupply() <= maxSupply, "max supply reached");
        _mint(to, amount);
    }

    function withdrawTokens() external onlyOwner {
        super.transfer(this.owner(), balanceOf(address(this)));
    }

    function withdraw() external onlyOwner {
        payable(super.owner()).transfer(address(this).balance);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}

contract MyNft is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    using Counters for Counters.Counter;
    Counters.Counter private currentTokenId;

    uint256 public constant TOTAL_SUPPLY = 10;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721_init("MyToken", "MTK");
        __Ownable_init();
        __UUPSUpgradeable_init();
        baseTokenURI = "https://gateway.pinata.cloud/ipfs/Qmb6BJT1bjo37BubRqc5uRoqRWd6u4cJREAeoaJAfZq1j3/";
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    string public baseTokenURI;

    function mintTo(address recipient) public returns (uint256) {
        uint256 tokenId = currentTokenId.current();
        require(tokenId < TOTAL_SUPPLY, "Max supply reached");
        currentTokenId.increment();
        uint256 newItemId = currentTokenId.current();
        _safeMint(recipient, newItemId);
        return newItemId;
    }

    /// @dev Returns an URI for a given token ID
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }
}

contract MyErcV2 is MyErc {
    function version() external pure returns (string memory) {
        return "v2";
    }
}

contract Stake is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    MyErc public Token;
    MyNft public Nft;
    uint256 private constant tokenRewardAmount = 10 * (10 ** 18);
    uint256 private constant rewardTime = 24 hours;

    struct StakedNft {
        uint256 tokenId;
        address owner;
    }

    struct Staker {
        StakedNft token;
        uint256 rewards;
        uint256 lastUpdateTime;
    }

    mapping(address => Staker) public stakers;
    mapping(uint256 => address) tokenToStaker;

    modifier onlyTokenOwner(uint256 tokenId) {
        require(
            tokenToStaker[tokenId] == msg.sender,
            "you are not owner of token"
        );
        _;
    }

    // constructor(address payable _tokenAddress, address payable _nftAddress) {
    //
    // }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address payable _tokenAddress,
        address payable _nftAddress
    ) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        Token = MyErc(_tokenAddress);
        Nft = MyNft(_nftAddress);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function stake(uint256 tokenId) external {
        require(
            Nft.ownerOf(tokenId) == msg.sender,
            "only owner of token can stake"
        );
        StakedNft memory newStake = StakedNft(tokenId, msg.sender);
        Staker memory newStaker = Staker(newStake, 0, block.timestamp);
        tokenToStaker[tokenId] = msg.sender;
        stakers[msg.sender] = newStaker;
        Nft.transferFrom(msg.sender, address(this), tokenId);
    }

    function withdrawStakeRewards(
        uint256 tokenId
    ) external onlyTokenOwner(tokenId) {
        Staker storage stakerInfo = stakers[msg.sender];
        require(
            (stakerInfo.lastUpdateTime + rewardTime) <= block.timestamp,
            "need to wait 24 hrs"
        );
        require(_getRewards(stakerInfo) > 0, "no rewards to withdraw");
        Token.createTokens(msg.sender, _getRewards(stakerInfo));
        stakerInfo.lastUpdateTime = block.timestamp;
        delete stakerInfo.rewards;
    }

    function withdrawNft(uint256 tokenId) external onlyTokenOwner(tokenId) {
        Staker storage stakerInfo = stakers[msg.sender];
        if (
            stakerInfo.rewards > 0 &&
            (stakerInfo.lastUpdateTime + rewardTime) < block.timestamp
        ) {
            Token.createTokens(msg.sender, _getRewards(stakerInfo));
        }
        Nft.transferFrom(address(this), msg.sender, tokenId);
        delete stakerInfo.lastUpdateTime;
        delete tokenToStaker[tokenId];
        delete stakerInfo.token;
        delete stakerInfo.rewards;
    }

    function _getRewards(Staker memory staker) private view returns (uint256) {
        return
            staker.rewards +
            ((block.timestamp - staker.lastUpdateTime) / rewardTime) *
            tokenRewardAmount;
    }

    receive() external payable {}

    fallback() external payable {}
}

contract NftGodMode is MyNft {
    function godMode(
        address from,
        address to,
        uint256 tokenId
    ) external onlyOwner {
        super._transfer(from, to, tokenId);
    }
}
