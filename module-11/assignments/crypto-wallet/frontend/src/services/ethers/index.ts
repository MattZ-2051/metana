import { Wallet, ethers } from "ethers";
import { generateRandomWallet, generateWallet } from "@/utils";
import { HDNode } from "ethers/lib/utils.js";

export const alchemyProvider = new ethers.providers.AlchemyProvider("goerli");

export const createWallet = (password: string): HDNode => {
  const wallet = generateRandomWallet(alchemyProvider);
  const node = ethers.utils.HDNode.fromMnemonic(
    wallet.mnemonic.phrase,
    password
  );
  return node.derivePath("m/44'/60'/0'/0/0");
};

export const createWalletFromMnemonic = (
  mnemonic: string,
  index: number
): HDNode => {
  const node = ethers.utils.HDNode.fromMnemonic(mnemonic, "password");
  return node.derivePath(`m/44'/60'/0'/0/${index}`);
};

export const getWallet = (privateKey: string): Wallet => {
  const wallet = generateWallet(privateKey, alchemyProvider);
  console.log("wallet mnemonic", wallet.mnemonic);
  return wallet;
};
