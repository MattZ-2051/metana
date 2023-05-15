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
  getItem: (key: string): string | null => {
    const storage = localStorage.getItem("accounts");
    if (storage) {
      const accounts = JSON.parse(storage);
      return localStorage.getItem(accounts[key]);
    } else {
      return null;
    }
  },
};
export const encryptPassword = (
  mnemonic: string,
  password: string
): CryptoJs.lib.CipherParams => {
  return CryptoJs.AES.encrypt(mnemonic, password);
};

export const decryptPassword = (cipherText: string, password: string) => {
  const bytes = CryptoJs.AES.decrypt(cipherText, password);
  return bytes.toString(CryptoJs.enc.Utf8);
};
