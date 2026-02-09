const ModuleLink = require('../models/ModuleLink');
const ApprovalFlow = require('../models/ApprovalFlow');
const IncentiveRelation = require('../models/IncentiveRelation');
const ModuleConfig = require('../models/ModuleConfig');
const PDFDocument = require('pdfkit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// ModuleLink CRUD
const getModuleLinks = async (req, res) => {
  try {
    const links = await ModuleLink.find();
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createModuleLink = async (req, res) => {
  try {
    const { sourceModule, targetModule, description } = req.body;
    const link = new ModuleLink({ sourceModule, targetModule, description });
    await link.save();
    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateModuleLink = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const link = await ModuleLink.findByIdAndUpdate(id, updates, { new: true });
    if (!link) return res.status(404).json({ message: 'ModuleLink not found' });
    res.json(link);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteModuleLink = async (req, res) => {
  try {
    const { id } = req.params;
    await ModuleLink.findByIdAndDelete(id);
    res.json({ message: 'ModuleLink deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ApprovalFlow CRUD
const getApprovalFlows = async (req, res) => {
  try {
    const flows = await ApprovalFlow.find();
    res.json(flows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createApprovalFlow = async (req, res) => {
  try {
    const { name, steps } = req.body;
    const flow = new ApprovalFlow({ name, steps });
    await flow.save();
    res.status(201).json(flow);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateApprovalFlow = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const flow = await ApprovalFlow.findByIdAndUpdate(id, updates, { new: true });
    if (!flow) return res.status(404).json({ message: 'ApprovalFlow not found' });
    res.json(flow);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteApprovalFlow = async (req, res) => {
  try {
    const { id } = req.params;
    await ApprovalFlow.findByIdAndDelete(id);
    res.json({ message: 'ApprovalFlow deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// IncentiveRelation CRUD
const getIncentiveRelations = async (req, res) => {
  try {
    const relations = await IncentiveRelation.find();
    res.json(relations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createIncentiveRelation = async (req, res) => {
  try {
    const { salaryComponent, incentiveType, relation, value } = req.body;
    const rel = new IncentiveRelation({ salaryComponent, incentiveType, relation, value });
    await rel.save();
    res.status(201).json(rel);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateIncentiveRelation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const rel = await IncentiveRelation.findByIdAndUpdate(id, updates, { new: true });
    if (!rel) return res.status(404).json({ message: 'IncentiveRelation not found' });
    res.json(rel);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteIncentiveRelation = async (req, res) => {
  try {
    const { id } = req.params;
    await IncentiveRelation.findByIdAndDelete(id);
    res.json({ message: 'IncentiveRelation deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ModuleConfig CRUD
const getModuleConfigs = async (req, res) => {
  try {
    const configs = await ModuleConfig.find();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createModuleConfig = async (req, res) => {
  try {
    const { moduleName, enabled } = req.body;
    const config = new ModuleConfig({ moduleName, enabled });
    await config.save();
    res.status(201).json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateModuleConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const config = await ModuleConfig.findByIdAndUpdate(id, updates, { new: true });
    if (!config) return res.status(404).json({ message: 'ModuleConfig not found' });
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteModuleConfig = async (req, res) => {
  try {
    const { id } = req.params;
    await ModuleConfig.findByIdAndDelete(id);
    res.json({ message: 'ModuleConfig deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const exportModuleLinksPdf = async (req, res) => {
  try {
    const links = await ModuleLink.find();
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=modulelinks.pdf');
    doc.pipe(res);
    doc.fontSize(20).text('Module Links Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('Source Module | Target Module | Description');
    doc.moveDown();
    links.forEach(link => {
      doc.text(`${link.sourceModule} | ${link.targetModule} | ${link.description}`);
    });
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const exportModuleLinksCsv = async (req, res) => {
  try {
    const links = await ModuleLink.find();
    const csvWriter = createCsvWriter({
      header: [
        { id: 'sourceModule', title: 'Source Module' },
        { id: 'targetModule', title: 'Target Module' },
        { id: 'description', title: 'Description' }
      ]
    });
    const records = links.map(link => ({
      sourceModule: link.sourceModule,
      targetModule: link.targetModule,
      description: link.description
    }));
    const csvString = await csvWriter.writeRecords(records);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=modulelinks.csv');
    res.send(csvString);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getModuleLinks,
  createModuleLink,
  updateModuleLink,
  deleteModuleLink,
  getApprovalFlows,
  createApprovalFlow,
  updateApprovalFlow,
  deleteApprovalFlow,
  getIncentiveRelations,
  createIncentiveRelation,
  updateIncentiveRelation,
  deleteIncentiveRelation,
  getModuleConfigs,
  createModuleConfig,
  updateModuleConfig,
  deleteModuleConfig,
  exportModuleLinksPdf,
  exportModuleLinksCsv,
};