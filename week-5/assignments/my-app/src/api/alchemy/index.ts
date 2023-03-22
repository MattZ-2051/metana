// Setup: npm install alchemy-sdk
import { Alchemy, Network, AlchemySubscription, Utils, Log } from "alchemy-sdk";

const config = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

export const alchemyApi = new Alchemy(config);

export const usdcContractAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
export const transferTopic =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const transferFilter = {
  address: usdcContractAddress,
  topics: [Utils.id("Transfer(address,address,uint256)")],
};
export const getLogs = async (): Promise<Log[]> => {
  const block = await alchemyApi.core.getBlockNumber();
  return await alchemyApi.core.getLogs({
    address: usdcContractAddress,
    topics: [transferTopic],
    fromBlock: block - 10,
  });
};

alchemyApi.ws.on("block", async (log, event) => {
  await alchemyApi.core.getLogs({
    address: usdcContractAddress,
    topics: [transferTopic],
  });
});
