// Setup: npm install alchemy-sdk
import { Alchemy, Network, AlchemySubscription, Utils } from "alchemy-sdk";

const config = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

const usdcContractAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const transferTopic =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const transferFilter = {
  address: usdcContractAddress,
  topics: [Utils.id("Transfer(address,address,uint256)")],
};
export const getLogs = async () => {
  return await alchemy.core.getLogs({
    address: usdcContractAddress,
    topics: [transferTopic],
  });
};

// alchemy.ws.on(transferFilter, (log, event) => {
//   console.log("here", log, event);
// });
