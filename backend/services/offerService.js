// Service for generating offer letters

const generateLOI = (candidate, position, salary) => {
  return `
Letter of Intent

Dear ${candidate.name},

We are pleased to offer you the position of ${position} with a salary of ${salary}.

[Template content here]

Best regards,
HR Team
  `;
};

const generateAppointmentLetter = (candidate, position, salary) => {
  return `
Appointment Letter

Dear ${candidate.name},

You are hereby appointed as ${position} with a salary of ${salary}.

[Template content here]

Best regards,
HR Team
  `;
};

const generateOfferLetter = (candidate, position, salary) => {
  return `
Offer Letter

Dear ${candidate.name},

We offer you the position of ${position} with a salary of ${salary}.

[Template content here]

Best regards,
HR Team
  `;
};

module.exports = {
  generateLOI,
  generateAppointmentLetter,
  generateOfferLetter,
};