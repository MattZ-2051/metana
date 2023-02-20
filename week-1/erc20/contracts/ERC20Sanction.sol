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
        require(sanctionedList[_from] == false, "Address is sanctioned");
        require(sanctionedList[_to] == false, "Address is sanctioned");
        _;
    }

    modifier onlyAuthority(address _address) {
        require(_address == authority, "Not Authorized");
        _;
    }

    constructor(uint256 initialSupply) ERC20("test", "TST") {
        _mint(msg.sender, initialSupply);
    }

    function addToSanctionedList(
        address account
    ) public onlyAuthority(msg.sender) {
        sanctionedList[account] = true;
        emit Sanction(account, sanctionedList[account]);
    }

    function removeFromSanctionedList(
        address account
    ) public onlyAuthority(msg.sender) {
        sanctionedList[account] = false;
        emit Sanction(account, sanctionedList[account]);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override sanctioned(from, to, amount) {
        sanctionedList[msg.sender] = false;
    }
}
