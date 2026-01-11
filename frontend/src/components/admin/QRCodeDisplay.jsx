import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateQRCode, getQRScanStats } from '../../services/qrService';

function QRCodeDisplay({ pet }) {
  const [qrData, setQrData] = useState(null);
  const [scanStats, setScanStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadQRCode = async () => {
      try {
        const data = await generateQRCode(pet.pet_id, pet.name);
        setQrData(data);
      } catch (error) {
        console.error('Error loading QR code:', error);
      }
    };

    const loadScanStats = async () => {
      try {
        const stats = await getQRScanStats(pet.pet_id);
        setScanStats(stats);
      } catch (error) {
        console.error('Error loading scan stats:', error);
      }
    };

    if (pet.qr_code_generated) {
      loadQRCode();
      loadScanStats();
    }
  }, [pet.qr_code_generated, pet.pet_id, pet.name]);

  const handleGenerateQR = async () => {
    try {
      setLoading(true);
      const data = await generateQRCode(pet.pet_id, pet.name);
      setQrData(data);
    } catch (error) {
      alert('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrData) return;

    // Create download link
    const link = document.createElement('a');
    link.href = qrData.qrCodeDataUrl;
    link.download = `qr-code-${pet.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!qrData) {
    return (
      <div className="text-center py-8">
        <button
          onClick={handleGenerateQR}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold mb-4">QR Code for {pet.name}</h3>

      {/* QR Code Display */}
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-white border-4 border-gray-200 rounded-lg">
          <QRCodeSVG
            value={qrData.url}
            size={256}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>

      {/* QR Code URL */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pet Page URL:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={qrData.url}
            readOnly
            className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
          />
          <button
            onClick={() => navigator.clipboard.writeText(qrData.url)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Scan Statistics */}
      {scanStats && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-2">Scan Statistics</h4>
          <p className="text-gray-700">Total Scans: {scanStats.totalScans}</p>
          {scanStats.lastScan && (
            <p className="text-gray-600 text-sm">
              Last Scan: {new Date(scanStats.lastScan).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleDownloadQR}
          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Download QR Code
        </button>
        <button
          onClick={() => window.open(qrData.url, '_blank')}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Preview Pet Page
        </button>
      </div>
    </div>
  );
}

export default QRCodeDisplay;