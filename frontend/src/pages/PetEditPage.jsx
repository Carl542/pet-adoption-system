import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPetById, updatePet } from '../services/petService';
import PhotoUpload from '../components/admin/PhotoUpload';
import QRCodeDisplay from '../components/admin/QRCodeDisplay';
import PosterGenerator from '../components/admin/PosterGenerator';

function PetEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const data = await getPetById(id);
        setPet(data);
      } catch (error) {
        alert('Failed to load pet');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPet(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const updated = await updatePet(id, pet);
      setPet(updated);
      alert('Pet updated successfully!');
    } catch (error) {
      alert('Failed to update pet');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUploaded = (updatedPet) => {
    setPet(updatedPet);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!pet) {
    return <div>Pet not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => navigate('/admin')}
              className="text-blue-500 hover:text-blue-600 mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">Edit {pet.name}</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'details'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Pet Details
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'photo'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Photo
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'qr'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            QR Code
          </button>
          <button
            onClick={() => setActiveTab('poster')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'poster'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Poster
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-lg p-6 shadow-md">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Form fields same as AddPetModal */}
                <div>
                  <label className="block text-sm font-semibold mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={pet.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Species *</label>
                  <select
                    name="species"
                    value={pet.species}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Bird">Bird</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Breed</label>
                  <input
                    type="text"
                    name="breed"
                    value={pet.breed || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Status *</label>
                  <select
                    name="status"
                    value={pet.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="Pending">Pending</option>
                    <option value="Adopted">Adopted</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  name="description"
                  value={pet.description || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="4"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-4 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'photo' && (
          <PhotoUpload pet={pet} onPhotoUploaded={handlePhotoUploaded} />
        )}

        {activeTab === 'qr' && (
          <QRCodeDisplay pet={pet} />
        )}

        {activeTab === 'poster' && (
          <PosterGenerator 
            pet={pet} 
            qrCodeUrl={`${window.location.origin}/pet/${pet.pet_id}`}
          />
        )}
      </div>
    </div>
  );
}

export default PetEditPage;