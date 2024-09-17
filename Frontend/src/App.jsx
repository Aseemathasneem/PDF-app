import React, { useState } from "react";
import axios from "axios";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

export default function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedPages, setSelectedPages] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [newPdfUrl, setNewPdfUrl] = useState("");

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);
      setError("");
    } else {
      setFile(null);
      setError("Please upload a valid PDF file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          `${apiBaseUrl}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setUploadStatus("File uploaded successfully!");
        setFileUrl(`${apiBaseUrl}/pdf/${response.data.filename}`);
      } catch (error) {
        setUploadStatus("Error uploading file.");
        console.error("Error uploading file:", error);
      }
    } else {
      setError("Please select a PDF file before submitting.");
    }
  };

  const handleExtractPages = async () => {
    if (selectedPages.length === 0) {
      alert("Please select at least one page to extract.");
      return;
    }

    try {
      const response = await axios.post(`${apiBaseUrl}/extract-pages`, {
        filename: fileUrl.split("/").pop(),
        selectedPages: selectedPages,
      });
      setNewPdfUrl(
        `${apiBaseUrl}/uploads/${response.data.newFilename}`
      );
      alert("Pages extracted successfully!");
    } catch (error) {
      console.error("Error extracting pages:", error);
      alert("Error extracting pages.");
    }
  };

  const handlePageSelection = (pageNum) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum)
        ? prev.filter((p) => p !== pageNum)
        : [...prev, pageNum]
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
      <h1 className="text-3xl text-red-500 mb-6">PDF Upload App</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-lg"
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="mb-4 p-2 border border-gray-300 w-full"
        />

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Upload PDF
        </button>
      </form>

      {uploadStatus && <p className="mt-4 text-center">{uploadStatus}</p>}

      {fileUrl && (
        <div className="mt-6 w-full">
          <Worker
            workerUrl={`https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js`}
          >
            
            <div className="w-full max-w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] xl:h-[90vh] overflow-auto">
              <div className="relative w-full h-full">
                <Viewer
                  fileUrl={fileUrl}
                  onDocumentLoad={(e) => setNumPages(e.doc.numPages)}
                  className="w-full h-full"
                />
              </div>
            </div>
          </Worker>

          {numPages && (
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              {Array.from(new Array(numPages), (el, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    value={index + 1}
                    onChange={() => handlePageSelection(index + 1)}
                    checked={selectedPages.includes(index + 1)}
                  />
                  <label className="ml-2">Page {index + 1}</label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedPages.length > 0 && (
        <div className="mt-4">
          <p>Selected Pages: {selectedPages.join(", ")}</p>
          <button
            onClick={handleExtractPages}
            className="bg-green-500 text-white px-4 py-2 rounded w-full max-w-xs"
          >
            Extract Selected Pages
          </button>
        </div>
      )}

      {newPdfUrl && (
        <div className="mt-6 text-center">
          <h3>Extracted PDF:</h3>
          <a
            href={newPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Download Extracted PDF
          </a>
        </div>
      )}
    </div>
  );
}
