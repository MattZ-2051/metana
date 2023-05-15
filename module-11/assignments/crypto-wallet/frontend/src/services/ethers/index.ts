import { Wallet, ethers } from "ethers";
import {
  encryptPassword,
  generateRandomWallet,
  generateWallet,
  handleLocalStorage,
} from "@/utils";
import { HDNode } from "ethers/lib/utils.js";

export const alchemyProvider = new ethers.providers.AlchemyProvider(
  "maticmum",
  "C4HiLlq-SWhROd7OoiTuXbZ_jD9YzfVp"
);

export const createWallet = (password: string): HDNode => {
  const wallet = generateRandomWallet(alchemyProvider);
  const node = ethers.utils.HDNode.fromMnemonic(
    wallet.mnemonic.phrase,
    password
  );
  const account0 = node.derivePath("m/44'/60'/0'/0/0");
  const encryptedKey = encryptPassword(
    account0.privateKey,
    password
  ).toString();
  handleLocalStorage.setItem(
    "accounts",
    JSON.stringify({ "account-0": encryptedKey })
  );
  return account0;
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

export const getAccountBalance = async (address: string): Promise<string> => {
  const balance = await alchemyProvider.getBalance(address);
  return ethers.utils.formatEther(balance);
};

export const sendMatic = async (
  wallet: Wallet,
  to: string,
  value: string
): Promise<ethers.providers.TransactionResponse> => {
  const nonce = await alchemyProvider.getTransactionCount(wallet.address);
  const gasPrice = await alchemyProvider.getGasPrice();
  const tx = {
    nonce: ethers.utils.hexlify(nonce),
    gasPrice: ethers.utils.hexlify(gasPrice),
    gasLimit: ethers.utils.hexlify(21000),
    to,
    value: ethers.utils.parseEther(value.toString()).toHexString(),
    data: "",
    chainId: 80001,
  };
  return await wallet.sendTransaction(tx);
};

export const pollPendingTx = async (
  txHash: string
): Promise<ethers.providers.TransactionReceipt> => {
  const tx = await alchemyProvider.waitForTransaction(txHash);
  return tx;
};
