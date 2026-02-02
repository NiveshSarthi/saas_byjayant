const Appraisal = require('../models/Appraisal');
const PDFDocument = require('pdfkit');

const getAppraisals = async (req, res) => {
  try {
    const appraisals = await Appraisal.find()
      .populate('employee')
      .populate('reviewer')
      .sort({ createdAt: -1 });
    res.json(appraisals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAppraisalById = async (req, res) => {
  try {
    const appraisal = await Appraisal.findById(req.params.id)
      .populate('employee')
      .populate('reviewer');
    if (!appraisal) {
      const error = new Error('Appraisal not found');
      error.statusCode = 404;
      throw error;
    }
    res.json(appraisal);
  } catch (error) {
    throw error;
  }
};

const createAppraisal = async (req, res) => {
  try {
    const appraisal = new Appraisal(req.body);
    await appraisal.save();
    res.status(201).json(appraisal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAppraisal = async (req, res) => {
  try {
    const appraisal = await Appraisal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appraisal) return res.status(404).json({ message: 'Appraisal not found' });
    res.json(appraisal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAppraisal = async (req, res) => {
  try {
    const appraisal = await Appraisal.findByIdAndDelete(req.params.id);
    if (!appraisal) return res.status(404).json({ message: 'Appraisal not found' });
    res.json({ message: 'Appraisal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const generateAppraisalLetter = async (req, res) => {
  try {
    const appraisal = await Appraisal.findById(req.params.id)
      .populate('employee')
      .populate('reviewer');

    if (!appraisal) return res.status(404).json({ message: 'Appraisal not found' });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=appraisal-${appraisal.employee.user.name}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('PERFORMANCE APPRAISAL LETTER', { align: 'center' });
    doc.moveDown();

    // Employee Details
    doc.fontSize(12).text(`Employee Name: ${appraisal.employee.user.name}`);
    doc.text(`Position: ${appraisal.employee.position}`);
    doc.text(`Department: ${appraisal.employee.department}`);
    doc.text(`Appraisal Period: ${appraisal.period}`);
    doc.text(`Review Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Ratings
    doc.fontSize(14).text('Performance Ratings:', { underline: true });
    doc.fontSize(12);
    doc.text(`Performance: ${appraisal.ratings.performance}/5`);
    doc.text(`Skills: ${appraisal.ratings.skills}/5`);
    doc.text(`Attitude: ${appraisal.ratings.attitude}/5`);
    doc.text(`Overall: ${appraisal.ratings.overall}/5`);
    doc.moveDown();

    // Achievements
    if (appraisal.achievements.length > 0) {
      doc.fontSize(14).text('Achievements:', { underline: true });
      doc.fontSize(12);
      appraisal.achievements.forEach(achievement => {
        doc.text(`• ${achievement}`);
      });
      doc.moveDown();
    }

    // Areas for Improvement
    if (appraisal.areasForImprovement.length > 0) {
      doc.fontSize(14).text('Areas for Improvement:', { underline: true });
      doc.fontSize(12);
      appraisal.areasForImprovement.forEach(area => {
        doc.text(`• ${area}`);
      });
      doc.moveDown();
    }

    // Goals
    if (appraisal.goals.length > 0) {
      doc.fontSize(14).text('Future Goals:', { underline: true });
      doc.fontSize(12);
      appraisal.goals.forEach(goal => {
        doc.text(`• ${goal.description} (Target: ${new Date(goal.targetDate).toLocaleDateString()})`);
      });
      doc.moveDown();
    }

    // Comments
    if (appraisal.comments) {
      doc.fontSize(14).text('Comments:', { underline: true });
      doc.fontSize(12).text(appraisal.comments);
      doc.moveDown();
    }

    // Signature
    doc.moveDown(2);
    doc.text('Reviewer: ___________________________', { align: 'right' });
    doc.text(`${appraisal.reviewer.name}`, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });

    doc.end();

    // Mark as generated
    appraisal.appraisalLetterGenerated = true;
    await appraisal.save();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAppraisals,
  getAppraisalById,
  createAppraisal,
  updateAppraisal,
  deleteAppraisal,
  generateAppraisalLetter
};