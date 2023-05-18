import { Wallet, ethers } from "ethers";
import {
  encryptItem,
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
  const encryptedKey = encryptItem(account0.privateKey, password).toString();
  handleLocalStorage.setItem(
    "accounts",
    JSON.stringify({ "account-0": encryptedKey })
  );
  return account0;
};

export const setMnemonic = (mnemonic: string, password: string) => {
  const encryptedKey = encryptItem(mnemonic, password);
  handleLocalStorage.setItem("mnemonic", encryptedKey.toString());
};

export const createAccountFromPhrase = (
  seedPhrase: string,
  password: string,
  index: number
): HDNode => {
  const node = ethers.utils.HDNode.fromMnemonic(seedPhrase, password);
  const newAccount = node.derivePath(`m/44'/60'/0'/0/${index}`);
  const encryptedKey = encryptItem(newAccount.privateKey, password).toString();
  const accounts = handleLocalStorage.getItem("accounts");
  if (accounts) {
    const accountsJson = JSON.parse(accounts);
    accountsJson[`account-${index}`] = encryptedKey;
    handleLocalStorage.setItem("accounts", JSON.stringify(accountsJson));
  }

  return newAccount;
};

export const getWallet = (privateKey: string): Wallet => {
  const wallet = generateWallet(privateKey, alchemyProvider);
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
