import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './Card';
import Button from './Button';
import { Icons } from './Icons';

const InboxPanel = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });

  useEffect(() => {
    if (isOpen && !showNewTicket) {
      fetchTickets();
    }
  }, [isOpen, page, showNewTicket]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tickets?page=${page}&limit=10`);
      if (page === 1) {
        setTickets(response.data.tickets);
      } else {
        setTickets(prev => [...prev, ...response.data.tickets]);
      }
      setHasMore(response.data.tickets.length === 10);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    try {
      setLoading(true);
      await axios.post('/api/tickets', newTicket);
      setNewTicket({
        subject: '',
        message: '',
        category: 'general',
        priority: 'medium'
      });
      setShowNewTicket(false);
      setPage(1);
      fetchTickets();
      alert('Ticket submitted successfully!');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'var(--warning-primary)';
      case 'in-progress': return 'var(--info-primary)';
      case 'resolved': return 'var(--success-primary)';
      case 'closed': return 'var(--text-tertiary)';
      default: return 'var(--text-secondary)';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'var(--danger-primary)';
      case 'high': return 'var(--warning-primary)';
      case 'medium': return 'var(--info-primary)';
      case 'low': return 'var(--text-tertiary)';
      default: return 'var(--text-secondary)';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ padding: 'var(--space-2xl)' }}>
      <Card style={{ padding: 'var(--space-lg)', margin: 0 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-lg)',
          paddingBottom: 'var(--space-md)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            {showNewTicket ? 'New Ticket' : 'Messages & Tickets'}
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {!showNewTicket && (
              <Button
                onClick={() => setShowNewTicket(true)}
                variant="primary"
                size="sm"
              >
                New Ticket
              </Button>
            )}
            {showNewTicket && (
              <Button
                onClick={() => setShowNewTicket(false)}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              style={{ padding: '0.25rem' }}
            >
              <Icons.X style={{ width: '1rem', height: '1rem' }} />
            </Button>
          </div>
        </div>

        {/* New Ticket Form */}
        {showNewTicket && (
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: 'var(--space-xs)',
                  color: 'var(--text-primary)'
                }}>
                  Subject *
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 'var(--space-sm) var(--space-md)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: 'var(--space-xs)',
                  color: 'var(--text-primary)'
                }}>
                  Category
                </label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 'var(--space-sm) var(--space-md)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="general">General</option>
                  <option value="payroll">Payroll</option>
                  <option value="leave">Leave</option>
                  <option value="attendance">Attendance</option>
                  <option value="it">IT Support</option>
                  <option value="facility">Facility</option>
                  <option value="hr">HR</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: 'var(--space-xs)',
                  color: 'var(--text-primary)'
                }}>
                  Priority
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 'var(--space-sm) var(--space-md)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: 'var(--space-xs)',
                  color: 'var(--text-primary)'
                }}>
                  Message *
                </label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 'var(--space-sm) var(--space-md)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Detailed description of your issue or request"
                />
              </div>

              <Button
                onClick={createTicket}
                variant="primary"
                disabled={loading || !newTicket.subject || !newTicket.message}
                style={{ width: '100%' }}
              >
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </div>
          </div>
        )}

        {/* Tickets List */}
        {!showNewTicket && (
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)'
          }}>
            {tickets.length === 0 && !loading && (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-2xl)',
                color: 'var(--text-tertiary)'
              }}>
                <Icons.Mail style={{ width: '2rem', height: '2rem', marginBottom: 'var(--space-md)', opacity: 0.5 }} />
                <div>No tickets yet</div>
                <Button
                  onClick={() => setShowNewTicket(true)}
                  variant="ghost"
                  style={{ marginTop: 'var(--space-md)' }}
                >
                  Create your first ticket
                </Button>
              </div>
            )}

            {tickets.map(ticket => (
              <div
                key={ticket._id}
                style={{
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-accent)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-surface)'}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 'var(--space-sm)'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    flex: 1,
                    marginRight: 'var(--space-md)'
                  }}>
                    {ticket.subject}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: getStatusColor(ticket.status),
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {ticket.status}
                  </div>
                </div>

                <div style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4',
                  marginBottom: 'var(--space-sm)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {ticket.message}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-sm)',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      textTransform: 'capitalize'
                    }}>
                      {ticket.category}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: getPriorityColor(ticket.priority),
                      fontWeight: '500'
                    }}>
                      {ticket.priority}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)'
                  }}>
                    {formatTime(ticket.createdAt)}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-lg)',
                color: 'var(--text-tertiary)'
              }}>
                Loading...
              </div>
            )}

            {hasMore && !loading && (
              <Button
                onClick={() => setPage(prev => prev + 1)}
                variant="ghost"
                style={{ width: '100%', marginTop: 'var(--space-md)' }}
              >
                Load More
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default InboxPanel;