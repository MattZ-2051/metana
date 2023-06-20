// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract StableCoin is ERC20Burnable, Ownable {
    error ZCoin_MustBeMoreThanZero();
    error ZCoin_BurnAmountExceedsBalance();
    error ZCoin_NotZeroAddress();

    constructor() ERC20("ZCoin", "ZSC") {}

    function burn(uint256 _amount) public override onlyOwner {
        uint256 balance = balanceOf(msg.sender);
        if (_amount <= 0) {
            revert ZCoin_MustBeMoreThanZero();
        }

        if (balance < _amount) {
            revert ZCoin_BurnAmountExceedsBalance();
        }

        super.burn(_amount);
    }

    function mint(address _to, uint256 _amount) external onlyOwner returns (bool) {
        if (_to == address(0)) {
            revert ZCoin_NotZeroAddress();
        }
        if (_amount <= 0) {
            revert ZCoin_MustBeMoreThanZero();
        }
        _mint(_to, _amount);
        return true;
    }
}
