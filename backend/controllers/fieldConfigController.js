const FieldConfig = require('../models/FieldConfig');

// Get all field configurations
const getFieldConfigs = async (req, res) => {
  try {
    const configs = await FieldConfig.find();
    res.json(configs);
  } catch (error) {
    console.error('Error fetching field configs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get field config by type
const getFieldConfigByType = async (req, res) => {
  try {
    const { type } = req.params;
    const config = await FieldConfig.findOne({ type });

    if (!config) {
      // Return default values if not found
      const defaults = {
        departments: ['Sales', 'Marketing', 'HR', 'Administration', 'Accounts', 'IT', 'Operations'],
        levels: ['Intern', 'Junior Level', 'Mid Level', 'Senior Level', 'Manager', 'Director', 'VP', 'CEO'],
        positions: []
      };

      return res.json({
        type,
        values: defaults[type] || [],
        positions: []
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Error fetching field config:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update field config
const updateFieldConfig = async (req, res) => {
  try {
    const { type } = req.params;
    const { values, positions } = req.body;

    const config = await FieldConfig.findOneAndUpdate(
      { type },
      { values, positions },
      { new: true, upsert: true }
    );

    res.json(config);
  } catch (error) {
    console.error('Error updating field config:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add value to field config
const addFieldValue = async (req, res) => {
  try {
    const { type } = req.params;
    const { value } = req.body;

    if (!value || !value.trim()) {
      return res.status(400).json({ message: 'Value is required' });
    }

    const config = await FieldConfig.findOneAndUpdate(
      { type },
      { $addToSet: { values: value.trim() } },
      { new: true, upsert: true }
    );

    res.json(config);
  } catch (error) {
    console.error('Error adding field value:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove value from field config
const removeFieldValue = async (req, res) => {
  try {
    const { type } = req.params;
    const { value } = req.body;

    const config = await FieldConfig.findOneAndUpdate(
      { type },
      { $pull: { values: value } },
      { new: true }
    );

    res.json(config);
  } catch (error) {
    console.error('Error removing field value:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add position
const addPosition = async (req, res) => {
  try {
    const { name, department, level } = req.body;

    if (!name || !department || !level) {
      return res.status(400).json({ message: 'Name, department, and level are required' });
    }

    const config = await FieldConfig.findOneAndUpdate(
      { type: 'positions' },
      { $push: { positions: { name: name.trim(), department, level } } },
      { new: true, upsert: true }
    );

    res.json(config);
  } catch (error) {
    console.error('Error adding position:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove position
const removePosition = async (req, res) => {
  try {
    const { positionId } = req.params;

    const config = await FieldConfig.findOneAndUpdate(
      { type: 'positions' },
      { $pull: { positions: { _id: positionId } } },
      { new: true }
    );

    res.json(config);
  } catch (error) {
    console.error('Error removing position:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getFieldConfigs,
  getFieldConfigByType,
  updateFieldConfig,
  addFieldValue,
  removeFieldValue,
  addPosition,
  removePosition
};