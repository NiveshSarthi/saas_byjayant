import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@shared/Button';
import Card from '@shared/Card';

const ApprovalFlows = () => {
  const [flows, setFlows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    steps: [{ role: '', order: 1 }],
  });

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      const response = await axios.get('/api/linking/approval-flows');
      setFlows(response.data);
    } catch (error) {
      console.error('Error fetching approval flows:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index][field] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { role: '', order: formData.steps.length + 1 }],
    });
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/linking/approval-flows', formData);
      setFormData({ name: '', steps: [{ role: '', order: 1 }] });
      setShowForm(false);
      fetchFlows();
    } catch (error) {
      console.error('Error submitting approval flow:', error);
    }
  };

  const deleteFlow = async (id) => {
    try {
      await axios.delete(`/api/linking/approval-flows/${id}`);
      fetchFlows();
    } catch (error) {
      console.error('Error deleting approval flow:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Approval Flows</h1>
      <Button onClick={() => setShowForm(!showForm)} className="mb-4">
        {showForm ? 'Cancel' : 'Add Approval Flow'}
      </Button>
      {showForm && (
        <Card className="mb-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Flow Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Steps</label>
              {formData.steps.map((step, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    placeholder="Role"
                    value={step.role}
                    onChange={(e) => handleStepChange(index, 'role', e.target.value)}
                    className="p-2 border rounded mr-2"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Order"
                    value={step.order}
                    onChange={(e) => handleStepChange(index, 'order', e.target.value)}
                    className="p-2 border rounded mr-2"
                    required
                  />
                  <Button type="button" onClick={() => removeStep(index)} className="bg-red-500 hover:bg-red-700">
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={addStep} className="bg-green-500 hover:bg-green-700">
                Add Step
              </Button>
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flows.map((flow) => (
          <Card key={flow._id} className="p-4">
            <h2 className="text-xl font-bold mb-2">{flow.name}</h2>
            <ul className="mb-2">
              {flow.steps.sort((a, b) => a.order - b.order).map((step, index) => (
                <li key={index}>{step.order}. {step.role}</li>
              ))}
            </ul>
            <Button onClick={() => deleteFlow(flow._id)} className="bg-red-500 hover:bg-red-700">
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApprovalFlows;







