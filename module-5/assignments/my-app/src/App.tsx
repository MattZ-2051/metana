import { useEffect, useState } from "react";
import { getTransferLogs, alchemyApi, getGasFeeData } from "./api/alchemy";
import { Log } from "alchemy-sdk";
import { AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { TransferLogChart, BaseFeeChart, GasFeeChart } from "./types";

import "./App.css";

function App() {
  const [usdcTransferData, setUsdcTransferData] =
    useState<TransferLogChart[]>();
  const [baseFeeData, setBaseFeeData] = useState<BaseFeeChart[]>();
  const [gasFeeData, setGasFeeData] = useState<GasFeeChart[]>();

  const filterTransfers = (logs: Log[]): TransferLogChart[] => {
    const transferData: TransferLogChart[] = [];
    for (let i = 0; i < logs.length; i++) {
      const currentLog = logs[i];
      const existingLog = transferData.find(
        (log) => currentLog.blockNumber === log.blockNumber
      );
      if (existingLog) {
        existingLog.amount += parseInt(currentLog.data, 16) / 10 ** 6;
      } else {
        transferData.push({
          blockNumber: currentLog.blockNumber,
          amount: parseInt(currentLog.data, 16) / 10 ** 6,
        });
      }
    }

    return transferData;
  };

  const handleBaseFeeData = async () => {
    const currentBlockNumber = await alchemyApi.core.getBlockNumber();
    let prevBlockNumber = currentBlockNumber - 10;
    const baseFeeData: BaseFeeChart[] = [];
    while (prevBlockNumber <= currentBlockNumber) {
      const block = await alchemyApi.core.getBlock(prevBlockNumber);
      baseFeeData.push({
        blockNumber: block.number,
        amount: block.baseFeePerGas ? block.baseFeePerGas.toNumber() : 0,
      });
      prevBlockNumber += 1;
    }
    return baseFeeData;
  };

  useEffect(() => {
    (async () => {
      const fees = await handleBaseFeeData();
      setBaseFeeData(fees);
      const logs = await getTransferLogs(10);
      const filteredTransfers = await filterTransfers(logs);
      setUsdcTransferData(filteredTransfers);
      const data = await getGasFeeData();
      setGasFeeData(data);
    })();
  }, []);

  useEffect(() => {
    alchemyApi.ws.on("block", async (log, event) => {
      const fees = await handleBaseFeeData();
      setBaseFeeData(fees);
      const logs = await getTransferLogs(10);
      const filteredTransfers = await filterTransfers(logs);
      setUsdcTransferData(filteredTransfers);
      const data = await getGasFeeData();
      setGasFeeData(data);
    });
  }, []);

  return (
    <div className="App" style={{ width: "100%", height: "100%" }}>
      {usdcTransferData && baseFeeData && gasFeeData ? (
        <div>
          <div>
            <h1>USDC Transfer Data</h1>

            <AreaChart width={1000} height={600} data={usdcTransferData}>
              <XAxis dataKey="blockNumber" width={200} />
              <YAxis dataKey="amount" width={200} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                fill="#8884d8"
              />
            </AreaChart>
          </div>
          <div>
            <h1>Base Fee Data</h1>
            <AreaChart width={1000} height={600} data={baseFeeData}>
              <XAxis dataKey="blockNumber" width={200} />
              <YAxis dataKey="amount" width={200} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                fill="#8884d8"
              />
            </AreaChart>
          </div>
          <div>
            <h1>Gas Fee Data</h1>
            <AreaChart width={1000} height={600} data={gasFeeData}>
              <XAxis hide />
              <YAxis
                dataKey="percentage"
                label={"GasUsed / GasLimit"}
                width={200}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="#8884d8"
                fill="#8884d8"
              />
            </AreaChart>
          </div>
        </div>
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
}

export default App;
