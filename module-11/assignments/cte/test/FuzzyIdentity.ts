import { expect } from "chai";
import crypto from "crypto";
import { BigNumber, Wallet, utils } from "ethers";
import { ethers } from "hardhat";

// function getWallet() {
//   let wallet: Wallet;
//   let walletFound = false;
//   let contractAddress;
//   let counter = 0;
//   let privateKey;
//   while (!walletFound) {
//     privateKey = `0x${crypto.randomBytes(32).toString("hex")}`;
//     wallet = new ethers.Wallet(privateKey);

//     contractAddress = utils.getContractAddress({
//       from: wallet.address,
//       nonce: BigNumber.from("0"), // First deployed contract with this address
//     });

//     if (contractAddress.toLowerCase().includes("badc0de")) {
//       console.log("found", privateKey);
//       walletFound = true;
//       return wallet;
//     }

//     counter++;
//     if (counter % 1000 === 0) {
//       console.log(`checked ${counter} addresses`);
//     }
//   }
// }

describe("FuzzyIdentity attack", () => {
  it("Solves the challenge", async () => {
    const challengeFactory = await ethers.getContractFactory("FuzzyIdentityChallenge");
    const challengeContract = await challengeFactory.deploy();
    await challengeContract.deployed();

    const [owner] = await ethers.getSigners();

    // const wallet = getWallet();
    // pre-generated address with the getWalet() function
    const wallet = new Wallet("0x755f6b0d4deb230802ff19634dedf3916fb0f4c9bac7c036ee9cadba8e7e66dd", owner.provider);

    let tx;
    tx = await owner.sendTransaction({
      to: wallet.address,
      value: utils.parseEther("0.1"),
    });
    await tx.wait();

    const attackFactory = await ethers.getContractFactory("Hack");
    const attackContract = await attackFactory.connect(wallet).deploy(challengeContract.address);
    await attackContract.deployed();

    tx = await attackContract.attack();
    await tx.wait();

    expect(await challengeContract.isComplete()).to.be.true;
  });
});
