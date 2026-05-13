const pdf = require('pdf-parse');
const fs = require('fs');

exports.parse = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);

  const text = data.text;

  // Basic skill extraction (FR-08)
  const commonSkills = ['python', 'javascript', 'react', 'flutter', 'node', 'sql', 'java', 'aws'];
  const foundSkills = commonSkills.filter(skill =>
    text.toLowerCase().includes(skill.toLowerCase())
  );

  return {
    text: text,
    skills: foundSkills
  };
};
