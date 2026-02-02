const SalesPolicy = require('../models/SalesPolicy');

const getPolicies = async (req, res) => {
  try {
    const policies = await SalesPolicy.find();
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createPolicy = async (req, res) => {
  try {
    const policy = new SalesPolicy(req.body);
    await policy.save();
    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePolicy = async (req, res) => {
  try {
    const policy = await SalesPolicy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deletePolicy = async (req, res) => {
  try {
    const policy = await SalesPolicy.findByIdAndDelete(req.params.id);
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    res.json({ message: 'Policy deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy
};