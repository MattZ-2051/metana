import { Wallet } from "ethers";
import CryptoJs from "crypto-js";

export const generateWallet = (privateKey: string, provider: any): Wallet => {
  let wallet: Wallet;
  wallet = new Wallet(privateKey, provider);
  return wallet;
};

export const generateRandomWallet = (provider: any): Wallet => {
  return Wallet.createRandom({
    provider,
  });
};

export const handleLocalStorage = {
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
  getAccounts: (key: string): string | null => {
    const storage = localStorage.getItem("accounts");
    if (storage) {
      const accounts = JSON.parse(storage);
      return accounts[key];
    } else {
      return null;
    }
  },
  getItem: (key: string): string | null => {
    return localStorage.getItem(key);
  },
};
export const encryptItem = (
  message: string,
  key: string
): CryptoJs.lib.CipherParams => {
  return CryptoJs.AES.encrypt(message, key);
};

export const decryptItem = (cipherText: string, password: string) => {
  const bytes = CryptoJs.AES.decrypt(cipherText, password);
  return bytes.toString(CryptoJs.enc.Utf8);
};
