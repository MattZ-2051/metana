import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("PartialRefund", function () {
  async function deployPartialRefund() {
    const [owner, otherAccount] = await ethers.getSigners();
    const PartialRefund = await ethers.getContractFactory("PartialRefund");
    const contract = await PartialRefund.deploy(ethers.BigNumber.from(1000));
    const provider = ethers.provider;
    const tenEther = ethers.utils.hexStripZeros(
      ethers.utils.parseEther("10").toHexString()
    );
    await provider.send("hardhat_setBalance", [contract.address, tenEther]);
    return { contract, owner, otherAccount };
  }

  it("should set the right owner", async function () {
    const { contract, owner } = await loadFixture(deployPartialRefund);

    expect(await contract.owner()).to.equal(owner.address);
  });

  it("should be deployed with erc token initialy supply sent to contract creator", async () => {
    const { contract, owner } = await loadFixture(deployPartialRefund);
    const userBalance = await contract.balanceOf(owner.address);
    expect(userBalance).to.equal(ethers.BigNumber.from(1000));
  });

  it("should let contract owner withdraw eth from contract", async () => {
    const { contract, owner } = await loadFixture(deployPartialRefund);
    const provider = ethers.provider;
    const txWithdraw = await contract.withdrawEth();
    await txWithdraw.wait();
    expect(await provider.getBalance(contract.address)).to.equal(
      ethers.BigNumber.from(0)
    );
    expect(await owner.getBalance()).to.be.closeTo(
      ethers.utils.parseEther("9999"),
      ethers.utils.parseEther("10000")
    );
  });

  it("should revert if non owner tries to withdraw eth", async () => {
    const { contract, otherAccount } = await loadFixture(deployPartialRefund);
    await expect(
      contract.connect(otherAccount).withdrawEth()
    ).to.be.revertedWith("only owner can withdraw");
  });

  it("should let a user create tokens if they send at least 1 ether", async () => {
    const { contract, otherAccount } = await loadFixture(deployPartialRefund);
    const tx = await contract
      .connect(otherAccount)
      .createTokens({ value: ethers.utils.parseEther("1") });
    tx.wait();
    expect(await contract.balanceOf(otherAccount.address)).to.be.equal(
      ethers.utils.parseEther("1000")
    );
  });

  it("should fail if a user tries to create tokens and sends less than 1 ether", async () => {
    const { contract, otherAccount } = await loadFixture(deployPartialRefund);
    await expect(
      contract
        .connect(otherAccount)
        .createTokens({ value: ethers.BigNumber.from(0) })
    ).to.be.revertedWith("Must send at least 1 ETH");
  });

  it("should revert if the max supply is reached", async () => {
    const PartialRefund = await ethers.getContractFactory("PartialRefund");
    const contract = await PartialRefund.deploy(
      ethers.utils.parseEther("20000000000")
    );
    await expect(
      contract.createTokens({ value: ethers.utils.parseEther("1") })
    ).to.be.revertedWith("max supply reached");
  });

  it("should revert if the user tries to sell back more tokens than they have", async () => {
    const { contract, otherAccount } = await loadFixture(deployPartialRefund);
    await expect(
      contract.connect(otherAccount).sellBack(ethers.utils.parseEther("1000"))
    ).to.be.revertedWith("Not enough tokens");
  });

  it("should not return eth if user sells less than 1000 tokens", async () => {
    const { contract, otherAccount } = await loadFixture(deployPartialRefund);
    const provider = ethers.provider;
    const threeEther = ethers.utils.hexStripZeros(
      ethers.utils.parseEther("3").toHexString()
    );
    await provider.send("hardhat_setBalance", [
      otherAccount.address,
      threeEther,
    ]);
    const tx1 = await contract
      .connect(otherAccount)
      .createTokens({ value: ethers.utils.parseEther("1") });
    await tx1.wait();
    const approvalTx = await contract
      .connect(otherAccount)
      .approve(otherAccount.address, ethers.utils.parseEther("2000"));
    await approvalTx.wait();
    const sellBackTx = await contract
      .connect(otherAccount)
      .sellBack(ethers.utils.parseEther("10"));
    await sellBackTx.wait();
    expect(
      ethers.BigNumber.from(await otherAccount.getBalance())
    ).to.be.closeTo(
      ethers.utils.parseEther("1.9"),
      ethers.utils.parseEther("2")
    );
  });

  it("should return 0.5 eth for every 1000 tokens sold back", async () => {
    const { contract, otherAccount } = await loadFixture(deployPartialRefund);
    const provider = ethers.provider;
    const threeEther = ethers.utils.hexStripZeros(
      ethers.utils.parseEther("3").toHexString()
    );

    await provider.send("hardhat_setBalance", [
      otherAccount.address,
      threeEther,
    ]);
    const tx1 = await contract
      .connect(otherAccount)
      .createTokens({ value: ethers.utils.parseEther("1") });
    await tx1.wait();
    const tx2 = await contract
      .connect(otherAccount)
      .createTokens({ value: ethers.utils.parseEther("1") });
    await tx2.wait();
    const approvalTx = await contract
      .connect(otherAccount)
      .approve(otherAccount.address, ethers.utils.parseEther("2000"));
    approvalTx.wait();
    const tx3 = await contract
      .connect(otherAccount)
      .sellBack(ethers.utils.parseEther("2000"));
    await tx3.wait();
    expect(
      ethers.BigNumber.from(await otherAccount.getBalance())
    ).to.be.closeTo(
      ethers.utils.parseEther("1.9"),
      ethers.utils.parseEther("2")
    );
  });
});
