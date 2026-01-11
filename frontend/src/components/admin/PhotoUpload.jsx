import React, { useState } from 'react';
import { updatePet } from '../../services/petService';
import { uploadAndUpdatePetPhoto } from '../../services/storageService';

function PhotoUpload({ pet, onPhotoUploaded }) {
  const [photoUrl, setPhotoUrl] = useState(pet.photo_url || '');
  const [uploading, setUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('file');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      console.log('Uploading file...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Use the existing storage service
      const updatedPet = await uploadAndUpdatePetPhoto(file, pet.pet_id);
      
      console.log('Upload successful:', updatedPet);

      setPhotoUrl(updatedPet.photo_url);
      onPhotoUploaded(updatedPet);
      
      alert('Photo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      const updated = await updatePet(pet.pet_id, { photo_url: photoUrl });
      onPhotoUploaded(updated);
      alert('Photo URL updated successfully!');
    } catch (error) {
      alert('Failed to update photo URL');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold mb-4">Pet Photo</h3>

      {/* Current Photo Preview */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Current Photo:</label>
        <div className="border rounded-lg p-4 bg-gray-50">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={pet.name}
              className="w-full max-w-md mx-auto rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=No+Photo';
              }}
            />
          ) : (
            <div className="w-full max-w-md mx-auto h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No photo uploaded</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Method Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        <button
          type="button"
          onClick={() => setUploadMethod('file')}
          className={`px-4 py-2 font-semibold ${
            uploadMethod === 'file'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📁 Upload File
        </button>
        <button
          type="button"
          onClick={() => setUploadMethod('url')}
          className={`px-4 py-2 font-semibold ${
            uploadMethod === 'url'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🔗 Use URL
        </button>
      </div>

      {/* File Upload Section */}
      {uploadMethod === 'file' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Choose Photo from Your Computer:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepts: JPG, PNG, GIF (Max 5MB)
            </p>
          </div>

          {uploading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Uploading photo...</p>
            </div>
          )}

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold text-blue-800 mb-2">💡 How to use:</p>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click "Choose File" above</li>
              <li>Select an image from your computer</li>
              <li>Photo will upload automatically</li>
              <li>Wait for success message</li>
            </ol>
          </div>
        </div>
      )}

      {/* URL Input Section */}
      {uploadMethod === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Photo URL:
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste an image URL from the web
            </p>
          </div>

          <button
            type="submit"
            disabled={uploading || !photoUrl}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Updating...' : 'Update Photo URL'}
          </button>

          {/* Quick Photo Examples */}
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-semibold mb-2">🖼️ Quick Photo URLs (Click to use):</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1568572933382-74d440642117?w=400')}
                className="text-left text-xs text-blue-600 hover:underline p-2 hover:bg-green-100 rounded"
              >
                🐕 German Shepherd
              </button>
              <button
                type="button"
                onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400')}
                className="text-left text-xs text-blue-600 hover:underline p-2 hover:bg-green-100 rounded"
              >
                🐱 Siamese Cat
              </button>
              <button
                type="button"
                onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=400')}
                className="text-left text-xs text-blue-600 hover:underline p-2 hover:bg-green-100 rounded"
              >
                🐈 Black Cat
              </button>
              <button
                type="button"
                onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400')}
                className="text-left text-xs text-blue-600 hover:underline p-2 hover:bg-green-100 rounded"
              >
                🐶 Beagle
              </button>
              <button
                type="button"
                onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400')}
                className="text-left text-xs text-blue-600 hover:underline p-2 hover:bg-green-100 rounded"
              >
                🦮 Labrador
              </button>
              <button
                type="button"
                onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400')}
                className="text-left text-xs text-blue-600 hover:underline p-2 hover:bg-green-100 rounded"
              >
                🐈‍⬛ Tabby Cat
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default PhotoUpload;