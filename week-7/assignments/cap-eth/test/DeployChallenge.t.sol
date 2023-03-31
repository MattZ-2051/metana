// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/DeployChallenge.sol";

contract DeployTest is Test {
    DeployChallenge public counter;

    function setUp() public {
        counter = new DeployChallenge();
    }

    function testIsComplete() public {
        assertEq(counter.isComplete(), true);
    }
}
