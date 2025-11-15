import React, { useState } from 'react';
import axios from 'axios';

/**
 * UploadForm
 *
 * A reusable component for uploading JSON files.  When the form is
 * submitted it posts the file to the FastAPI `/upload` endpoint and
 * passes the result back to the parent via the `onUpload` callback.
 */
function UploadForm({ onUpload }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a JSON file.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUpload(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <label htmlFor="fileInput">Choose a JSON file:</label>
      <input
        id="fileInput"
        type="file"
        accept="application/json"
        onChange={handleChange}
        style={{ display: 'block', marginTop: '0.5rem' }}
      />
      <button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
        {loading ? 'Uploading…' : 'Upload'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default UploadForm;