import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../src/components/shared/Layout';
import Button from '@shared/Button';
import Card from '@shared/Card';
import StatCard from '@shared/StatCard';
import Badge from '@shared/Badge';
import { Icons } from '@shared/Icons';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/administration/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/administration/tasks', formData);
      setFormData({ title: '', description: '', frequency: 'daily', assignedTo: '', dueDate: '', priority: 'medium' });
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/administration/tasks/${id}`, { status });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/api/administration/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const exportTasks = async (format) => {
    try {
      const response = await axios.get(`/api/administration/export/${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tasks.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export tasks');
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;

  return (
    <Layout>
      <div style={{ padding: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: 'var(--space-xl)' }}>Tasks Dashboard</h1>

        <div className="grid-4" style={{ gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        <StatCard icon={<Icons.Clipboard />} label="Total Tasks" value={totalTasks} />
        <StatCard icon={<Icons.CheckSquare />} label="Completed" value={completedTasks} />
        <StatCard icon={<Icons.Clock />} label="In Progress" value={inProgressTasks} />
        <StatCard icon={<Icons.Target />} label="Overdue" value={overdueTasks} />
      </div>

        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'secondary' : 'primary'}>
            {showForm ? 'Cancel' : 'Create Task'}
          </Button>
          <Button onClick={() => exportTasks('pdf')} variant="outline">
            Export PDF
          </Button>
          <Button onClick={() => exportTasks('csv')} variant="outline">
            Export CSV
          </Button>
        </div>
        {showForm && (
          <Card style={{ marginBottom: 'var(--space-lg)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label>Frequency</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>

              </select>
            </div>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label>Assigned To (User ID)</label>
              <input
                type="text"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
              />
            </div>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
            <Button type="submit">Create</Button>
          </form>
        </Card>
      )}
        <div className="grid-auto" style={{ gap: 'var(--space-lg)' }}>
          {tasks.map((task) => (
            <Card key={task._id} style={{ padding: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{task.title}</h2>
                <Badge className={task.status === 'completed' ? 'badge-success' : task.status === 'in-progress' ? 'badge-warning' : 'badge-neutral'}>{task.status}</Badge>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>{task.description}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>Frequency: {task.frequency}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>Assigned To: {task.assignedTo?.name || 'Unassigned'}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>Due Date: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                <Button onClick={() => updateStatus(task._id, 'in-progress')} variant="secondary">
                  In Progress
                </Button>
                <Button onClick={() => updateStatus(task._id, 'completed')} variant="primary">
                  Completed
                </Button>
              </div>
              <Button onClick={() => deleteTask(task._id)} variant="ghost" style={{ color: '#EF4444' }}>
                Delete
              </Button>
          </Card>
        ))}
      </div>
    </div>
    </Layout>
  );
};

export default Tasks;







