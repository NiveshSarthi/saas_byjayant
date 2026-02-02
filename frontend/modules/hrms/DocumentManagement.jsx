import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import CustomSelect from '../../src/components/shared/CustomSelect';
import { Icons } from '../../src/components/shared/Icons';

const DocumentManagement = () => {
    const [documents, setDocuments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [formData, setFormData] = useState({
        documentType: '',
        title: '',
        description: '',
        file: null
    });

    const documentTypes = [
        'LOI (Letter of Intent)',
        'AL (Appointment Letter)',
        'OL (Offer Letter)',
        'Aadhar Card',
        'PAN Card',
        'Educational Certificates',
        'Experience Letters',
        'Bank Details',
        'Passport',
        'Other'
    ];

    useEffect(() => {
        fetchDocuments();
        fetchEmployees();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await axios.get('/api/hrms/documents');
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('/api/hrms/employees');
            setEmployees(response.data);
            if (response.data.length > 0) {
                setSelectedEmployee(response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEmployee) return alert('Please select an employee');

        const uploadData = new FormData();
        uploadData.append('employeeId', selectedEmployee._id);
        uploadData.append('documentType', formData.documentType);
        uploadData.append('title', formData.title);
        uploadData.append('description', formData.description);
        uploadData.append('file', formData.file);

        try {
            await axios.post('/api/hrms/documents/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchDocuments();
            resetForm();
            alert('Document uploaded successfully!');
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Failed to upload document');
        }
    };

    const resetForm = () => {
        setFormData({
            documentType: '',
            title: '',
            description: '',
            file: null
        });
        setShowUploadForm(false);
    };

    const downloadDocument = async (docId, filename) => {
        try {
            const response = await axios.get(`/api/hrms/documents/${docId}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading document:', error);
        }
    };

    const deleteDocument = async (docId) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await axios.delete(`/api/hrms/documents/${docId}`);
                fetchDocuments();
            } catch (error) {
                console.error('Error deleting document:', error);
            }
        }
    };

    const filteredDocuments = documents.filter(doc => doc.employee === selectedEmployee?._id);

    return (
        <Layout>
            <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
                {/* Employee Sidebar */}
                <div style={{
                    width: '320px',
                    borderRight: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ padding: 'var(--space-xl)', borderBottom: '1px solid var(--border-color)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Employees</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Select to view documents</p>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-md)' }}>
                        <div style={{ display: 'grid', gap: 'var(--space-xs)' }}>
                            {employees.map(emp => (
                                <div
                                    key={emp._id}
                                    onClick={() => setSelectedEmployee(emp)}
                                    style={{
                                        padding: 'var(--space-md)',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: selectedEmployee?._id === emp._id ? 'var(--bg-elevated)' : 'transparent',
                                        border: selectedEmployee?._id === emp._id ? '1px solid var(--accent-primary)' : '1px solid transparent'
                                    }}
                                >
                                    <div style={{ fontWeight: '600', marginBottom: 'var(--space-xxs)' }}>
                                        {emp.user?.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                        {emp.position} • {emp.department}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, padding: 'var(--space-2xl)', backgroundColor: 'var(--bg-main)', overflowY: 'auto' }}>
                    {selectedEmployee ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
                                <div>
                                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
                                        Documents: {selectedEmployee.user?.name}
                                    </h1>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        {selectedEmployee.position} | {selectedEmployee.department}
                                    </p>
                                </div>
                                <Button onClick={() => setShowUploadForm(true)} variant="primary">
                                    <Icons.Plus style={{ marginRight: 'var(--space-xs)' }} /> Upload New
                                </Button>
                            </div>

                            {/* Upload Form Overlay/Modal-like */}
                            {showUploadForm && (
                                <Card style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)', border: '1px solid var(--accent-primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Upload for {selectedEmployee.user?.name}</h2>
                                        <Button onClick={resetForm} variant="ghost" size="sm">
                                            Cancel
                                        </Button>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-lg)' }}>
                                            <div className="input-group">
                                                <CustomSelect
                                                    label="Document Type"
                                                    value={formData.documentType}
                                                    onChange={handleChange}
                                                    name="documentType"
                                                    options={documentTypes.map(type => ({ value: type, label: type }))}
                                                    placeholder="Select category"
                                                />
                                            </div>

                                            <div className="input-group">
                                                <label htmlFor="title">Document Title *</label>
                                                <input id="title" type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Aadhar Card - Front" />
                                            </div>

                                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                                <label htmlFor="description">Description (Optional)</label>
                                                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Additional notes about this document..." />
                                            </div>

                                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                                <label htmlFor="file">Upload File *</label>
                                                <div style={{
                                                    border: '2px dashed var(--border-color)',
                                                    padding: 'var(--space-xl)',
                                                    textAlign: 'center',
                                                    borderRadius: 'var(--radius-md)',
                                                    cursor: 'pointer',
                                                    '&:hover': { borderColor: 'var(--accent-primary)' }
                                                }}>
                                                    <input id="file" type="file" onChange={handleFileChange} required accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={{ display: 'none' }} />
                                                    <label htmlFor="file" style={{ cursor: 'pointer' }}>
                                                        <Icons.FileUp size={48} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }} />
                                                        <p>{formData.file ? formData.file.name : 'Click to select or drag and drop'}</p>
                                                        <small style={{ color: 'var(--text-tertiary)' }}>PDF, DOCX, JPG or PNG (max 5MB)</small>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                                            <Button type="button" onClick={resetForm} variant="secondary">Cancel</Button>
                                            <Button type="submit" variant="primary">Start Upload</Button>
                                        </div>
                                    </form>
                                </Card>
                            )}

                            {/* Documents Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-xl)' }}>
                                {filteredDocuments.map(doc => (
                                    <Card key={doc._id} style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ padding: 'var(--space-xl)', flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    backgroundColor: 'var(--bg-elevated)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Icons.FileText style={{ color: 'var(--accent-primary)' }} />
                                                </div>
                                                <Badge variant="neutral">{doc.documentType}</Badge>
                                            </div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-xs)' }}>{doc.title}</h3>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
                                                {doc.description || 'No description provided.'}
                                            </p>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                Added: {new Date(doc.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: 'var(--space-lg)',
                                            borderTop: '1px solid var(--border-color)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            backgroundColor: 'var(--bg-elevated)'
                                        }}>
                                            <Button onClick={() => downloadDocument(doc._id, doc.filename)} variant="ghost" size="sm">
                                                <Icons.Download size={16} style={{ marginRight: 'var(--space-xs)' }} /> Download
                                            </Button>
                                            <Button onClick={() => deleteDocument(doc._id)} variant="ghost" size="sm" style={{ color: 'var(--danger-primary)' }}>
                                                <Icons.Trash size={16} />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}

                                {filteredDocuments.length === 0 && (
                                    <div style={{ gridColumn: 'span 3', padding: '100px 0', textAlign: 'center' }}>
                                        <Icons.FileQuestion size={64} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-xl)' }} />
                                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>No documents found for this employee.</p>
                                        <Button onClick={() => setShowUploadForm(true)} variant="link">Upload the first document</Button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-tertiary)' }}>
                            <Icons.Users size={64} style={{ marginBottom: 'var(--space-xl)' }} />
                            <h2>Select an employee from the sidebar to manage documents</h2>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default DocumentManagement;
