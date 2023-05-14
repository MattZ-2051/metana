import { useState } from "react";
import { Button, Input, Dropdown } from "antd";
import { pollPendingTx, sendMatic } from "@/services/ethers";
import { WalletState } from "@/types";
import { ethers } from "ethers";

interface IProps {
  setWalletState: (state: WalletState) => void;
  walletInfo: ethers.Wallet;
}
const SendTx = ({ setWalletState, walletInfo }: IProps) => {
  const [addressToSend, setAddressToSend] = useState<string>();
  const [valueToSend, setValueToSend] = useState<string>();
  const [pendingTx, setPendingTx] = useState<
    "pending" | "none" | "error" | string
  >("none");

  const handleSend = async () => {
    if (walletInfo && addressToSend && valueToSend) {
      setPendingTx("loading");
      try {
        const res = await sendMatic(walletInfo, addressToSend, valueToSend);
        const receipt = await pollPendingTx(res.hash);
        setPendingTx(receipt.transactionHash);
      } catch (err) {
        console.log("err", err);
        setPendingTx("error");
      }
    } else {
      setWalletState("send");
    }
  };
  return (
    <div className="flex flex-col justify-center w-full h-full pb-8">
      <p className="">To</p>
      <Input
        size="large"
        type="text"
        placeholder="Enter Address to send to"
        className="p-2 border-[1px] border-black focus:outline-none"
        onChange={(e) => setAddressToSend(e.target.value)}
      />
      <p className="mt-4">Value</p>
      <Input
        size="large"
        type="number"
        placeholder="Enter Value to Send"
        className="p-2 border-[1px] border-black focus:outline-none"
        onChange={(e) => setValueToSend(e.target.value)}
      />
      <Button
        type="primary"
        onClick={handleSend}
        className="w-full mt-8 bg-black"
      >
        Send
      </Button>
      {pendingTx === "loading" && <p>Tx Pending...</p>}
      {pendingTx === "error" && <p>Error with Tx</p>}
      {typeof pendingTx === "string" &&
        pendingTx !== "none" &&
        pendingTx !== "loading" &&
        pendingTx !== "error" && (
          <a
            href={`https://mumbai.polygonscan.com/tx/${pendingTx}`}
            className="underline"
            rel="noopener"
            target="_blank"
          >
            PolygonScan Link
          </a>
        )}
      <Button
        type="primary"
        onClick={() => setWalletState("created")}
        className="w-full mt-8 bg-black"
      >
        Back
      </Button>{" "}
    </div>
  );
};

export default SendTx;
