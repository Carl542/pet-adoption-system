import React from 'react';
import { useNavigate } from 'react-router-dom';

function PetCard({ pet }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/pet/${pet.pet_id}`);
  };

  // Default placeholder if no photo
  const petPhoto = pet.photo_url || 'https://via.placeholder.com/400x300?text=No+Photo';

  return (
    <div className="bg-white border rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <img 
        src={petPhoto}
        alt={pet.name}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/400x300?text=Photo+Error';
        }}
      />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800">{pet.name}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            pet.status === 'Available' ? 'bg-green-100 text-green-800' :
            pet.status === 'Adopted' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {pet.status}
          </span>
        </div>

        <p className="text-gray-600 mb-2">
          {pet.breed} • {pet.age_years}y {pet.age_months}m old
        </p>

        <p className="text-sm text-gray-500 mb-1">
          {pet.gender} • {pet.size} • {pet.color}
        </p>

        <p className="text-sm text-gray-700 mt-3 line-clamp-2">
          {pet.description}
        </p>

        <button 
          onClick={handleViewDetails}
          className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default PetCard;