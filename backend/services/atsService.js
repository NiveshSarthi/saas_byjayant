const fs = require('fs');
const pdfParse = require('pdf-parse');

const commonWords = ['and', 'the', 'is', 'in', 'to', 'of', 'a', 'an', 'for', 'with', 'on', 'at', 'by', 'from', 'as', 'or', 'but', 'not', 'be', 'are', 'was', 'were', 'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'];

function extractKeywords(text) {
  const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 2 && !commonWords.includes(word));
  return [...new Set(words)]; // unique keywords
}

async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

async function calculateATSScore(jdText, resumePath) {
  try {
    const keywords = extractKeywords(jdText);
    const resumeText = await extractTextFromPDF(resumePath);
    const matches = keywords.filter(k => resumeText.toLowerCase().includes(k.toLowerCase()));
    const score = keywords.length > 0 ? (matches.length / keywords.length) * 100 : 0;
    return Math.round(score);
  } catch (error) {
    console.error('Error calculating ATS score:', error);
    return 0;
  }
}

module.exports = {
  calculateATSScore,
};