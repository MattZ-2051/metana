// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/FuzzyIdentity.sol";

contract CounterTest is Test {
    FuzzyIdentityChallenge public target;

    function setUp() public {
        target = new FuzzyIdentityChallenge();
    }
}
