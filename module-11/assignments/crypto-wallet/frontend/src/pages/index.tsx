import { Inter } from "next/font/google";
import { Button, Input } from "antd";
import { generateWallet } from "@/utils";
import { alchemyProvider, createWallet } from "@/services/ethers";
import { BigNumber, ethers } from "ethers";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const handlePhrase = async () => {
    const wallet = await createWallet();
    console.log("address", wallet.address);
    console.log(
      "balance",
      ethers.utils.formatEther(await alchemyProvider.getBalance(wallet.address))
    );
  };
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="bg-white w-[400px] h-[400px] rounded-xl p-12 text-black">
        <div className="pb-8">
          <p>Dont Have A wallet?</p>
          <Button type="primary" onClick={handlePhrase} className="bg-black">
            Generate Wallet
          </Button>
        </div>
        <div>
          <p>Fetch Wallet</p>
          <Input
            size="large"
            type="text"
            placeholder="Enter Password phrase or key"
            className="p-2 border-[1px] border-black focus:outline-none"
          />
        </div>
      </div>
    </main>
  );
}
