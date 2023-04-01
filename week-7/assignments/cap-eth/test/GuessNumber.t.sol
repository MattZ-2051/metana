// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/GuessNumber.sol";

contract GuessNumberTest is Test {
    GuessTheNumberChallenge public target;
    address player = vm.addr(1);

    function setUp() public {
        target = new GuessTheNumberChallenge{value: 1 ether}();
        vm.deal(player, 1 ether);
    }

    function testIsComplete() public {
        vm.startPrank(address(player));
        target.guess{value: 1 ether}(42);
        assertEq(target.isComplete(), true);
    }
}
