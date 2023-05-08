import { Wallet, ethers } from "ethers";
import { generateWallet } from "@/utils";

export const alchemyProvider = new ethers.providers.AlchemyProvider(
  "goerli",
  process.env.ALCHEMY_KEY
);

export const createWallet = (): Wallet => {
  const wallet = generateWallet();
  return new ethers.Wallet(wallet.privateKey, alchemyProvider);
};

export const getWallet = (seedPhrase: string): Wallet => {
  const wallet = generateWallet(seedPhrase);
  return new ethers.Wallet(wallet.privateKey, alchemyProvider);
};
