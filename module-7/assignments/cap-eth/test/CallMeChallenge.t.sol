// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/CallMeChallenge.sol";

contract CallMeTest is Test {
    CallMeChallenge public target;

    function setUp() public {
        target = new CallMeChallenge();
    }

    function testIsComplete() public {
        target.callme();
        assertEq(target.isComplete(), true);
    }
}
