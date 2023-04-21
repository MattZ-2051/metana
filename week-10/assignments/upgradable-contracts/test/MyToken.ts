import { ethers, upgrades } from "hardhat";
import { expect } from "chai";

describe("MyUpgradableToken", function () {
  it("deploys initial proxy contract", async () => {
    const MyToken = await ethers.getContractFactory("MyToken");
    // const BoxV2 = await ethers.getContractFactory("BoxV2");

    const instance = await upgrades.deployProxy(MyToken, { kind: "uups" });
    // const upgraded = await upgrades.upgradeProxy(instance.address, BoxV2);

    expect(instance.address.length).to.be.greaterThan(0);
  });

  it("deploys upgradable contract", async () => {
    const MyToken = await ethers.getContractFactory("MyToken");
    const MyTokenV2 = await ethers.getContractFactory("MyTokenV2");

    const instance = await upgrades.deployProxy(MyToken, { kind: "uups" });
    const upgraded = await upgrades.upgradeProxy(instance.address, MyTokenV2);
    const version = await upgraded.version();
    expect(upgraded.address.length).to.be.greaterThan(0);
    expect(version).to.equal("v2");
  });
});
