import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPetById } from '../services/petService';
import { submitAdoptionApplication } from '../services/adoptionService';
import { getCurrentUser } from '../services/authService';
import UserNavbar from '../components/user/UserNavbar';

function AdoptionFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    adopter_name: '',
    adopter_email: '',
    adopter_phone: '',
    adopter_address: '',
    housing_type: 'House',
    has_yard: false,
    has_other_pets: false,
    other_pets_description: '',
    experience_with_pets: '',
    reason_for_adoption: ''
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      // Get pet data
      const petData = await getPetById(id);
      setPet(petData);

      // Get current user if logged in
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          adopter_name: currentUser.user_metadata?.full_name || '',
          adopter_email: currentUser.email || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      if (window.confirm('You need to be logged in to submit an application. Would you like to sign up or log in?')) {
        navigate('/user-login');
      }
      return;
    }

    try {
      setSubmitting(true);

      const applicationData = {
        pet_id: parseInt(id),
        ...formData
      };

      const { data, error } = await submitAdoptionApplication(applicationData);

      if (error) {
        alert('Failed to submit application: ' + error);
      } else {
        console.log('Application submitted successfully:', data);
        alert('Application submitted successfully! We will review your application and contact you soon.');
        navigate('/my-applications');
      }
    } catch (error) {
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <div className="flex flex-col justify-center items-center min-h-[80vh]">
          <div className="text-6xl mb-4">😢</div>
          <p className="text-xl text-red-500 mb-4">Pet not found</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <button 
            onClick={() => navigate(`/pet/${id}`)}
            className="mb-6 text-blue-500 hover:text-blue-600 font-semibold flex items-center"
          >
            ← Back to {pet.name}'s Profile
          </button>

          {/* Pet Info Card */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 shadow-lg mb-8 text-white">
            <div className="flex items-center gap-4">
              <img
                src={pet.photo_url || 'https://via.placeholder.com/150'}
                alt={pet.name}
                className="w-24 h-24 object-cover rounded-lg border-4 border-white shadow-lg"
              />
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Adoption Application for {pet.name}
                </h1>
                <p className="text-blue-100">
                  {pet.breed} • {pet.species} • {pet.age_years}y {pet.age_months}m
                </p>
              </div>
            </div>
          </div>

          {/* Login Warning */}
          {!user && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Important:</strong> You must be logged in to submit an application.
                    <button
                      type="button"
                      onClick={() => navigate('/user-login')}
                      className="ml-2 text-yellow-800 underline hover:text-yellow-900 font-semibold"
                    >
                      Log in here
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Application Form */}
          <div className="bg-white rounded-lg p-8 shadow-md">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>📋</span> Application Form
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <span>👤</span> Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="adopter_name"
                      value={formData.adopter_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!!user}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="adopter_email"
                      value={formData.adopter_email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!!user}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="adopter_phone"
                      value={formData.adopter_phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., +63 912 345 6789"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Housing Type *
                    </label>
                    <select
                      name="housing_type"
                      value={formData.housing_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="House">House</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Condo">Condo</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2">
                    Address *
                  </label>
                  <textarea
                    name="adopter_address"
                    value={formData.adopter_address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Street, Barangay, City, Province"
                    required
                  />
                </div>
              </div>

              {/* Living Situation */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <span>🏠</span> Living Situation
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      name="has_yard"
                      checked={formData.has_yard}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 text-gray-700">
                      I have a yard or outdoor space
                    </label>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      name="has_other_pets"
                      checked={formData.has_other_pets}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 text-gray-700">
                      I have other pets
                    </label>
                  </div>

                  {formData.has_other_pets && (
                    <div className="ml-8 p-4 bg-blue-50 rounded-lg">
                      <label className="block text-sm font-semibold mb-2">
                        Please describe your other pets:
                      </label>
                      <textarea
                        name="other_pets_description"
                        value={formData.other_pets_description}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="e.g., 2 cats (5 years old), 1 small dog (Beagle, 3 years old)"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Experience & Motivation */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <span>❤️</span> Experience & Motivation
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">
                    What is your experience with pets? *
                  </label>
                  <textarea
                    name="experience_with_pets"
                    value={formData.experience_with_pets}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Tell us about your experience caring for pets, training them, and any challenges you've overcome..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Why do you want to adopt {pet.name}? *
                  </label>
                  <textarea
                    name="reason_for_adoption"
                    value={formData.reason_for_adoption}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder={`Share why ${pet.name} would be a great fit for your family...`}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(`/pet/${id}`)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button> 
                <button
                  type="submit"
                  disabled={submitting || !user}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </span>
                  ) : (
                    '🐾 Submit Application'
                  )}
                </button>
              </div>

              {!user && (
                <p className="text-sm text-center mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <strong>Note:</strong> You must be logged in to submit an application.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdoptionFormPage;