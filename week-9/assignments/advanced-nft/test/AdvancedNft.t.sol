// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/AdvancedNft.sol";

contract CounterTest is Test {
    AdvancedNft public nft;

    function setUp() public {
        nft = new AdvancedNft(bytes32("0x1234"));
    }
}
