import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function SpeciesAdoptionChart({ data }) {
  // ✅ Safety check
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold mb-4">
          📊 Species Adoption Rates
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No adoption data available yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Approve some adoption applications to see analytics
          </p>
        </div>
      </div>
    );
  }

  const highest = data[0];
  const lowest = data[data.length - 1];

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold mb-4">Species Adoption Rates</h3>
      <p className="text-gray-600 mb-4">
        Comparison of adoption rates by species
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="species" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" name="Adoptions" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Analysis:</h4>
        <p className="text-sm text-gray-700 mb-1">
          <strong>Highest:</strong> {highest.species} with {highest.count} adoptions ({highest.percentage}%)
        </p>
        <p className="text-sm text-gray-700">
          <strong>Lowest:</strong> {lowest.species} with {lowest.count} adoptions ({lowest.percentage}%)
        </p>
      </div>
    </div>
  );
}

export default SpeciesAdoptionChart;