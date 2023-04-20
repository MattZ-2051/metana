// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@1001-digital/erc721-extensions/contracts/RandomlyAssigned.sol";

contract AdvancedNft is ERC721, Ownable, RandomlyAssigned {
    using BitMaps for BitMaps.BitMap;

    bytes32 public immutable root;

    uint8 public max = 10;
    mapping(address => Commit) public commits;
    BitMaps.BitMap private claimedBitMap;

    constructor(
        bytes32 merkleroot
    ) ERC721("MyNft", "MNT") RandomlyAssigned(10, 0) {
        root = merkleroot;
    }

    struct Commit {
        bytes32 commit;
        uint64 block;
        bool revealed;
    }

    function get(uint index) public view returns (bool) {
        return claimedBitMap.get(index);
    }

    function setTo(uint index, bool value) public {
        claimedBitMap.setTo(index, value);
    }

    function set(uint index) public {
        claimedBitMap.set(index);
    }

    function unset(uint index) public {
        claimedBitMap.unset(index);
    }

    function getHash(bytes32 data) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), data));
    }

    function commit(bytes32 dataHash, uint64 block_number) public onlyOwner {
        require(
            block_number > block.number,
            "CommitReveal::reveal: Already revealed"
        );
        commits[msg.sender].commit = dataHash;
        commits[msg.sender].block = block_number;
        commits[msg.sender].revealed = false;
        emit CommitHash(
            msg.sender,
            commits[msg.sender].commit,
            commits[msg.sender].block
        );
    }

    function reveal(bytes32 revealHash) public {
        require(
            commits[msg.sender].revealed == false,
            "CommitReveal::reveal: Already revealed"
        );
        require(
            getHash(revealHash) == commits[msg.sender].commit,
            "CommitReveal::reveal: Revealed hash does not match commit"
        );

        commits[msg.sender].revealed = true;

        bytes32 blockHash = blockhash(commits[msg.sender].block);
        uint8 random = uint8(
            uint(keccak256(abi.encodePacked(blockHash, revealHash)))
        ) % max;
        emit RevealHash(msg.sender, revealHash, random);
    }

    event RevealHash(address sender, bytes32 revealHash, uint8 random);
    event CommitHash(address sender, bytes32 dataHash, uint64 block);

    function redeem(
        address account,
        uint256 tokenId,
        bytes32[] calldata proof
    ) external {
        require(
            _verify(_leaf(account, tokenId), proof),
            "Invalid merkle proof"
        );
        _safeMint(account, tokenId);
    }

    function _leaf(
        address account,
        uint256 bitMapIndex
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(bitMapIndex, account));
    }

    function _verify(
        bytes32 leaf,
        bytes32[] memory proof
    ) internal view returns (bool) {
        return MerkleProof.verify(proof, root, leaf);
    }
}
