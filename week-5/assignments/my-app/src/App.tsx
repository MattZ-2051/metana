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

function App() {
  const [usdcTransferData, setUsdcTransferData] = useState<any>();
  useEffect(() => {
    (async () => {
      const logs = await getLogs();
      // const amount = logs.reduce((prevVal, currentVal) => {
      //   console.log("prevVal", prevVal);
      //   console.log("val", currentVal);
      //   return parseInt(currentVal.data, 16) + prevVal;
      // }, 0);
      // setUsdcTransferData({ amount, blockNumber: logs[0].blockNumber });
    })();
  }, []);

  // useEffect(() => {
  //   alchemyApi.ws.on("block", async (log, event) => {
  //     const res = await getLogs();
  //     const test = res
  //       .map((res) => {
  //         return {
  //           blockNumber: res.blockNumber,
  //           amount: parseInt(res.data, 16) / 1000000,
  //         };
  //       })
  //       .reduce((prev, current) => {
  //         return prev.amount + current.amount;
  //       });
  //     console.log("test", test);
  //   });
  // }, []);

  // console.log("here", usdcTransferData);

  return (
    <div className="App">
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
