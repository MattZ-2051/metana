import { ethers, upgrades } from "hardhat";


async function main() {
  const MyToken = await ethers.getContractFactory("MyToken");
  const token = await upgrades.deployProxy(MyToken, {kind:'uups'});

  await token.deployed();
  console.log(
    `deployed`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
