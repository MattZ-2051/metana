// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.13;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// Mumbai config vars
// VRFCoordinator - 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
// KeyHash - 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f
// gasLimit - 2,500,000
/* tokenUris - ["https://gateway.pinata.cloud/ipfs/Qmd8GUueZnxPZ7nbtTKD8QUisRQ63JD18jHKPKfviL5shB/0.json","https://gateway.pinata.cloud/ipfs/Qmd8GUueZnxPZ7nbtTKD8QUisRQ63JD18jHKPKfviL5shB/1.json","https://gateway.pinata.cloud/ipfs/Qmd8GUueZnxPZ7nbtTKD8QUisRQ63JD18jHKPKfviL5shB/2.json","https://gateway.pinata.cloud/ipfs/Qmd8GUueZnxPZ7nbtTKD8QUisRQ63JD18jHKPKfviL5shB/3.json"]
 */
contract RandomNft is VRFConsumerBaseV2, ERC721URIStorage {
    enum Types {
        fire,
        water,
        grass,
        electric
    }

    uint256 private tokenCounter;
    string[] public tokenUris;

    VRFCoordinatorV2Interface private immutable vrfCoordinator;

    uint64 private immutable subscriptionId;
    bytes32 private immutable keyHash;
    uint32 private immutable callBackGasLimit;
    uint256 public immutable mintFee;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    mapping(uint256 => address) public requestIdToSender;

    constructor(
        address _vrfCoordinatorV2,
        uint64 _subscriptionId,
        bytes32 _keyHash,
        uint256 _mintFee,
        uint32 _callBackGasLimit,
        string[3] memory _nftTokenUris
    ) VRFConsumerBaseV2(_vrfCoordinatorV2) ERC721("RandomToken", "MRT") {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinatorV2);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        mintFee = _mintFee;
        callBackGasLimit = _callBackGasLimit;
        tokenCounter = 0;
        tokenUris = _nftTokenUris;
    }

    function requestNft() public payable returns (uint256 requestId) {
        require(
            msg.value > mintFee,
            "payment needs to be greater than mint fee"
        );

        requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            REQUEST_CONFIRMATIONS,
            callBackGasLimit,
            NUM_WORDS
        );

        requestIdToSender[requestId] = msg.sender;
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address nftOwner = requestIdToSender[requestId];
        uint256 modded = randomWords[0] % 100;
        Types nftType = getBreedFromModdedRng(modded);
        _safeMint(nftOwner, tokenCounter);
        _setTokenURI(tokenCounter, tokenUris[uint256(nftType)]);
        tokenCounter++;
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [uint256(10), uint256(45), uint256(100)];
    }

    function getBreedFromModdedRng(
        uint256 moddedRng
    ) public pure returns (Types) {
        uint256 totalSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (
                moddedRng >= totalSum && moddedRng < totalSum + chanceArray[i]
            ) {
                return Types(i);
            }

            totalSum += chanceArray[i];
        }

        revert("nft out of bounds");
    }
}
