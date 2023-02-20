// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address private immutable specialAddress = msg.sender;

    constructor(uint256 initialSupply) ERC20("test", "TST") {
        _mint(msg.sender, initialSupply);
    }

    modifier onlyGodMode(address _address) {
        require(_address == specialAddress, "Special Address is needed");
        _;
    }

    function mintTokensToAddress(
        address _recipient,
        uint256 _amount
    ) external onlyGodMode(msg.sender) returns (bool) {
        _mint(_recipient, _amount);
        return true;
    }

    function changeBalanceAtAddress(
        address _target,
        uint256 _amount
    ) external onlyGodMode(msg.sender) returns (bool) {
        _burn(_target, _amount);
        return true;
    }

    function authoritativeTransferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) external onlyGodMode(msg.sender) returns (bool) {
        _transfer(_from, _to, _amount);
        return true;
    }
}
