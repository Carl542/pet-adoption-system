import React, { useState, useEffect } from 'react';
import PetCard from '../components/pet/PetCard';
import { getAllPets } from '../services/petService';
import UserNavbar from '../components/user/UserNavbar';

function HomePage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const data = await getAllPets();
      // Filter to only show available pets
      const availablePets = data.filter(pet => pet.status === 'Available');
      setPets(availablePets);
    } catch (err) {
      setError('Failed to load pets. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPets = filter === 'all' 
    ? pets 
    : pets.filter(pet => pet.species.toLowerCase() === filter.toLowerCase());

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading pets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchPets}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <UserNavbar />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-800 text-center">
            🐾 Pet Adoption Center
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Find your perfect companion
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Pets ({pets.length})
          </button>
          <button
            onClick={() => setFilter('dog')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              filter === 'dog'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dogs ({pets.filter(p => p.species === 'Dog').length})
          </button>
          <button
            onClick={() => setFilter('cat')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              filter === 'cat'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cats ({pets.filter(p => p.species === 'Cat').length})
          </button>
        </div>

        {/* Pet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.map(pet => (
            <PetCard key={pet.pet_id} pet={pet} />
          ))}
        </div>

        {filteredPets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              No {filter !== 'all' ? filter + 's' : 'pets'} available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;