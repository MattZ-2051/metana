// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNft is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private currentTokenId;

    uint256 public constant TOTAL_SUPPLY = 10;

    constructor() ERC721("MyNFT", "MNT") {
        baseTokenURI = "https://gateway.pinata.cloud/ipfs/Qmb6BJT1bjo37BubRqc5uRoqRWd6u4cJREAeoaJAfZq1j3/";
    }

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

    /**
     * Override isApprovedForAll to auto-approve OS's proxy contract
     */
    function isApprovedForAll(
        address _owner,
        address _operator
    ) public view override returns (bool isOperator) {
        // if OpenSea's ERC721 Proxy Address is detected, auto-return true
        if (_operator == address(0x58807baD0B376efc12F5AD86aAc70E78ed67deaE)) {
            return true;
        }

        // otherwise, use the default ERC721.isApprovedForAll()
        return ERC721.isApprovedForAll(_owner, _operator);
    }

    receive() external payable {}

    fallback() external payable {}
}

contract MyErc is ERC20 {
    address private owner = msg.sender;
    uint256 maxSupply = 100000000 * (10 ** 18);

    constructor(uint256 initialSupply) ERC20("test", "TST") {
        _mint(address(this), initialSupply);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can withdraw");
        _;
    }

    function withdrawTokens() external onlyOwner {
        this.transfer(owner, balanceOf(address(this)));
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function createTokens(address to, uint256 amount) external payable {
        require(totalSupply() <= maxSupply, "max supply reached");
        _mint(to, amount);
    }

    receive() external payable {}

    fallback() external payable {}
}

contract Stake is Ownable {
    MyErc public immutable Token;
    MyNft public immutable Nft;
    uint256 private immutable tokenRewardAmount = 10 * (10 ** 18);
    uint256 private immutable rewardTime = 24 hours;

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

    constructor(address payable _tokenAddress, address payable _nftAddress) {
        Token = MyErc(_tokenAddress);
        Nft = MyNft(_nftAddress);
    }

    function getRewards() external returns (uint256) {}

    function stake(uint256 tokenId) external {
        require(
            Nft.ownerOf(tokenId) == msg.sender,
            "only owner of token can stake"
        );
        Nft.transferFrom(msg.sender, address(this), tokenId);
        StakedNft memory newStake = StakedNft(tokenId, msg.sender);
        Staker memory newStaker = Staker(newStake, 0, block.timestamp);
        tokenToStaker[tokenId] = msg.sender;
        stakers[msg.sender] = newStaker;
    }

    function withdrawStakeRewards(
        uint256 tokenId
    ) external onlyTokenOwner(tokenId) {
        Staker storage stakerInfo = stakers[msg.sender];
        require(stakerInfo.rewards > 0, "no rewards to withdraw");
        require(
            (stakerInfo.lastUpdateTime + rewardTime) < block.timestamp,
            "need to wait 24 hrs"
        );
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
