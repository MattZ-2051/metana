import { useEffect, useState } from "react";
import { getLogs, alchemyApi } from "./api/alchemy";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";
import { ChartLog } from "./types";

function App() {
  const [usdcTransferData, setUsdcTransferData] = useState<ChartLog[]>();

  const handleTransferData = async (): Promise<ChartLog[]> => {
    const logs = await getLogs();
    const filteredLogs: ChartLog[] = [];
    for (let i = 0; i < logs.length; i++) {
      const currentLog = logs[i];
      const existingLog = filteredLogs.find(
        (log) => currentLog.blockNumber === log.blockNumber
      );
      if (existingLog) {
        existingLog.amount += parseInt(currentLog.data, 16);
      } else {
        filteredLogs.push({
          blockNumber: currentLog.blockNumber,
          amount: parseInt(currentLog.data, 16),
        });
      }
    }

    return filteredLogs;
  };
  useEffect(() => {
    (async () => {
      const filteredLogs = await handleTransferData();
      setUsdcTransferData(filteredLogs);
    })();
  }, []);

  useEffect(() => {
    alchemyApi.ws.on("block", async (log, event) => {
      const filteredLogs = await handleTransferData();
      setUsdcTransferData(filteredLogs);
    });
  }, []);

  console.log("here", usdcTransferData);

  return (
    <div className="App">
      <h1>USDC Transfer Data</h1>
      <ResponsiveContainer width={1000} height={600}>
        <AreaChart width={1000} height={600} data={usdcTransferData}>
          <XAxis dataKey="blockNumber" width={140} />
          <YAxis dataKey="amount" width={140} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#8884d8"
            fill="#8884d8"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;
