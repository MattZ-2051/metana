// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.13;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

interface VRFCoordinatorV2Interface {}

contract RandomNft is VRFConsumerBaseV2, ERC721 {
    uint256 private tokenCounter;
    string[] internal tokenUris;
    bool private initialized;

    VRFCoordinatorV2Interface private immutable vrfCoordinator;
    uint64 private immutable subscriptionId;
    bytes32 private immutable gasLimit;
    uint32 private immutable callBackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    mapping(uint256 => address) public requestIdToSender;

    constructor(
        address _vrf,
        bytes32 _keyHash
    ) VRFConsumerBaseV2(_VRFCoordinator) ERC721("RandomToken", "MRT") {}
}
