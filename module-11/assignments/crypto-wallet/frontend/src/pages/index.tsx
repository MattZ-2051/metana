import { useState } from "react";
import { Inter } from "next/font/google";
import { Button, Input } from "antd";
import {
  alchemyProvider,
  createWallet,
  getWallet,
  createWalletFromMnemonic,
} from "@/services/ethers";
import { BigNumber, ethers } from "ethers";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [seedPhrase, setSeedPhrase] = useState<string>();
  const [privateKey, setPrivateKey] = useState<string>();
  const [password, setPassword] = useState<string>();
  const handlePhrase = () => {
    if (password) {
      console.log("wallet", createWallet(password));
    }
  };

  const walletLogin = () => {
    if (privateKey) {
      const wallet = getWallet(privateKey);
      console.log("here", wallet);
    }
  };

  const hdLogin = () => {
    if (seedPhrase) {
      console.log("there", createWalletFromMnemonic(seedPhrase, 1));
    }
  };
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="bg-white w-[400px] h-[400px] rounded-xl p-12 text-black">
        <div className="pb-8">
          <p>Dont Have A wallet?</p>
          <Button
            type="primary"
            onClick={handlePhrase}
            className="mt-4 bg-black"
          >
            Create Wallet
          </Button>
        </div>
        <div className="">
          <p>Seed Phrase</p>
          <Input
            size="large"
            type="text"
            placeholder="Enter Password phrase or key"
            className="p-2 border-[1px] border-black focus:outline-none"
            onChange={(e) => setSeedPhrase(e.target.value)}
          />
          <p>PrivateKey</p>
          <Input
            size="large"
            type="text"
            placeholder="Enter Password phrase or key"
            className="p-2 border-[1px] border-black focus:outline-none"
            onChange={(e) => setPrivateKey(e.target.value)}
          />
          <p>Password</p>
          <Input
            size="large"
            type="text"
            placeholder="Enter Password phrase or key"
            className="p-2 border-[1px] border-black focus:outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="primary"
            onClick={walletLogin}
            className="mt-4 bg-black"
          >
            Login
          </Button>
          <Button type="primary" onClick={hdLogin} className="mt-4 bg-black">
            hd login
          </Button>
        </div>
      </div>
    </main>
  );
}
