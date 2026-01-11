import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserApplications } from '../services/adoptionService';
import { getCurrentUser } from '../services/authService';

function MyApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const user = getCurrentUser();
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        const { data, error } = await getUserApplications(user.email);
        
        if (error) {
          console.error('Error:', error);
          alert('Failed to load applications: ' + error);
        } else {
          console.log('Applications loaded:', data);
          setApplications(data || []);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        alert('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return '⏳';
      case 'Approved':
        return '✅';
      case 'Rejected':
        return '❌';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Applications</h1>
            <p className="text-gray-600 mt-1">
              Track the status of your pet adoption applications
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold shadow-md"
          >
            ← Back to Home
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-md">
            <div className="text-6xl mb-4">🐾</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Applications Yet</h2>
            <p className="text-xl text-gray-600 mb-6">
              You haven't applied to adopt any pets yet
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold text-lg shadow-md"
            >
              Browse Available Pets
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => {
              // Safely access pet data from dim_pet
              const pet = app.dim_pet || {};
              const petName = pet.pet_name || 'Unknown Pet';
              const petPhoto = pet.photo_url || 'https://via.placeholder.com/150/cccccc/666666?text=No+Photo';
              const petBreed = pet.breed || 'Unknown';
              const petSpecies = pet.species || 'Unknown';

              return (
                <div 
                  key={app.adoption_id || app.fact_id} 
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left side - Pet Image and Name */}
                    <div className="flex-shrink-0 text-center md:text-left">
                      <div className="relative inline-block">
                        <img
                          src={petPhoto}
                          alt={petName}
                          className="w-32 h-32 md:w-40 md:h-40 rounded-lg object-cover bg-gray-200 shadow-md border-4 border-gray-100"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150/cccccc/666666?text=No+Photo';
                          }}
                        />
                        {app.status === 'Approved' && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg">
                            ✓
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mt-3">
                        {petName}
                      </h3>
                      <p className="text-gray-600 text-sm font-medium">
                        {petBreed}
                      </p>
                    </div>

                    {/* Right side - Application Info */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <p className="text-gray-700 font-medium text-lg mb-1">
                            {petSpecies} • {pet.gender || 'Unknown'} • {pet.size || 'Unknown'}
                          </p>
                          {pet.age_years !== undefined && (
                            <p className="text-gray-600 text-sm">
                              Age: {pet.age_years} {pet.age_years === 1 ? 'year' : 'years'}
                              {pet.age_months > 0 && `, ${pet.age_months} ${pet.age_months === 1 ? 'month' : 'months'}`}
                            </p>
                          )}
                        </div>
                        <div className="text-left sm:text-right">
                          <span
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm ${getStatusColor(
                              app.status
                            )}`}
                          >
                            <span className="text-lg">{getStatusIcon(app.status)}</span>
                            {app.status}
                          </span>
                          {app.reviewed_at && (
                            <p className="text-sm text-gray-600 mt-2">
                              Reviewed: {new Date(app.reviewed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Applied On</p>
                          <p className="text-gray-800 font-semibold">
                            {new Date(app.application_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        {app.adoption_fee > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Adoption Fee</p>
                            <p className="text-gray-800 font-semibold">
                              ${app.adoption_fee.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>

                      {app.notes && (
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg mb-4">
                          <p className="text-xs font-bold text-blue-800 mb-1">📝 Admin Notes:</p>
                          <p className="text-sm text-blue-900">{app.notes}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                        >
                          View Full Details
                        </button>
                        <button
                          onClick={() => navigate(`/pet/${pet.pet_id}`)}
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                        >
                          View Pet Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Details Modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b p-6 z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-gray-800">Application Details</h2>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="text-gray-400 hover:text-gray-600 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Pet Info Card */}
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm">
                  <img
                    src={selectedApp.dim_pet?.photo_url || 'https://via.placeholder.com/150/cccccc/666666?text=No+Photo'}
                    alt={selectedApp.dim_pet?.pet_name || 'Pet'}
                    className="w-32 h-32 rounded-xl object-cover bg-gray-200 shadow-md border-4 border-white"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150/cccccc/666666?text=No+Photo';
                    }}
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {selectedApp.dim_pet?.pet_name || 'Unknown Pet'}
                    </h3>
                    <p className="text-lg text-gray-700 mb-2">
                      {selectedApp.dim_pet?.breed || 'Unknown'} • {selectedApp.dim_pet?.species || 'Unknown'}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <span className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-gray-700 shadow-sm">
                        {selectedApp.dim_pet?.gender || 'Unknown'}
                      </span>
                      <span className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-gray-700 shadow-sm">
                        {selectedApp.dim_pet?.size || 'Unknown'}
                      </span>
                      {selectedApp.dim_pet?.color && (
                        <span className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-gray-700 shadow-sm">
                          {selectedApp.dim_pet.color}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-6 py-3 rounded-xl text-base font-bold shadow-md ${getStatusColor(
                      selectedApp.status
                    )}`}
                  >
                    {getStatusIcon(selectedApp.status)} {selectedApp.status}
                  </span>
                </div>

                {/* Application Information */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                      👤 Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Full Name</p>
                        <p className="text-gray-800 font-medium">{selectedApp.adopter_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Email Address</p>
                        <p className="text-gray-800 font-medium">{selectedApp.adopter_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Phone Number</p>
                        <p className="text-gray-800 font-medium">{selectedApp.adopter_phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Housing Type</p>
                        <p className="text-gray-800 font-medium">{selectedApp.housing_type}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 font-semibold mb-1">Address</p>
                      <p className="text-gray-800 font-medium">{selectedApp.adopter_address}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                      🏡 Living Situation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Has Yard</p>
                        <p className="text-gray-800 font-medium text-lg">
                          {selectedApp.has_yard ? '✅ Yes' : '❌ No'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Has Other Pets</p>
                        <p className="text-gray-800 font-medium text-lg">
                          {selectedApp.has_other_pets ? '✅ Yes' : '❌ No'}
                        </p>
                      </div>
                    </div>
                    {selectedApp.other_pets_description && (
                      <div className="mt-4 p-4 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 font-semibold mb-2">Other Pets Description</p>
                        <p className="text-gray-800">{selectedApp.other_pets_description}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                      💭 Experience & Motivation
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 font-semibold mb-2">Experience with Pets</p>
                        <p className="text-gray-800 leading-relaxed">{selectedApp.experience_with_pets}</p>
                      </div>
                      <div className="p-4 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 font-semibold mb-2">Reason for Adoption</p>
                        <p className="text-gray-800 leading-relaxed">{selectedApp.reason_for_adoption}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                      📅 Application Timeline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 font-semibold mb-1">Submitted On</p>
                        <p className="text-gray-800 font-medium text-lg">
                          {new Date(selectedApp.application_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      {selectedApp.reviewed_at && (
                        <div className="p-4 bg-white rounded-lg">
                          <p className="text-sm text-gray-600 font-semibold mb-1">Reviewed On</p>
                          <p className="text-gray-800 font-medium text-lg">
                            {new Date(selectedApp.reviewed_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedApp.notes && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-500">
                      <h3 className="text-xl font-bold mb-3 text-blue-900 flex items-center gap-2">
                        📝 Admin Notes
                      </h3>
                      <p className="text-gray-800 leading-relaxed">{selectedApp.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate(`/pet/${selectedApp.dim_pet?.pet_id}`)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition"
                  >
                    View Pet Profile
                  </button>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition shadow-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyApplicationsPage;