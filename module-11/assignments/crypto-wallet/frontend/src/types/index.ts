export type WalletState =
  | "notCreated"
  | "pending"
  | "created"
  | "login"
  | "send"
  | "accountSwitch";

export type PendingTx = "pending" | "none" | "error" | string;

export type AccountInfo = {
  address: string;
  balance: string;
};
