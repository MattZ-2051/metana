// Setup: npm install alchemy-sdk
import { Alchemy, Network, Utils, Log, BlockTag } from "alchemy-sdk";
import { GasFeeChart } from "../../types";

const config = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

export const alchemyApi = new Alchemy(config);

export const usdcContractAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
export const transferTopic =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export const getTransferLogs = async (
  blocksToGoBack?: number
): Promise<Log[]> => {
  const block = await alchemyApi.core.getBlockNumber();
  const blockNumber = blocksToGoBack ? block - blocksToGoBack : block;
  return await alchemyApi.core.getLogs({
    address: usdcContractAddress,
    topics: [transferTopic],
    fromBlock: Utils.hexlify(blockNumber),
  });
};

export const getGasFeeData = async (): Promise<GasFeeChart[]> => {
  const currentBlockNumber = await alchemyApi.core.getBlockNumber();
  let prevBlockNumber = currentBlockNumber - 10;
  const gasFeeData: GasFeeChart[] = [];
  while (prevBlockNumber <= currentBlockNumber) {
    const block = await alchemyApi.core.getBlock(prevBlockNumber);
    gasFeeData.push({
      gasUsed: block.gasUsed.toNumber(),
      gasLimit: block.gasLimit.toNumber(),
      percentage: (block.gasUsed.toNumber() / block.gasLimit.toNumber()) * 100,
    });
    prevBlockNumber += 1;
  }
  return gasFeeData;
};
