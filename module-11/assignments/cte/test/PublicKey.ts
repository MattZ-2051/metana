import { ethers } from "hardhat";
import { expect } from "chai";

describe("PublicKey attack", () => {
  it("Solves the challenge", async () => {
    const challengeFactory = await ethers.getContractFactory(
      "PublicKeyChallenge"
    );
    const challengeContract = await challengeFactory.deploy();
    const tx = await challengeContract.deployed();

    const [owner, attacker] = await ethers.getSigners();
    const firstTx = await challengeContract.dummyTx();
    await firstTx.wait();
    expect(firstTx).to.not.be.null;
    // console.log(`firstTx`, JSON.stringify(firstTx, null, 4));
    const txData = {
      gasPrice: firstTx.gasPrice,
      gasLimit: firstTx.gasLimit,
      value: firstTx.value,
      nonce: firstTx.nonce,
      data: firstTx.data,
      to: firstTx.to,
      chainId: firstTx.chainId,
    };
    const signingData = ethers.utils.serializeTransaction(txData);
    const msgHash = ethers.utils.keccak256(signingData);
    const signature = { r: firstTx.r, s: firstTx.s, v: firstTx.v };
    let rawPublicKey = ethers.utils.recoverPublicKey(msgHash, signature);
    // const compressedPublicKey = ethers.utils.computePublicKey(rawPublicKey, true);
    // need to strip of the 0x04 prefix indicating that it's a raw public key
    expect(rawPublicKey.slice(2, 4), "not a raw public key").to.equal(`04`);
    rawPublicKey = `0x${rawPublicKey.slice(4)}`;
    console.log(`Recovered public key ${rawPublicKey}`);
    (await challengeContract.authenticate(rawPublicKey)).wait();
    console.log("is Complete", await challengeContract.isComplete());
  });
});
