import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function PosterGenerator({ pet, qrCodeUrl }) {
  const posterRef = useRef(null);

  const handleDownloadPoster = async () => {
    try {
      const poster = posterRef.current;
      const canvas = await html2canvas(poster, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${pet.name}-adoption-poster.pdf`);
    } catch (error) {
      console.error('Error generating poster:', error);
      alert('Failed to generate poster');
    }
  };

  const handleDownloadImage = async () => {
    try {
      const poster = posterRef.current;
      const canvas = await html2canvas(poster, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `${pet.name}-adoption-poster.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image');
    }
  };

  const petPhoto = pet.photo_url || 'https://via.placeholder.com/600x400?text=No+Photo';

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold mb-4">Adoption Poster</h3>

      {/* Poster Preview */}
      <div 
        ref={posterRef}
        className="w-full aspect-[8.5/11] bg-white border-2 border-gray-200 p-8 flex flex-col"
        style={{ maxWidth: '600px', margin: '0 auto' }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            🐾 ADOPT ME! 🐾
          </h1>
          <p className="text-xl text-gray-600">Find Your New Best Friend</p>
        </div>

        {/* Pet Photo */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <img
            src={petPhoto}
            alt={pet.name}
            className="max-w-full max-h-64 object-contain rounded-lg shadow-lg"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x400?text=No+Photo';
            }}
          />
        </div>

        {/* Pet Info */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{pet.name}</h2>
          <p className="text-xl text-gray-600 mb-1">
            {pet.breed} • {pet.species}
          </p>
          <p className="text-lg text-gray-500">
            {pet.age_years} years, {pet.age_months} months old
          </p>
          <p className="text-lg text-gray-600 mt-2">
            {pet.gender} • {pet.size} • {pet.color}
          </p>
        </div>

        {/* Description */}
        <div className="text-center mb-6">
          <p className="text-gray-700 text-base leading-relaxed">
            {pet.description?.substring(0, 150)}
            {pet.description?.length > 150 ? '...' : ''}
          </p>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 border-4 border-gray-300 rounded-lg mb-3">
            <QRCodeSVG
              value={qrCodeUrl || `http://localhost:3000/pet/${pet.pet_id}`}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-center text-lg font-semibold text-gray-800 mb-1">
            📱 Scan to Learn More & Apply
          </p>
          <p className="text-center text-sm text-gray-600">
            Or visit: yoursite.com/pet/{pet.pet_id}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t-2 border-gray-200">
          <p className="text-gray-700 font-semibold">Contact Us:</p>
          <p className="text-gray-600">📧 adopt@shelter.com • 📞 (123) 456-7890</p>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={handleDownloadPoster}
          className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 font-semibold"
        >
          Download as PDF
        </button>
        <button
          onClick={handleDownloadImage}
          className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 font-semibold"
        >
          Download as Image
        </button>
      </div>

      <p className="text-sm text-gray-500 text-center mt-3">
        Print this poster and post it in your community!
      </p>
    </div>
  );
}

export default PosterGenerator;