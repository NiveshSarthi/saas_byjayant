const Recruitment = require('../models/Recruitment');
const { calculateATSScore } = require('../services/atsService');

const uploadATS = async (req, res) => {
  try {
    const { title, description, department } = req.body;
    const files = req.files || [];

    if (!title || !description) {
      return res.status(400).json({ message: 'Job title and description are required' });
    }

    const recruitment = new Recruitment({
      title,
      position: title,
      description,
      department: department || 'General',
      createdBy: req.user.id,
    });

    for (const file of files) {
      // Assume filename format: First_Last_email.pdf
      const filename = file.originalname.replace('.pdf', '');
      const parts = filename.split('_');
      if (parts.length < 3) continue; // skip invalid
      const name = `${parts[0]} ${parts[1]}`;
      const email = parts[2];
      const score = await calculateATSScore(description, file.path);
      recruitment.candidates.push({
        name,
        email,
        resume: file.path,
        atsScore: score,
      });
    }

    await recruitment.save();
    res.status(201).json(recruitment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const computeScores = async (req, res) => {
  try {
    const recruitment = await Recruitment.findById(req.params.id);
    if (!recruitment) {
      return res.status(404).json({ message: 'Recruitment not found' });
    }
    for (const candidate of recruitment.candidates) {
      if (candidate.resume) {
        candidate.atsScore = await calculateATSScore(recruitment.description, candidate.resume);
      }
    }
    await recruitment.save();
    res.json(recruitment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadATS,
  computeScores,
};