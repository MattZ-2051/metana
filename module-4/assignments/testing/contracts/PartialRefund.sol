// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PartialRefund is ERC20, ReentrancyGuard {
    address public immutable owner = msg.sender;
    uint256 public constant maxSupply = 100000000 * (10 ** 18);
    event Log(string message);

    constructor(uint256 initialSupply) ERC20("test", "TST") {
        _mint(msg.sender, initialSupply);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can withdraw");
        _;
    }

    function withdrawEth() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function withdrawTokens() external onlyOwner returns (bool) {
        return this.transfer(owner, balanceOf(address(this)));
    }

    function createTokens() external payable {
        require(msg.value >= 1 ether, "Must send at least 1 ETH");
        require(totalSupply() <= maxSupply, "max supply reached");
        _mint(msg.sender, 1000 * (10 ** 18));
    }

    function sellBack(uint256 amount) external nonReentrant {
        require(balanceOf(msg.sender) >= amount, "Not enough tokens");
        transferFrom(msg.sender, address(this), amount);
        if (amount >= 1000 * (10 ** 18)) {
            uint256 ethToTransfer = ((amount / (1000 * (10 ** 18))) *
                (10 ** 18)) / 2;
            require(
                address(this).balance >= ethToTransfer,
                "Not enough eth in contract sell less tokens"
            );
            payable(msg.sender).transfer(ethToTransfer);
        }
    }

    receive() external payable {}

    fallback() external payable {
        emit Log("fallback called");
    }
}
