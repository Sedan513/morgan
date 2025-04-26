import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const StockChart = ({ data, size = 'small' }) => {
  // Sample data - in a real app, this would come from an API
  const chartData = data || [
    { date: '2024-01-01', price: 150 },
    { date: '2024-01-02', price: 152 },
    { date: '2024-01-03', price: 148 },
    { date: '2024-01-04', price: 155 },
    { date: '2024-01-05', price: 153 },
  ];

  return (
    <div style={{ width: '100%', height: size === 'small' ? 100 : 300 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart; 