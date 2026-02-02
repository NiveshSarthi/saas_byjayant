import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Card from '../../src/components/shared/Card';
import Button from '../../src/components/shared/Button';
import Badge from '../../src/components/shared/Badge';
import StatCard from '../../src/components/shared/StatCard';
import { Icons } from '../../src/components/shared/Icons';

const ExpenseApprovals = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [stats, setStats] = useState({
    pendingCount: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get('/api/accounts/approvals/pending');
      setPendingRequests(response.data);

      const total = response.data.reduce((acc, req) => acc + (parseFloat(req.amount) || 0), 0);
      setStats({
        pendingCount: response.data.length,
        totalAmount: total
      });
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.put(`/api/accounts/approvals/${requestId}/approve`);
      fetchPendingRequests();
      alert('Request approved successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) return alert('Please provide a reason for rejection');
    try {
      await axios.put(`/api/accounts/approvals/${showRejectModal}/reject`, { reason: rejectReason });
      fetchPendingRequests();
      setShowRejectModal(null);
      setRejectReason('');
      alert('Request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <Layout>
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--space-sm)' }}>
            Payment & Expense Approvals
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Review and approve expense claims, bill payments, and vendor invoices
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
          <StatCard
            icon="⏳"
            label="Pending Requests"
            value={stats.pendingCount}
            trend="neutral"
          />
          <StatCard
            icon="💸"
            label="Total Approval Value"
            value={`₹${stats.totalAmount.toLocaleString()}`}
            trend="neutral"
          />
        </div>

        {/* Pending Requests List */}
        <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
          {pendingRequests.map(req => (
            <Card key={req._id} style={{ padding: 'var(--space-2xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{req.title}</h3>
                    <Badge variant="warning">Pending Approval</Badge>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-xl)', marginTop: 'var(--space-lg)' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requester</div>
                      <div style={{ fontWeight: '600' }}>{req.submittedBy?.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{req.department} Department</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</div>
                      <div style={{ fontWeight: '700', fontSize: '1.125rem', color: 'var(--accent-primary)' }}>₹{parseFloat(req.amount).toLocaleString()}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{req.category}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Submitted</div>
                      <div style={{ fontWeight: '600' }}>{new Date(req.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-md)', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: '700', marginBottom: 'var(--space-xs)' }}>Description:</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{req.description}</div>
                  </div>

                  {/* BANK DETAILS SECTION */}
                  {req.submittedBy?.bankDetails && (
                    <div style={{
                      marginTop: 'var(--space-lg)',
                      padding: 'var(--space-md)',
                      border: '1px dashed var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                        <Icons.FileText style={{ fontSize: '0.875rem' }} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: '700' }}>Beneficiary Bank Details:</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', fontSize: '0.875rem' }}>
                        <div>Account No: <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{req.submittedBy.bankDetails.accountNumber}</span></div>
                        <div>IFSC Code: <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{req.submittedBy.bankDetails.ifsc}</span></div>
                        <div>Bank Name: <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{req.submittedBy.bankDetails.bankName}</span></div>
                        <div>Holder: <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{req.submittedBy.bankDetails.accountHolder}</span></div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginLeft: 'var(--space-2xl)' }}>
                  <Button onClick={() => handleApprove(req._id)} variant="primary" style={{ minWidth: '150px' }}>
                    Approve Payment
                  </Button>
                  <Button onClick={() => setShowRejectModal(req._id)} variant="secondary" style={{ minWidth: '150px' }}>
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {pendingRequests.length === 0 && (
            <Card style={{ padding: 'var(--space-2xl)', textAlign: 'center', backgroundColor: 'transparent', border: '1px dashed var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-tertiary)' }}>No pending payment requests at this time.</div>
            </Card>
          )}
        </div>

        {/* Reject Modal Backdrop */}
        {showRejectModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <Card style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-2xl)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: 'var(--space-md)' }}>Reject Request</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>Please provide a reason for rejecting this payment request. The requester will be notified.</p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                style={{ width: '100%', minHeight: '120px', marginBottom: 'var(--space-xl)' }}
                required
              />

              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                <Button onClick={() => setShowRejectModal(null)} variant="secondary">Cancel</Button>
                <Button onClick={handleReject} variant="primary" style={{ backgroundColor: 'var(--danger-primary)', borderColor: 'var(--danger-primary)' }}>
                  Confirm Rejection
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExpenseApprovals;
