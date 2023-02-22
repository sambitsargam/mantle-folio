import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import axios from "axios";

const PriceGraph = () => {
  const [priceData, setPriceData] = useState([]);

  useEffect(() => {
    const fetchTokenPriceData = async () => {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/bitdao/market_chart?vs_currency=usd&days=30"
      );
      setPriceData(response.data.prices);
    };
    fetchTokenPriceData();
  }, []);

  const data = priceData.map((price) => ({
    name: new Date(price[0]).toLocaleDateString(),
    price: price[1],
  }));

  return (
    <LineChart width={1300} height={300} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <CartesianGrid strokeDasharray="3 4" />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="price" stroke="#0d7ebf" activeDot={{ r: 11 }} />
    </LineChart>
  );
};

export default PriceGraph;
