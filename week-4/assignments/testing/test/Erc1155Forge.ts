import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Forge", function () {
  async function deployContract() {
    const [owner, otherAccount] = await ethers.getSigners();
    const PartialRefund = await ethers.getContractFactory("Forge");
    const contract = await PartialRefund.deploy();
    const provider = ethers.provider;
    const tenEther = ethers.utils.hexStripZeros(
      ethers.utils.parseEther("10").toHexString()
    );

    await provider.send("hardhat_setBalance", [contract.address, tenEther]);
    return { contract, owner, otherAccount };
  }

  it("should let you mint token ids 0 - 2", async () => {
    const { contract, otherAccount } = await loadFixture(deployContract);
    await (await contract.connect(otherAccount).mint(0)).wait();
    await time.increase(65);
    await (await contract.connect(otherAccount).mint(1)).wait();
    await time.increase(65);
    await (await contract.connect(otherAccount).mint(2)).wait();
  });

  it("should fail if you mint token ids outside of 0 - 2", async () => {
    const { contract } = await loadFixture(deployContract);
    await expect(contract.mint(4)).to.be.revertedWith(
      "can only mint token ids 0-2 with this function"
    );
  });

  it("should fail if you dont wait 1 minute before minting again", async () => {
    const { contract, otherAccount } = await loadFixture(deployContract);
    await (await contract.connect(otherAccount).mint(0)).wait();
    await expect(contract.connect(otherAccount).mint(1)).to.be.revertedWith(
      "must wait 1 minute before minting again"
    );
  });

  it("should fail if you try to receive tokens outside of ids 0 - 2 in trade", async () => {
    const { contract } = await loadFixture(deployContract);
    await expect(contract.trade(0, 3)).to.be.revertedWith(
      "can only trade for tokens 0 - 2"
    );
  });

  it("should fail if you try to send tokens outside of ids 0 - 6 in trade", async () => {
    const { contract } = await loadFixture(deployContract);
    await expect(contract.trade(7, 2)).to.be.revertedWith(
      "token id not in collection"
    );
  });

  it("should fail if you try to trade for the same token", async () => {
    const { contract } = await loadFixture(deployContract);
    await expect(contract.trade(2, 2)).to.be.revertedWith(
      "cannot trade for the same token"
    );
  });

  it("should successfully trade token 2 for token 0", async () => {
    const { contract, owner } = await loadFixture(deployContract);

    await (await contract.mint(2)).wait();
    await (await contract.trade(2, 0)).wait();
    expect(await contract.balanceOf(owner.address, 2)).to.be.equal(
      ethers.BigNumber.from(0)
    );
    expect(await contract.balanceOf(owner.address, 0)).to.be.equal(
      ethers.BigNumber.from(1)
    );
  });

  it("should fail to forge if token id to forge is outside of 3 - 6", async () => {
    const { contract } = await loadFixture(deployContract);
    await expect(contract.forge(0)).to.be.revertedWith("id must be 3-6");
  });

  it("should forge token 3 if you have tokens 0 and 1", async () => {
    const { contract, owner } = await loadFixture(deployContract);
    await (await contract.mint(0)).wait();
    await time.increase(65);
    await (await contract.mint(1)).wait();
    await (await contract.forge(3)).wait();
    expect(await contract.balanceOf(owner.address, 3)).to.be.equal(
      ethers.BigNumber.from(1)
    );
  });

  it("should forge token 4 if you have tokens 1 and 2", async () => {
    const { contract, owner } = await loadFixture(deployContract);
    await (await contract.mint(2)).wait();
    await time.increase(65);
    await (await contract.mint(1)).wait();
    await (await contract.forge(4)).wait();
    expect(await contract.balanceOf(owner.address, 4)).to.be.equal(
      ethers.BigNumber.from(1)
    );
  });

  it("should forge token 5 if you have tokens 0 and 2", async () => {
    const { contract, owner } = await loadFixture(deployContract);
    await (await contract.mint(0)).wait();
    await time.increase(65);
    await (await contract.mint(2)).wait();
    await (await contract.forge(5)).wait();
    expect(await contract.balanceOf(owner.address, 5)).to.be.equal(
      ethers.BigNumber.from(1)
    );
  });

  it("should forge token 6 if you have tokens 0, 1, and 2", async () => {
    const { contract, owner } = await loadFixture(deployContract);
    await (await contract.mint(0)).wait();
    await time.increase(65);
    await (await contract.mint(1)).wait();
    await time.increase(65);
    await (await contract.mint(2)).wait();
    await (await contract.forge(6)).wait();
    expect(await contract.balanceOf(owner.address, 6)).to.be.equal(
      ethers.BigNumber.from(1)
    );
  });

  it("should fail to forge token id if you dont have necessary tokens", async () => {
    const { contract } = await loadFixture(deployContract);
    await (await contract.mint(0)).wait();
    await expect(contract.forge(3)).to.be.revertedWith(
      "ERC1155: burn amount exceeds balance"
    );
  });

  it("should not let anyone but contract call mint function on erc contract", async () => {
    const { contract, owner } = await loadFixture(deployContract);
    const tokenContract = ethers.getContractAt(
      "MyToken",
      await contract.myToken()
    );
    await expect(
      (await tokenContract).mintTo(owner.address, 1)
    ).to.be.revertedWith("only forge contract can call this");
  });

  it("should not let anyone but contract call burn function on erc contract", async () => {
    const { contract, owner } = await loadFixture(deployContract);
    const tokenContract = ethers.getContractAt(
      "MyToken",
      await contract.myToken()
    );
    await expect(
      (await tokenContract).burn(owner.address, 1)
    ).to.be.revertedWith("only forge contract can call this");
  });

  it("should not let anyone but contract call burn batch function on erc contract", async () => {
    const { contract, owner } = await loadFixture(deployContract);
    const tokenContract = ethers.getContractAt(
      "MyToken",
      await contract.myToken()
    );
    await expect(
      (await tokenContract).burnBatch(owner.address, [1, 1], [1, 1])
    ).to.be.revertedWith("only forge contract can call this");
  });
});
