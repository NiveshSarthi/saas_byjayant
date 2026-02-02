const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendAlertEmail } = require('./emailService');

// Function to get today's tasks for a user
const getTodaysTasks = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks = await Task.find({
    assignedTo: userId,
    dueDate: { $gte: today, $lt: tomorrow },
    status: { $ne: 'completed' },
  }).populate('assignedTo', 'email name');

  return tasks;
};

// Cron job to send alerts for due tasks
const scheduleAlerts = () => {
  // Run every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Checking for due tasks...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueTasks = await Task.find({
      dueDate: { $gte: today, $lt: tomorrow },
      status: { $ne: 'completed' },
    }).populate('assignedTo', 'email name');

    for (const task of dueTasks) {
      // Check if alert already sent today
      const todayAlert = task.alerts.find(alert => {
        const alertDate = new Date(alert.sentAt);
        return alertDate.toDateString() === today.toDateString();
      });

      if (!todayAlert) {
        const message = `Hey ${task.assignedTo.name}, you have these tasks today: ${task.title}`;
        await sendAlertEmail(task.assignedTo.email, message);
        task.alerts.push({ message, sentAt: new Date() });
        await task.save();
      }
    }
  });
};

// Function to update recurring tasks after completion
const updateRecurringTask = async (taskId) => {
  const task = await Task.findById(taskId);
  if (task && task.frequency !== 'one-time') {
    const nextDueDate = new Date(task.dueDate);
    if (task.frequency === 'daily') {
      nextDueDate.setDate(nextDueDate.getDate() + 1);
    } else if (task.frequency === 'weekly') {
      nextDueDate.setDate(nextDueDate.getDate() + 7);
    } else if (task.frequency === 'monthly') {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }
    task.dueDate = nextDueDate;
    task.status = 'pending';
    await task.save();
  }
};

module.exports = {
  getTodaysTasks,
  scheduleAlerts,
  updateRecurringTask,
};