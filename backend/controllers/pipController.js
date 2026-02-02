const PIP = require('../models/PIP');

const getPIPs = async (req, res) => {
  try {
    const pips = await PIP.find()
      .populate('employee')
      .populate('initiatedBy')
      .sort({ createdAt: -1 });
    res.json(pips);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getPIPById = async (req, res) => {
  try {
    const pip = await PIP.findById(req.params.id)
      .populate('employee')
      .populate('initiatedBy');
    if (!pip) return res.status(404).json({ message: 'PIP not found' });
    res.json(pip);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createPIP = async (req, res) => {
  try {
    const pip = new PIP(req.body);
    await pip.save();
    res.status(201).json(pip);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePIP = async (req, res) => {
  try {
    const pip = await PIP.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pip) return res.status(404).json({ message: 'PIP not found' });
    res.json(pip);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deletePIP = async (req, res) => {
  try {
    const pip = await PIP.findByIdAndDelete(req.params.id);
    if (!pip) return res.status(404).json({ message: 'PIP not found' });
    res.json({ message: 'PIP deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addReview = async (req, res) => {
  try {
    const { comments, progress, nextSteps } = req.body;
    const pip = await PIP.findById(req.params.id);
    if (!pip) return res.status(404).json({ message: 'PIP not found' });

    pip.reviews.push({
      date: new Date(),
      reviewer: req.user._id,
      comments,
      progress,
      nextSteps
    });

    await pip.save();
    res.json(pip);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateObjective = async (req, res) => {
  try {
    const { objectiveIndex, status, progress } = req.body;
    const pip = await PIP.findById(req.params.id);
    if (!pip) return res.status(404).json({ message: 'PIP not found' });

    if (pip.objectives[objectiveIndex]) {
      pip.objectives[objectiveIndex].status = status;
      pip.objectives[objectiveIndex].progress = progress;
    }

    await pip.save();
    res.json(pip);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const completePIP = async (req, res) => {
  try {
    const { outcome, finalComments } = req.body;
    const pip = await PIP.findByIdAndUpdate(req.params.id, {
      status: 'Completed',
      outcome,
      finalComments
    }, { new: true });

    if (!pip) return res.status(404).json({ message: 'PIP not found' });
    res.json(pip);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPIPs,
  getPIPById,
  createPIP,
  updatePIP,
  deletePIP,
  addReview,
  updateObjective,
  completePIP
};