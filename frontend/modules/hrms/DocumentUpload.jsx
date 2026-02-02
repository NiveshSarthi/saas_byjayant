import React, { useState } from 'react';
import axios from 'axios';
import Button from '@shared/Button';

const DocumentUpload = ({ employeeId, onUpload }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('type', type);
    formData.append('employeeId', employeeId);

    try {
      await axios.post('/api/hrms/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUpload();
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Upload Document</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Document Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Type</label>
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">File</label>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <Button type="submit">Upload</Button>
    </form>
  );
};

export default DocumentUpload;







