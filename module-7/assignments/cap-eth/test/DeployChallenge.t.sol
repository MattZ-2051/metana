// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/DeployChallenge.sol";

contract DeployTest is Test {
    DeployChallenge public target;

    function setUp() public {
        target = new DeployChallenge();
    }

    function testIsComplete() public {
        assertEq(target.isComplete(), true);
    }
}
