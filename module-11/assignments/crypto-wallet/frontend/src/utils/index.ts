import { Wallet } from "ethers";
import CryptosJs from "crypto-js";

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
  setItem: (value: string) => {
    localStorage.setItem("pass", value);
  },
  removeItem: () => {
    localStorage.removeItem("pass");
  },
  getItem: () => {
    localStorage.getItem("pass");
  },
};
// export const encryptPassword = (password: string, mnemonic: string) => {
//   const hash = CryptosJs.AES.encrypt(mnemonic, password);
// };

// export const decryptPassword = (password: string) => {
//   const value =
// }
