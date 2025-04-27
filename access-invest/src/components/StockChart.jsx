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
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // Calculate min and max for the Y-axis to show a reasonable range
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;
  const padding = range * 0.1; // 10% padding

  return (
    <div style={{ width: '100%', height: size === 'small' ? 100 : 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: size === 'small' ? 10 : 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[minPrice - padding, maxPrice + padding]}
            tick={{ fontSize: size === 'small' ? 10 : 12 }}
            tickFormatter={(value) => formatPrice(value)}
            width={size === 'small' ? 60 : 80}
          />
          <Tooltip
            formatter={(value) => formatPrice(value)}
            labelFormatter={(label) => `Time: ${label}`}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            dot={false}
            activeDot={{ r: size === 'small' ? 4 : 8 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart; 