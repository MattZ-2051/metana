export type TransferLogChart = {
  blockNumber: number;
  amount: number;
};

export type BaseFeeChart = {
  blockNumber: number;
  amount: number;
};

export type GasFeeChart = {
  gasUsed: number;
  gasLimit: number;
  percentage: number;
};
