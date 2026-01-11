import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deletePet } from '../../services/petService';

function AdminPetCard({ pet, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const displayName = `${pet.species} - ${pet.breed}`;
    
    if (!window.confirm(`Are you sure you want to delete ${displayName}?`)) {
      return;
    }

    try {
      setDeleting(true);
      await deletePet(pet.pet_id);
      onDelete(pet.pet_id);
      alert('Pet deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message || 'Failed to delete pet. It may have been adopted.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/pet/${pet.pet_id}/edit`);
  };

  const petPhoto = pet.photo_url || 'https://via.placeholder.com/400x300?text=No+Photo';
  const displayName = `${pet.species} - ${pet.breed}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <img
        src={petPhoto}
        alt={displayName}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/400x300?text=No+Photo';
        }}
      />

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800">{displayName}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            pet.status === 'Available' ? 'bg-green-100 text-green-800' :
            pet.status === 'Adopted' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {pet.status}
          </span>
        </div>

        <div className="text-gray-600 mb-2 space-y-1">
          <p><span className="font-semibold">ID:</span> {pet.pet_id}</p>
          <p><span className="font-semibold">Age:</span> {pet.age_group}</p>
          <p><span className="font-semibold">Size:</span> {pet.size}</p>
          <p><span className="font-semibold">Gender:</span> {pet.gender}</p>
        </div>

        {pet.status === 'Adopted' && pet.adoption_date && (
          <div className="text-sm text-blue-600 mb-2">
            Adopted: {new Date(pet.adoption_date).toLocaleDateString()}
            {pet.qr_scan_count > 0 && (
              <span className="ml-2">• QR Scans: {pet.qr_scan_count}</span>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleEdit}
            className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || pet.status === 'Adopted'}
            className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            title={pet.status === 'Adopted' ? 'Cannot delete adopted pets' : 'Delete pet'}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        {pet.status === 'Adopted' && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            * Adopted pets cannot be deleted
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminPetCard;