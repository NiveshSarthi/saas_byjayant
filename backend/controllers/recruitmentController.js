const Recruitment = require('../models/Recruitment');
const Document = require('../models/Document');
const PDFDocument = require('pdfkit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const getAllRecruitments = async (req, res) => {
  try {
    const recruitments = await Recruitment.find().populate('createdBy');
    res.json(recruitments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getRecruitmentById = async (req, res) => {
  try {
    const recruitment = await Recruitment.findById(req.params.id).populate('createdBy');
    if (!recruitment) {
      return res.status(404).json({ message: 'Recruitment not found' });
    }
    res.json(recruitment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createRecruitment = async (req, res) => {
  try {
    const { title, position, description, department, level, numberOfPositions, targetDate, requirements, stages } = req.body;
    const recruitment = new Recruitment({
      title: title || position || 'New Position',
      position: position || title || 'New Position',
      description: description || 'No description provided',
      department,
      level,
      numberOfPositions: numberOfPositions || 1,
      targetDate: (targetDate && targetDate.trim() !== '') ? targetDate : undefined,
      requirements,
      stages: stages || ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'],
      createdBy: req.user.id,
    });
    await recruitment.save();
    res.status(201).json(recruitment);
  } catch (error) {
    console.error('Error creating recruitment:', error);
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors || error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateRecruitment = async (req, res) => {
  try {
    const { title, position, description, department, level, numberOfPositions, targetDate, requirements, stages } = req.body;
    const recruitment = await Recruitment.findByIdAndUpdate(
      req.params.id,
      { title: title || position, position: position || title, description, department, level, numberOfPositions, targetDate, requirements, stages },
      { new: true }
    ).populate('createdBy');
    if (!recruitment) {
      return res.status(404).json({ message: 'Recruitment not found' });
    }
    res.json(recruitment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteRecruitment = async (req, res) => {
  try {
    const recruitment = await Recruitment.findByIdAndDelete(req.params.id);
    if (!recruitment) {
      return res.status(404).json({ message: 'Recruitment not found' });
    }
    res.json({ message: 'Recruitment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Methods for candidates
const addCandidate = async (req, res) => {
  try {
    const { recruitmentId, name, email, phone, resume, notes } = req.body;
    const recruitment = await Recruitment.findById(recruitmentId);
    if (!recruitment) {
      return res.status(404).json({ message: 'Recruitment not found' });
    }
    recruitment.candidates.push({
      name,
      email,
      phone,
      resume,
      notes,
    });
    await recruitment.save();
    res.json(recruitment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCandidateStage = async (req, res) => {
  try {
    const { recruitmentId, candidateId, stage } = req.body;
    const recruitment = await Recruitment.findById(recruitmentId);
    if (!recruitment) {
      return res.status(404).json({ message: 'Recruitment not found' });
    }
    const candidate = recruitment.candidates.id(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    candidate.stage = stage;
    await recruitment.save();
    res.json(recruitment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getRecruitmentStats = async (req, res) => {
  try {
    const total = await Recruitment.countDocuments();
    const open = await Recruitment.countDocuments({ status: 'open' });
    const closed = await Recruitment.countDocuments({ status: 'closed' });
    res.json({ total, open, closed });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const closeRecruitment = async (req, res) => {
  try {
    const { candidateName, candidateEmail, sendLOI, sendAL, sendOL, joiningDate, salary } = req.body;
    const recruitment = await Recruitment.findByIdAndUpdate(
      req.params.id,
      { status: 'closed', closedDate: new Date() },
      { new: true }
    );
    if (!recruitment) {
      return res.status(404).json({ message: 'Recruitment not found' });
    }
    // Here you would typically trigger email sending logic based on sendLOI, sendAL, sendOL
    res.json({ message: 'Requirement closed successfully', recruitment });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// For offer generation, perhaps a service, but here basic
const generateOffer = async (req, res) => {
  try {
    // Logic to generate offer letter, perhaps use a template
    // For now, just return a placeholder
    res.json({ message: 'Offer generated', offer: 'LOI template here' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const exportRecruitmentsPdf = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (department) {
      query.department = department;
    }
    const recruitments = await Recruitment.find(query).populate('createdBy', 'name');
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=recruitments.pdf');
    doc.pipe(res);
    doc.fontSize(20).text('Recruitments Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('Title | Department | Created By | Candidates Count');
    doc.moveDown();
    recruitments.forEach(rec => {
      doc.text(`${rec.title} | ${rec.department} | ${rec.createdBy ? rec.createdBy.name : 'N/A'} | ${rec.candidates.length}`);
    });
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const exportRecruitmentsCsv = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (department) {
      query.department = department;
    }
    const recruitments = await Recruitment.find(query).populate('createdBy', 'name');
    const csvWriter = createCsvWriter({
      header: [
        { id: 'title', title: 'Title' },
        { id: 'department', title: 'Department' },
        { id: 'createdBy', title: 'Created By' },
        { id: 'candidatesCount', title: 'Candidates Count' }
      ]
    });
    const records = recruitments.map(rec => ({
      title: rec.title,
      department: rec.department,
      createdBy: rec.createdBy ? rec.createdBy.name : 'N/A',
      candidatesCount: rec.candidates.length
    }));
    const csvString = await csvWriter.writeRecords(records);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=recruitments.csv');
    res.send(csvString);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllRecruitments,
  getRecruitmentById,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
  addCandidate,
  updateCandidateStage,
  getRecruitmentStats,
  closeRecruitment,
  generateOffer,
  exportRecruitmentsPdf,
  exportRecruitmentsCsv,
};