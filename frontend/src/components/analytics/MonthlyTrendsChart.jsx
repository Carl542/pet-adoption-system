import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function MonthlyTrendsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No adoption data available yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold mb-4">Monthly Adoption Trends</h3>
      <p className="text-gray-600 mb-4">
        Number of successful adoptions per month
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3B82F6"
            strokeWidth={2}
            name="Adoptions"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Insight:</strong> Track adoption patterns over time to identify peak months and plan marketing campaigns accordingly.</p>
      </div>
    </div>
  );
}

export default MonthlyTrendsChart;