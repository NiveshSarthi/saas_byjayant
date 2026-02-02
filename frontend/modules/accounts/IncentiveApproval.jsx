import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@shared/Button';

const IncentiveApproval = () => {
  const [incentives, setIncentives] = useState([]);

  useEffect(() => {
    fetchIncentives();
  }, []);

  const fetchIncentives = async () => {
    try {
      const response = await axios.get('/api/accounts/incentives');
      setIncentives(response.data);
    } catch (error) {
      console.error('Error fetching incentives:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/accounts/incentives/${id}/approve`);
      fetchIncentives();
    } catch (error) {
      console.error('Error approving incentive:', error);
    }
  };

  const handleRelease = async (id) => {
    try {
      await axios.put(`/api/accounts/incentives/${id}/release`);
      fetchIncentives();
    } catch (error) {
      console.error('Error releasing incentive:', error);
    }
  };

  const getStatus = (incentive) => {
    if (incentive.released) return 'Released';
    if (incentive.approved) return 'Approved';
    if (!incentive.isLocked) return 'Unlocked';
    return 'Locked';
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Incentive Approval</h1>
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="p-2">Employee</th>
            <th className="p-2">Deal Value</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {incentives.map(incentive => (
            <tr key={incentive._id}>
              <td className="p-2">{incentive.employee.name}</td>
              <td className="p-2">{incentive.deal.dealValue}</td>
              <td className="p-2">{incentive.amount}</td>
              <td className="p-2">{getStatus(incentive)}</td>
              <td className="p-2">
                {!incentive.isLocked && !incentive.approved && (
                  <Button onClick={() => handleApprove(incentive._id)}>Approve</Button>
                )}
                {incentive.approved && !incentive.released && (
                  <Button onClick={() => handleRelease(incentive._id)}>Release</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncentiveApproval;







