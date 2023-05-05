import { Wallet } from "ethers";

export const generateWallet = (seedPhrase?: string, provider?: any): Wallet => {
  let wallet: Wallet;
  if (!seedPhrase) {
    seedPhrase = Wallet.createRandom({
      provider,
    }).mnemonic.phrase;
  }
  wallet = Wallet.fromMnemonic(seedPhrase);
  return wallet;
};
