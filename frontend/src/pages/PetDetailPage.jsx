import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPetById, trackQRScan } from '../services/petService';

function PetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPetDetails();
    trackScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPetDetails = async () => {
    try {
      setLoading(true);
      const data = await getPetById(id);
      setPet(data);
    } catch (err) {
      setError('Pet not found');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const trackScan = async () => {
    try {
      await trackQRScan(id, {
        userAgent: navigator.userAgent
      });
    } catch (err) {
      console.error('Failed to track scan:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-xl text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const petPhoto = pet.photo_url || 'https://via.placeholder.com/800x600?text=No+Photo';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="mb-6 text-blue-500 hover:text-blue-600 flex items-center"
        >
          ← Back to all pets
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Pet Image */}
          <img 
            src={petPhoto}
            alt={pet.name}
            className="w-full h-96 object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x600?text=Photo+Error';
            }}
          />

          {/* Pet Details */}
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {pet.name}
                </h1>
                <p className="text-xl text-gray-600">
                  {pet.breed} • {pet.species}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full font-semibold ${
                pet.status === 'Available' ? 'bg-green-100 text-green-800' :
                pet.status === 'Adopted' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {pet.status}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-semibold">{pet.age_years}y {pet.age_months}m</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-semibold">{pet.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Size</p>
                <p className="font-semibold">{pet.size}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Color</p>
                <p className="font-semibold">{pet.color}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">About {pet.name}</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {pet.description}
              </p>
            </div>

            {/* Health Status */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-1">Health Status</h3>
              <p className="text-gray-700">{pet.health_status}</p>
            </div>

            {/* Adopt Button */}
            {pet.status === 'Available' && (
              <button 
                onClick={() => navigate(`/adopt/${pet.pet_id}`)}
                className="w-full bg-blue-500 text-white py-4 rounded-lg text-xl font-semibold hover:bg-blue-600 transition-colors"
              >
                Apply to Adopt {pet.name}
              </button>
            )}

            {pet.status !== 'Available' && (
              <div className="text-center py-4 text-gray-600">
                This pet is currently {pet.status.toLowerCase()}
              </div>
            )}

            {/* Contact Info */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Have questions? Contact us at: shelter@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PetDetailPage;