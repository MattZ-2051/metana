// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenSale is ERC20 {
    address private owner = msg.sender;
    uint256 maxSupply = 1000000000 * (10 ** 18);

    constructor(uint256 initialSupply) ERC20("test", "TST") {
        _mint(msg.sender, initialSupply);
    }

    function withdrawEth() external {
        require(msg.sender == owner, "only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }

    function createTokens() external payable {
        require(msg.value >= 1 ether, "Must send at least 1 ETH");
        require(totalSupply() <= maxSupply, "max supply reached");
        _mint(msg.sender, 1000 * (10 ** 18));
    }

    receive() external payable {}

    fallback() external payable {}
}
