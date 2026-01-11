import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPetsForAdmin } from '../services/petService'; 
import { logout, getCurrentUser } from '../services/authService';
import AdminPetCard from '../components/admin/AdminPetCard';
import AddPetModal from '../components/admin/AddPetModal';

function AdminPage() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const user = getCurrentUser();

  useEffect(() => {
    fetchAllPets();
  }, []);

const fetchAllPets = async () => {
  try {
    setLoading(true);
    const data = await getAllPetsForAdmin(); // Changed from getAllPets
    setPets(data || []);
  } catch (error) {
    console.error('Error fetching pets:', error);
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePetAdded = (newPet) => {
    setPets([newPet, ...pets]);
    setShowAddModal(false);
  };

  const handlePetUpdated = (updatedPet) => {
    setPets(pets.map(p => p.pet_id === updatedPet.pet_id ? updatedPet : p));
  };

  const handlePetDeleted = (petId) => {
    setPets(pets.filter(p => p.pet_id !== petId));
  };

  const filteredPets = pets.filter(pet => {
    if (filter === 'all') return true;
    if (filter === 'available') return pet.status === 'Available';
    if (filter === 'adopted') return pet.status === 'Adopted';
    return true;
  });

  const stats = {
    total: pets.length,
    available: pets.filter(p => p.status === 'Available').length,
    adopted: pets.filter(p => p.status === 'Adopted').length,
    pending: pets.filter(p => p.status === 'Pending').length
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                🐾 Admin Dashboard
              </h1>
              <p className="text-gray-600">Welcome, {user?.full_name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/admin/analytics')}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                📊 Analytics
              </button>
              <button
                onClick={() => navigate('/admin/applications')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                📋 Applications
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                View Site
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-gray-600 text-sm mb-1">Total Pets</div>
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-gray-600 text-sm mb-1">Available</div>
            <div className="text-3xl font-bold text-green-600">{stats.available}</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-gray-600 text-sm mb-1">Adopted</div>
            <div className="text-3xl font-bold text-blue-600">{stats.adopted}</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-gray-600 text-sm mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
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
              onClick={() => setFilter('available')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'available'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Available ({stats.available})
            </button>
            <button
              onClick={() => setFilter('adopted')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'adopted'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Adopted ({stats.adopted})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
          >
            + Add New Pet
          </button>
        </div>

        {/* Pet List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map(pet => (
            <AdminPetCard
              key={pet.pet_id}
              pet={pet}
              onUpdate={handlePetUpdated}
              onDelete={handlePetDeleted}
            />
          ))}
        </div>

        {filteredPets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No pets found</p>
          </div>
        )}
      </div>

      {/* Add Pet Modal */}
      {showAddModal && (
        <AddPetModal
          onClose={() => setShowAddModal(false)}
          onPetAdded={handlePetAdded}
        />
      )}
    </div>
  );
}

export default AdminPage;