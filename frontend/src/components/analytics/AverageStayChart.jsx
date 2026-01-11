import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function AverageStayChart({ data, overall }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No shelter stay data available yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold mb-4">Average Shelter Stay Duration</h3>
      <p className="text-gray-600 mb-4">
        Average days in shelter before adoption (by species)
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="species" />
          <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="avgDays" fill="#10B981" name="Avg Days" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Key Findings:</h4>
        <p className="text-sm text-gray-700 mb-2">
          <strong>Overall Average:</strong> {overall} days in shelter
        </p>
        {data.map((item, index) => (
          <p key={index} className="text-sm text-gray-700">
            <strong>{item.species}:</strong> {item.avgDays} days average ({item.count} adoptions)
          </p>
        ))}
        <p className="text-xs text-gray-600 mt-2 italic">
          Shorter stays indicate better matching and efficient adoption processes
        </p>
      </div>
    </div>
  );
}

export default AverageStayChart;