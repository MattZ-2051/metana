import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { Button, Input, Dropdown } from "antd";
import {
  createWallet,
  getWallet,
  getAccountBalance,
  createAccountFromPhrase,
} from "@/services/ethers";
import { ethers } from "ethers";
import { decryptPassword, handleLocalStorage } from "@/utils";
import { AccountInfo, WalletState } from "@/types";
import SendTx from "@/components/SendTx";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [password, setPassword] = useState<string>();
  const [walletState, setWalletState] = useState<WalletState>("notCreated");
  const [walletInfo, setWalletInfo] = useState<ethers.Wallet>();
  const [accountInfo, setAccountInfo] = useState<AccountInfo>();
  const [seedPhrase, setSeedPhrase] = useState<string>();
  const [otherAccounts, setOtherAccounts] = useState<
    | {
        account: AccountInfo;
        index: number;
      }[]
    | undefined
  >();

  useEffect(() => {
    if (handleLocalStorage.getAccounts("account-0")) {
      setWalletState("login");
      if (handleLocalStorage.getAccounts("account-1")) {
        const accounts = handleLocalStorage.getItem("accounts");
        if (accounts && password) {
          const accountsJson = JSON.parse(accounts);
          const otherAccountsArr: { account: AccountInfo; index: number }[] =
            [];
          for (const account in accountsJson) {
            if (parseInt(account.split("-")[1], 10) > 0) {
              const cipher = accountsJson[account];
              const key = decryptPassword(cipher, password).toString();
              const newAccount = getWallet(key);
              const newAccountInfo = {
                address: newAccount.address,
                balance: "0",
              };
              otherAccountsArr.push({
                account: newAccountInfo,
                index: parseInt(account.split("-")[1], 10),
              });
            }
          }

          console.log("asdfasd", otherAccountsArr);
          setOtherAccounts((prevState) => {
            return prevState && prevState.length > 0
              ? [...prevState, ...otherAccountsArr]
              : otherAccountsArr;
          });
        }
      }
    }
  }, []);

  const handleWalletCreate = async () => {
    if (password) {
      const wallet = createWallet(password);
      const balance = await getAccountBalance(wallet.address);
      setSeedPhrase(wallet.mnemonic?.phrase);
      setAccountInfo({ address: wallet.address, balance });
      setWalletState("created");

      setWalletInfo(getWallet(wallet.privateKey));
    } else {
      setWalletState("pending");
    }
  };

  const handleAccountBalance = async () => {
    if (accountInfo?.address) {
      const balance = await getAccountBalance(accountInfo.address);
      setAccountInfo((prevState) => ({ ...prevState, balance }));
    }
  };

  useEffect(() => {
    (async () => {
      await handleAccountBalance();
    })();
  }, [walletState]);

  const handleWalletLogin = async () => {
    if (password) {
      const cipher = handleLocalStorage.getAccounts("account-0");
      if (cipher) {
        const key = decryptPassword(cipher, password).toString();
        const wallet = getWallet(key);
        const balance = await getAccountBalance(wallet.address);
        setWalletInfo(wallet);
        setWalletState("created");
        setAccountInfo({ address: wallet.address, balance });
      }
    }
  };

  const createAccount = () => {
    if (seedPhrase && password) {
      const newAccount = createAccountFromPhrase(seedPhrase, password, 1);
      const newAccountInfo = {
        address: newAccount.address,
        balance: "0",
      };
      setOtherAccounts((prevState) => {
        return prevState
          ? [
              ...prevState,
              {
                account: newAccountInfo,
                index: prevState[prevState.length - 1].index + 1,
              },
            ]
          : undefined;
      });
    }
  };

  console.log("otherAccounts", otherAccounts);
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="bg-white w-[600px] h-[500px] rounded-xl p-12 text-black flex items-center justify-center">
        {walletState === "notCreated" && (
          <div className="flex flex-col items-center justify-center w-full h-full pb-8">
            <p className="text-center">Dont have a wallet?</p>
            <Button
              type="primary"
              onClick={handleWalletCreate}
              className="w-full mt-4 bg-black"
            >
              Create Wallet
            </Button>
          </div>
        )}
        {walletState === "pending" && (
          <div className="flex flex-col justify-center w-full h-full pb-8">
            <p className="">Password</p>
            <Input
              size="large"
              type="text"
              placeholder="Enter Password phrase or key"
              className="p-2 border-[1px] border-black focus:outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="primary"
              onClick={handleWalletCreate}
              className="w-full mt-8 bg-black"
            >
              Create Wallet
            </Button>
          </div>
        )}

        {walletState === "login" && (
          <div className="">
            <p>Password</p>
            <Input
              size="large"
              type="text"
              placeholder="Enter Password"
              className="p-2 border-[1px] border-black focus:outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="primary"
              onClick={handleWalletLogin}
              className="w-full mt-8 bg-black"
            >
              Login
            </Button>
          </div>
        )}
        {walletState === "created" && (
          <div>
            <div className="flex items-center justify-between w-full mb-8">
              <Button
                type="primary"
                className="bg-black"
                onClick={createAccount}
              >
                Create Account
              </Button>{" "}
              {otherAccounts && otherAccounts.length >= 1 && (
                <Dropdown
                  menu={{ items: [{ key: "1", label: "address" }] }}
                  placement="bottom"
                >
                  <Button>Switch Account</Button>
                </Dropdown>
              )}
            </div>
            <p className="mb-8 text-xl text-center">Wallet Info</p>
            <p>Address</p>
            <p className="">{accountInfo?.address}</p>
            <p className="mt-4">Balance</p>
            <p>{accountInfo?.balance}</p>
            <Button
              type="primary"
              onClick={() => setWalletState("send")}
              className="w-full mt-8 bg-black"
            >
              Send Matic
            </Button>{" "}
            {/* <Button type="primary" className="w-full mt-8 bg-black">
              Send ERC20 Tokens
            </Button>{" "} */}
          </div>
        )}
        {walletState === "send" && walletInfo && (
          <div>
            <SendTx walletInfo={walletInfo} setWalletState={setWalletState} />
          </div>
        )}
      </div>
    </main>
  );
}
