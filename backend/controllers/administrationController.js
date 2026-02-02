const Checklist = require('../models/Checklist');
const Task = require('../models/Task');
const Inventory = require('../models/Inventory');
const Expense = require('../models/Expense');
const PDFDocument = require('pdfkit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Checklist CRUD
const createChecklist = async (req, res) => {
  try {
    console.log('Received req.body for checklist creation:', req.body);
    const { title, description, type, items } = req.body;
    const checklist = new Checklist({
      title,
      description,
      type,
      items: items.map(item => ({ item, completed: false })),
      createdBy: req.user.id,
    });
    await checklist.save();
    res.status(201).json(checklist);
  } catch (error) {
    console.error('Error creating checklist:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getChecklists = async (req, res) => {
  try {
    const checklists = await Checklist.find({ createdBy: req.user.id }).populate('createdBy', 'name');
    res.json(checklists);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const checklist = await Checklist.findByIdAndUpdate(id, updates, { new: true });
    if (!checklist) return res.status(404).json({ message: 'Checklist not found' });
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    await Checklist.findByIdAndDelete(id);
    res.json({ message: 'Checklist deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Task CRUD
const createTask = async (req, res) => {
  try {
    console.log('Creating task with req.body:', req.body);
    const { title, description, frequency, assignedTo, dueDate } = req.body;
    const taskData = {
      title,
      description,
      frequency,
      assignedTo: assignedTo || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: req.user.id,
    };
    console.log('Task data to save:', taskData);
    const task = new Task(taskData);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id }).populate('assignedTo', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const task = await Task.findByIdAndUpdate(id, updates, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Inventory CRUD
const createInventory = async (req, res) => {
  try {
    const { name, category, quantity, unit, threshold, location, supplier, lastRestocked } = req.body;
    const inventory = new Inventory({
      name,
      category,
      quantity,
      unit,
      threshold,
      location,
      supplier,
      lastRestocked,
      addedBy: req.user.id,
    });
    await inventory.save();
    res.status(201).json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('addedBy', 'name').populate('assignedTo', 'name');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const inventory = await Inventory.findByIdAndUpdate(id, updates, { new: true });
    if (!inventory) return res.status(404).json({ message: 'Inventory item not found' });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    await Inventory.findByIdAndDelete(id);
    res.json({ message: 'Inventory item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Expense CRUD
const createExpense = async (req, res) => {
  try {
    const { title, category, amount, department, description, date, isRecurring, recurrencePeriod } = req.body;
    const expense = new Expense({
      title,
      category,
      amount,
      department,
      description,
      date,
      isRecurring,
      recurrencePeriod,
      submittedBy: req.user.id,
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ submittedBy: req.user.id }).populate('submittedBy', 'name');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const expense = await Expense.findByIdAndUpdate(id, updates, { new: true });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await Expense.findByIdAndDelete(id);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const exportTasksPdf = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.dueDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    let tasks = await Task.find(query).populate('assignedTo', 'name department');
    if (department) {
      tasks = tasks.filter(task => task.assignedTo && task.assignedTo.department === department);
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks_report.pdf');
    doc.pipe(res);

    // Header
    doc.rect(0, 0, 612, 80).fill('#1E293B');
    doc.fillColor('#FFFFFF').fontSize(24).text('SYNDITECH', 30, 25, { weight: 700 });
    doc.fontSize(12).text('Operations & Tasks Report', 30, 50);
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, 450, 35, { align: 'right' });

    doc.moveDown(4);
    doc.fillColor('#000000');

    // Table Header
    const tableTop = 130;
    const col1 = 30, col2 = 140, col3 = 260, col4 = 360, col5 = 460, col6 = 530;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Task Title', col1, tableTop);
    doc.text('Description', col2, tableTop);
    doc.text('Frequency', col3, tableTop);
    doc.text('Assigned To', col4, tableTop);
    doc.text('Due Date', col5, tableTop);
    doc.text('Status', col6, tableTop);

    doc.moveTo(30, tableTop + 15).lineTo(580, tableTop + 15).strokeColor('#E2E8F0').stroke();

    // Table Content
    let currentY = tableTop + 25;
    doc.font('Helvetica');

    tasks.forEach(task => {
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;
      }

      doc.fontSize(9).fillColor('#475569');
      doc.text(task.title, col1, currentY, { width: 100 });
      doc.text(task.description || 'N/A', col2, currentY, { width: 110 });
      doc.text(task.frequency, col3, currentY);
      doc.text(task.assignedTo ? task.assignedTo.name : 'Unassigned', col4, currentY, { width: 90 });
      doc.text(task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A', col5, currentY);

      const statusColor = task.status === 'Completed' ? '#10B981' : task.status === 'Pending' ? '#F59E0B' : '#64748B';
      doc.fillColor(statusColor).text(task.status, col6, currentY);

      currentY += 25;
      doc.moveTo(30, currentY - 10).lineTo(580, currentY - 10).strokeColor('#F8FAFC').stroke();
    });

    doc.end();
  } catch (error) {
    console.error('Task PDF Export Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const exportTasksCsv = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.dueDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    let tasks = await Task.find(query).populate('assignedTo', 'name department');
    if (department) {
      tasks = tasks.filter(task => task.assignedTo && task.assignedTo.department === department);
    }
    const csvWriter = createCsvWriter({
      header: [
        { id: 'title', title: 'Title' },
        { id: 'description', title: 'Description' },
        { id: 'frequency', title: 'Frequency' },
        { id: 'assignedTo', title: 'Assigned To' },
        { id: 'dueDate', title: 'Due Date' },
        { id: 'status', title: 'Status' }
      ]
    });
    const records = tasks.map(task => ({
      title: task.title,
      description: task.description,
      frequency: task.frequency,
      assignedTo: task.assignedTo ? task.assignedTo.name : 'N/A',
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : 'N/A',
      status: task.status
    }));
    const csvString = await csvWriter.writeRecords(records);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
    res.send(csvString);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const exportInventoryPdf = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('addedBy', 'name');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory_report.pdf');
    doc.pipe(res);

    // Header
    doc.rect(0, 0, 612, 80).fill('#1E293B');
    doc.fillColor('#FFFFFF').fontSize(24).text('SYNDITECH', 30, 25, { weight: 700 });
    doc.fontSize(12).text('Master Inventory Report', 30, 50);
    doc.fontSize(10).text(`Total Items: ${inventory.length}`, 450, 35, { align: 'right' });

    doc.moveDown(4);
    doc.fillColor('#000000');

    // Table Header
    const tableTop = 130;
    const col1 = 30, col2 = 140, col3 = 240, col4 = 320, col5 = 380, col6 = 480, col7 = 530;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Item Name', col1, tableTop);
    doc.text('Category', col2, tableTop);
    doc.text('Qty', col3, tableTop);
    doc.text('Unit', col4, tableTop);
    doc.text('Location', col5, tableTop);
    doc.text('Supplier', col6, tableTop);
    doc.text('Status', col7, tableTop);

    doc.moveTo(30, tableTop + 15).lineTo(580, tableTop + 15).strokeColor('#E2E8F0').stroke();

    // Table Content
    let currentY = tableTop + 25;
    doc.font('Helvetica');

    inventory.forEach(item => {
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;
      }

      const isLowStock = item.quantity <= (item.threshold || 0);

      doc.fontSize(9).fillColor('#475569');
      doc.text(item.name, col1, currentY, { width: 100 });
      doc.text(item.category, col2, currentY, { width: 90 });
      doc.text(item.quantity.toString(), col3, currentY);
      doc.text(item.unit || 'pcs', col4, currentY);
      doc.text(item.location || 'N/A', col5, currentY, { width: 90 });
      doc.text(item.supplier || 'N/A', col6, currentY, { width: 50 });

      doc.fillColor(isLowStock ? '#EF4444' : '#10B981')
        .font('Helvetica-Bold')
        .text(isLowStock ? 'LOW' : 'OK', col7, currentY);
      doc.font('Helvetica');

      currentY += 25;
      doc.moveTo(30, currentY - 10).lineTo(580, currentY - 10).strokeColor('#F8FAFC').stroke();
    });

    doc.end();
  } catch (error) {
    console.error('Inventory PDF Export Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createChecklist,
  getChecklists,
  updateChecklist,
  deleteChecklist,
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  createInventory,
  getInventory,
  updateInventory,
  deleteInventory,
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  exportTasksPdf,
  exportTasksCsv,
  exportInventoryPdf,
};