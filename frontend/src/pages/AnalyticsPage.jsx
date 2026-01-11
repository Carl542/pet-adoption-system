import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMonthlyAdoptionTrends,
  getSpeciesAdoptionRates,
  getAverageShelterStay,
  getOverallStatistics
} from '../services/analyticsService';
import MonthlyTrendsChart from '../components/analytics/MonthlyTrendsChart';
import SpeciesAdoptionChart from '../components/analytics/SpeciesAdoptionChart';
import AverageStayChart from '../components/analytics/AverageStayChart';

function AnalyticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [speciesRates, setSpeciesRates] = useState([]);
  const [shelterStay, setShelterStay] = useState({ data: [], overall: 0 });

  useEffect(() => {
    fetchAllAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllAnalytics = async () => {
  try {
    setLoading(true);

    const [statsRes, trendsRes, speciesRes, stayRes] = await Promise.all([
      getOverallStatistics(),
      getMonthlyAdoptionTrends(),
      getSpeciesAdoptionRates(),
      getAverageShelterStay()
    ]);

    // Debug logs
    console.log('Stats Response:', statsRes);
    console.log('Trends Response:', trendsRes);
    console.log('Species Response:', speciesRes);
    console.log('Stay Response:', stayRes);

    // Set data with proper error checking
    if (statsRes.data && !statsRes.error) {
      setStats(statsRes.data);
    } else {
      console.error('Stats error:', statsRes.error);
    }

    if (trendsRes.data && Array.isArray(trendsRes.data) && !trendsRes.error) {
      setMonthlyTrends(trendsRes.data);
    } else {
      console.error('Trends error:', trendsRes.error);
      setMonthlyTrends([]);
    }

    if (speciesRes.data && Array.isArray(speciesRes.data) && !speciesRes.error) {
      setSpeciesRates(speciesRes.data);
    } else {
      console.error('Species error:', speciesRes.error);
      setSpeciesRates([]);
    }

    if (stayRes.data && !stayRes.error) {
      setShelterStay({ 
        data: Array.isArray(stayRes.data) ? stayRes.data : [], 
        overall: stayRes.overall || 0 
      });
    } else {
      console.error('Stay error:', stayRes.error);
      setShelterStay({ data: [], overall: 0 });
    }

  } catch (error) {
    console.error('Error fetching analytics:', error);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm mb-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                📊 Analytics Dashboard
              </h1>
              <p className="text-gray-600">Business Intelligence & Insights</p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              ← Back to Admin
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-8">
        {/* Overall Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-gray-600 text-sm mb-1">Total Pets</div>
              <div className="text-3xl font-bold text-gray-800">{stats.totalPets}</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-gray-600 text-sm mb-1">Available</div>
              <div className="text-3xl font-bold text-green-600">{stats.availablePets}</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-gray-600 text-sm mb-1">Adopted</div>
              <div className="text-3xl font-bold text-blue-600">{stats.adoptedPets}</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-gray-600 text-sm mb-1">Adoption Rate</div>
              <div className="text-3xl font-bold text-purple-600">{stats.adoptionRate}%</div>
            </div>
          </div>
        )}

        {/* Business Questions Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📈 Business Questions Analysis
          </h2>
        </div>

        {/* Question 1: Monthly Trends */}
        <div className="mb-8">
          <MonthlyTrendsChart data={monthlyTrends} />
        </div>

        {/* Question 2: Species Rates */}
        <div className="mb-8">
          <SpeciesAdoptionChart data={speciesRates} />
        </div>

        {/* Question 3: Shelter Stay */}
        <div className="mb-8">
          <AverageStayChart data={shelterStay.data} overall={shelterStay.overall} />
        </div>

        {/* Additional Insights */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-bold mb-4">📋 Summary & Recommendations</h3>
          
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Adoption Trends</h4>
              <p className="text-sm text-blue-800">
                Monitor monthly patterns to optimize marketing efforts during peak adoption seasons.
                Consider special promotions during slower months.
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Species Performance</h4>
              <p className="text-sm text-green-800">
                Focus on species with lower adoption rates by highlighting their unique qualities.
                Consider specialized campaigns for underadopted species.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Shelter Efficiency</h4>
              <p className="text-sm text-purple-800">
                Shorter shelter stays indicate effective matching. Species with longer stays may need
                additional marketing or behavioral support programs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;