const Document = require('../models/Document');
const multer = require('multer');

// Assuming upload is set in server.js, but for controller, we can use it in routes

const uploadDocument = async (req, res) => {
  try {
    const { name, type, employeeId, recruitmentId } = req.body;
    const filePath = req.file.path;
    const document = new Document({
      name,
      type,
      filePath,
      uploadedBy: req.user.id,
      employee: employeeId,
      recruitment: recruitmentId,
    });
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find().populate('uploadedBy').populate('employee');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
};