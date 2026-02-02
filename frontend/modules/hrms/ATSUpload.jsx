import React, { useState, useEffect } from 'react';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import CustomSelect from '../../src/components/shared/CustomSelect';

const ATSUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
  });
  const [resumes, setResumes] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      // For now, using mock data. In production, this would come from the SetFields API
      setDepartments(['Sales', 'Marketing', 'HR', 'Administration', 'Accounts', 'IT', 'Operations']);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setResumes(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('department', formData.department);
    for (let i = 0; i < resumes.length; i++) {
      data.append('resumes', resumes[i]);
    }

    try {
      const response = await fetch('/api/ats/upload', {
        method: 'POST',
        body: data,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const result = await response.json();
      setResults(result);
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (recruitmentId, candidateId) => {
    try {
      await fetch(`/api/hrms/recruitment/update-candidate-stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          recruitmentId,
          candidateId,
          stage: 'Screening',
        }),
      });
      // Update local state or refetch
      alert('Candidate shortlisted');
    } catch (error) {
      console.error('Error shortlisting:', error);
    }
  };

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <Card style={{ padding: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>ATS Resume Upload</h1>
          </div>

          <Card style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
              Upload Job Description and Resumes
            </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Job Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Job Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows="4"
              required
            />
          </div>
          <CustomSelect
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={departments.map(dept => ({ value: dept, label: dept }))}
            placeholder="Select Department"
          />
          <div className="mb-4">
            <label className="block text-sm font-medium">Resumes (PDFs, name as First_Last_email.pdf)</label>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload and Score'}
          </Button>
        </form>
      </Card>
      {results && (
        <Card className="mt-6">
          <h3 className="text-lg font-bold mb-4">ATS Scores</h3>
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">ATS Score</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.candidates.map((candidate, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">{candidate.name}</td>
                  <td className="px-4 py-2">{candidate.email}</td>
                  <td className="px-4 py-2">{candidate.atsScore}%</td>
                  <td className="px-4 py-2">
                    <Button
                      onClick={() => handleShortlist(results._id, candidate._id)}
                      variant="primary"
                      size="sm"
                    >
                      Shortlist
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      </Card>
    </div>
  </Layout>
  );
};

export default ATSUpload;







