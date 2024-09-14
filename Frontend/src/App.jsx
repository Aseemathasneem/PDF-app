import React, { useState } from 'react';

export default function App() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];

    // Check if the file is a PDF
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please upload a valid PDF file.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      // You can now upload the file to the backend or do further processing
      console.log('PDF file uploaded:', file);
    } else {
      setError('Please select a PDF file before submitting.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl text-red-500 mb-6">PDF Upload App</h1>

      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="mb-4 p-2 border border-gray-300"
        />

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Upload PDF
        </button>
      </form>
    </div>
  );
}
