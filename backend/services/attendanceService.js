const calculateWorkingHours = (checkInTime, checkOutTime) => {
  if (!checkInTime || !checkOutTime) return 0;
  const diff = (checkOutTime - checkInTime) / (1000 * 60 * 60); // hours
  return Math.round(diff * 100) / 100;
};

const getStandardWorkingHours = () => 8; // 8 hours per day

const isOvertime = (workingHours) => workingHours > getStandardWorkingHours();

module.exports = {
  calculateWorkingHours,
  getStandardWorkingHours,
  isOvertime,
};