import { ethers, upgrades } from "hardhat";

async function main() {
  const MyToken = await ethers.getContractFactory("MyErc");
  const MyNft = await ethers.getContractFactory("MyNft");
  const StakeContract = await ethers.getContractFactory("Stake");
  const NftGodContract = await ethers.getContractFactory("NftGodMode");
  const nft = await upgrades.deployProxy(MyNft, {
    kind: "uups",
    unsafeAllow: ["constructor"],
  });
  const godMode = await upgrades.upgradeProxy(nft.address, NftGodContract, {
    kind: "uups",
    unsafeAllow: ["constructor"],
  });
  const token = await upgrades.deployProxy(MyToken, {
    kind: "uups",
    unsafeAllow: ["constructor"],
  });
  const stake = await upgrades.deployProxy(
    StakeContract,
    [token.address, nft.address],
    {
      kind: "uups",
      unsafeAllow: ["constructor"],
    }
  );

  await token.deployed();
  await nft.deployed();
  await stake.deployed();
  await godMode.deployed();
  console.log(`token proxy address ----`, token.address);
  console.log(`nft proxy address ----`, nft.address);
  console.log(`stake proxy address ----`, stake.address);
  console.log(`godmode proxy address ----`, godMode.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
