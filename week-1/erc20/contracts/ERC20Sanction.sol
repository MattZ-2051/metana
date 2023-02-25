// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address private immutable authority = msg.sender;

    event Sanction(address indexed account, bool indexed sanctioned);
    mapping(address => bool) public sanctionedList;

    modifier sanctioned(
        address _from,
        address _to,
        uint256 _amount
    ) {
        _;
    }

    constructor(uint256 initialSupply) ERC20("test", "TST") {
        _mint(msg.sender, initialSupply);
    }

    function addToSanctionedList(address account) external {
        sanctionedList[account] = true;
        emit Sanction(account, sanctionedList[account]);
    }

    function removeFromSanctionedList(address account) external {
        sanctionedList[account] = false;
        emit Sanction(account, sanctionedList[account]);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override sanctioned(from, to, amount) {
        require(sanctionedList[from] == false, "Address is sanctioned");
        require(sanctionedList[to] == false, "Address is sanctioned");
    }
}
