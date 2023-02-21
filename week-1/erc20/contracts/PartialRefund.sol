// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PartialRefund is ERC20 {
    address private owner = msg.sender;
    uint256 maxSupply = 100000000;
    uint256 private immutable eth = 1 * 10 ** 18;

    constructor(uint256 initialSupply) ERC20("test", "TST") {
        _mint(msg.sender, initialSupply);
    }

    function withdraw() external {
        require(msg.sender == owner, "only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function createTokens() external payable {
        require(msg.value >= eth, "Must send at least 1 ETH");
        require(totalSupply() <= maxSupply, "max supply reached");
        _mint(msg.sender, 1000);
    }

    function sellBack(uint256 amount) external returns (uint256) {
        require(balanceOf(msg.sender) >= amount, "Not enough tokens");

        uint256 ethToReturn = ((amount / 1000) * eth) / 2;
        require(
            address(this).balance >= eth / 2 &&
                address(this).balance >= ethToReturn,
            "Not enough ether in contract to sell"
        );
        approve(msg.sender, amount);
        transferFrom(msg.sender, address(this), amount);
        payable(msg.sender).transfer(ethToReturn);
        return ethToReturn;
    }
}
