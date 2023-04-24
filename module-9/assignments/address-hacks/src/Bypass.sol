// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Target {
    // Copied from open zeppelin https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Address.sol#L40
    function isContract(address account) public view returns (bool) {
        // This method relies on extcodesize/address.code.length, which returns 0
        // for contracts in construction, since the code is only stored at the end
        // of the constructor execution.
        return account.code.length > 0;
    }

    bool public hacked = false;

    function protected() external {
        require(!isContract(msg.sender), "no contract allowed");
        hacked = true;
    }
}

contract FailedAttack {
    function attack(address _target) external {
        Target(_target).protected();
    }
}

contract Hack {
    bool public isContract;
    address public addr;

    constructor(address _target) {
        Target(_target).protected();
    }
}
