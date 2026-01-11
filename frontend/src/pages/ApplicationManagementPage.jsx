import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllApplications, updateApplicationStatus } from '../services/adoptionService';

function ApplicationManagementPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [reviewingApp, setReviewingApp] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await getAllApplications();
      
      if (error) {
        console.error('Error:', error);
        alert('Failed to load applications');
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

  const handleReview = (app) => {
    setReviewingApp(app);
    setReviewNotes('');
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!reviewingApp) return;

    try {
      setUpdating(true);
      // FIXED: Removed unused 'data' variable
      const { error } = await updateApplicationStatus(
        reviewingApp.fact_id, 
        newStatus, 
        reviewNotes
      );

      if (error) {
        alert('Failed to update status: ' + error);
      } else {
        alert(`Application ${newStatus.toLowerCase()} successfully!`);
        fetchApplications();
        setReviewingApp(null);
        setReviewNotes('');
      }
    } catch (error) {
      alert('Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

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

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'Pending').length,
    approved: applications.filter(a => a.status === 'Approved').length,
    rejected: applications.filter(a => a.status === 'Rejected').length
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
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                📋 Application Management
              </h1>
              <p className="text-gray-600">Review and manage adoption applications</p>
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

      <div className="container mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-gray-600 text-sm mb-1">Total Applications</div>
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-gray-600 text-sm mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-gray-600 text-sm mb-1">Approved</div>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-gray-600 text-sm mb-1">Rejected</div>
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('Pending')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'Pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('Approved')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'Approved'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => setFilter('Rejected')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'Rejected'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Rejected ({stats.rejected})
          </button>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-xl text-gray-500">No applications found</p>
            </div>
          ) : (
            filteredApplications.map((app) => {
              const pet = app.dim_pet || {};
              return (
                <div key={app.fact_id} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition">
                  <div className="flex gap-6">
                    {/* Pet Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={pet.photo_url || 'https://via.placeholder.com/150/cccccc/666666?text=No+Photo'}
                        alt={pet.pet_name}
                        className="w-24 h-24 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150/cccccc/666666?text=No+Photo';
                        }}
                      />
                    </div>

                    {/* Application Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {pet.pet_name || 'Unknown Pet'}
                          </h3>
                          <p className="text-gray-600">
                            {pet.breed} • {pet.species}
                          </p>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Applicant</p>
                          <p className="font-semibold">{app.adopter_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-semibold text-sm">{app.adopter_email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Applied</p>
                          <p className="font-semibold">
                            {new Date(app.application_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Housing</p>
                          <p className="font-semibold">{app.housing_type}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(app)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          Review Application
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewingApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Review Application</h2>
                <button
                  onClick={() => {
                    setReviewingApp(null);
                    setReviewNotes('');
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Pet Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <img
                  src={reviewingApp.dim_pet?.photo_url || 'https://via.placeholder.com/100'}
                  alt={reviewingApp.dim_pet?.pet_name}
                  className="w-20 h-20 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100';
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{reviewingApp.dim_pet?.pet_name}</h3>
                  <p className="text-gray-600">
                    {reviewingApp.dim_pet?.breed} • {reviewingApp.dim_pet?.species}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                    reviewingApp.status
                  )}`}
                >
                  {reviewingApp.status}
                </span>
              </div>

              {/* Application Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold">{reviewingApp.adopter_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{reviewingApp.adopter_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold">{reviewingApp.adopter_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Housing</p>
                      <p className="font-semibold">{reviewingApp.housing_type}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold">{reviewingApp.adopter_address}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Living Situation</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Has Yard</p>
                      <p className="font-semibold">
                        {reviewingApp.has_yard ? '✅ Yes' : '❌ No'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Has Other Pets</p>
                      <p className="font-semibold">
                        {reviewingApp.has_other_pets ? '✅ Yes' : '❌ No'}
                      </p>
                    </div>
                  </div>
                  {reviewingApp.other_pets_description && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Other Pets</p>
                      <p className="font-semibold">{reviewingApp.other_pets_description}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Experience & Motivation</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pet Experience</p>
                      <p className="bg-gray-50 p-3 rounded">{reviewingApp.experience_with_pets}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Reason for Adoption</p>
                      <p className="bg-gray-50 p-3 rounded">{reviewingApp.reason_for_adoption}</p>
                    </div>
                  </div>
                </div>

                {/* Review Notes */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Review Notes (Optional)</h3>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add any notes about this review..."
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {reviewingApp.status === 'Pending' && (
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => handleStatusUpdate('Approved')}
                    disabled={updating}
                    className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold"
                  >
                    {updating ? 'Processing...' : '✅ Approve Application'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('Rejected')}
                    disabled={updating}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-semibold"
                  >
                    {updating ? 'Processing...' : '❌ Reject Application'}
                  </button>
                </div>
              )}

              {reviewingApp.status !== 'Pending' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600">
                    This application has already been {reviewingApp.status.toLowerCase()}.
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setReviewingApp(null);
                  setReviewNotes('');
                }}
                className="w-full mt-4 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationManagementPage;