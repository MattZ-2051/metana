import { useEffect, useState } from "react";
import { getLogs } from "./api/alchemy";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

function App() {
  const [usdcTransferData, setUsdcTransferData] = useState<any>();
  useEffect(() => {
    (async () => {
      const res = await getLogs();
      setUsdcTransferData(
        res.map((res) => {
          return {
            blockNumber: res.blockNumber,
            amount: parseInt(res.data, 16),
          };
        })
      );
    })();
  }, []);

  console.log("here", usdcTransferData);

  return (
    <div className="App">
      <ResponsiveContainer width={1000} height={600}>
        <AreaChart width={1000} height={600} data={usdcTransferData}>
          <XAxis dataKey="blocknumber" width={80} />
          <YAxis dataKey="amount" width={100} />
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
