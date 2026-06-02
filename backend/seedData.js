const { Job, Employer, User, sequelize } = require('./models');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to cloud database.');

    // 1. Reset existing jobs to avoid duplicates
    console.log('Cleaning old data...');
    await sequelize.query('TRUNCATE TABLE "jobs" CASCADE;');

    // 2. Get or Create Employer
    let employerUser = await User.findOne({ where: { role: 'employer' } });
    if (!employerUser) {
      employerUser = await User.create({
        email: 'hr@techworld.com',
        passwordHash: '$2a$10$Xm.5f.UfWvBqU7GZ0yGvU.S0u9yvXG7L6R0fT5J1T9G1.G1.G1.G',
        role: 'employer',
        firstName: 'Sarah',
        lastName: 'Recruiter'
      });
    }
    let employer = await Employer.findOne({ where: { userId: employerUser.id } });
    if (!employer) {
      employer = await Employer.create({
        userId: employerUser.id,
        companyName: 'TechWorld Global',
        description: 'A leading international provider of multi-industry solutions.'
      });
    }

    const jobList = [
      // --- TECHNOLOGY (10) ---
      { category: 'Technology', title: 'Senior Flutter Developer', description: 'Lead our mobile development strategy. Build high-scale apps.', requirements: '5+ years experience, expert in Dart, Flutter, and Firebase.', location: 'Remote', salaryMin: 90000, salaryMax: 140000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Technology', title: 'Junior Flutter Intern', description: 'Work alongside senior devs to build mobile features.', requirements: 'Currently studying CS, basic knowledge of Dart and UI widgets.', location: 'San Francisco', salaryMin: 1500, salaryMax: 2500, jobType: 'internship', workMode: 'hybrid', employerId: employer.id },
      { category: 'Technology', title: 'Backend Node.js Engineer', description: 'Architect scalable microservices using Express and Postgres.', requirements: 'Experience with Node.js, SQL, and RESTful API design.', location: 'Remote', salaryMin: 85000, salaryMax: 130000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Technology', title: 'Cybersecurity Analyst', description: 'Monitor networks for security breaches and investigate violations.', requirements: 'Experience with firewalls, encryption, and security protocols.', location: 'Washington DC', salaryMin: 75000, salaryMax: 110000, jobType: 'full-time', workMode: 'onsite', employerId: employer.id },
      { category: 'Technology', title: 'Cloud Infrastructure Intern', description: 'Assist in managing AWS and Azure cloud environments.', requirements: 'Understanding of Linux, Networking, and Cloud basics.', location: 'Chicago', salaryMin: 2000, salaryMax: 3000, jobType: 'internship', workMode: 'hybrid', employerId: employer.id },
      { category: 'Technology', title: 'Machine Learning Scientist', description: 'Develop predictive models and integrate AI into our core products.', requirements: 'PhD or Masters in CS/Math, experience with PyTorch or TensorFlow.', location: 'Remote', salaryMin: 110000, salaryMax: 180000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Technology', title: 'React Frontend Developer', description: 'Create high-performance web dashboards for our clients.', requirements: 'Proficiency in React, TypeScript, and modern CSS frameworks.', location: 'Austin, TX', salaryMin: 80000, salaryMax: 120000, jobType: 'full-time', workMode: 'onsite', employerId: employer.id },
      { category: 'Technology', title: 'Mobile QA Intern', description: 'Help ensure our apps are bug-free through manual and automated tests.', requirements: 'Detail-oriented, basic understanding of mobile platforms.', location: 'Remote', salaryMin: 1200, salaryMax: 1800, jobType: 'internship', workMode: 'remote', employerId: employer.id },
      { category: 'Technology', title: 'DevOps Specialist', description: 'Automate deployment pipelines and manage server health.', requirements: 'Experience with Docker, Kubernetes, and CI/CD tools.', location: 'Seattle', salaryMin: 100000, salaryMax: 150000, jobType: 'full-time', workMode: 'hybrid', employerId: employer.id },
      { category: 'Technology', title: 'Blockchain Intern', description: 'Explore smart contract development on Ethereum.', requirements: 'Knowledge of Solidity and decentralized systems.', location: 'Remote', salaryMin: 2500, salaryMax: 4000, jobType: 'internship', workMode: 'remote', employerId: employer.id },

      // --- FINANCE (10) ---
      { category: 'Finance', title: 'Investment Banker', description: 'Provide capital raising and M&A advisory services.', requirements: 'Strong financial modeling, 3+ years in IB.', location: 'New York', salaryMin: 120000, salaryMax: 200000, jobType: 'full-time', workMode: 'onsite', employerId: employer.id },
      { category: 'Finance', title: 'Junior Accountant Intern', description: 'Assist with monthly closings and bank reconciliations.', requirements: 'Accounting student, proficient in Excel.', location: 'Chicago', salaryMin: 1800, salaryMax: 2600, jobType: 'internship', workMode: 'onsite', employerId: employer.id },
      { category: 'Finance', title: 'Risk Management Analyst', description: 'Identify and evaluate operational and market risks.', requirements: 'Degree in Finance or Math, strong analytical skills.', location: 'London', salaryMin: 70000, salaryMax: 110000, jobType: 'full-time', workMode: 'hybrid', employerId: employer.id },
      { category: 'Finance', title: 'Tax Planning Intern', description: 'Support the tax team with filings and research.', requirements: 'Knowledge of local tax codes, currently in university.', location: 'Remote', salaryMin: 2000, salaryMax: 3000, jobType: 'internship', workMode: 'remote', employerId: employer.id },
      { category: 'Finance', title: 'Portfolio Manager', description: 'Direct the investment strategy for multi-million dollar funds.', requirements: 'CFA charterholder, 7+ years experience.', location: 'Zurich', salaryMin: 150000, salaryMax: 250000, jobType: 'full-time', workMode: 'onsite', employerId: employer.id },
      { category: 'Finance', title: 'Financial Analyst Intern', description: 'Assist in creating yearly budgets and forecasts.', requirements: 'Finance major, passionate about data.', location: 'San Francisco', salaryMin: 2500, salaryMax: 3800, jobType: 'internship', workMode: 'hybrid', employerId: employer.id },
      { category: 'Finance', title: 'Corporate Auditor', description: 'Verify financial statements and internal controls.', requirements: 'CPA license, experience with public accounting.', location: 'Remote', salaryMin: 75000, salaryMax: 100000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Finance', title: 'Wealth Management Intern', description: 'Learn to manage high-net-worth individual portfolios.', requirements: 'Excellent communication, interest in personal finance.', location: 'Miami', salaryMin: 1500, salaryMax: 2400, jobType: 'internship', workMode: 'onsite', employerId: employer.id },
      { category: 'Finance', title: 'Treasury Specialist', description: 'Manage the company cash flow and liquidity risk.', requirements: 'Experience in treasury or cash management.', location: 'Berlin', salaryMin: 65000, salaryMax: 90000, jobType: 'full-time', workMode: 'hybrid', employerId: employer.id },
      { category: 'Finance', title: 'Stock Market Research Intern', description: 'Perform deep dives into individual tech stocks.', requirements: 'Ability to read 10-K reports, strong writing skills.', location: 'Remote', salaryMin: 2000, salaryMax: 3200, jobType: 'internship', workMode: 'remote', employerId: employer.id },

      // --- DESIGN (10) ---
      { category: 'Design', title: 'Senior UI/UX Designer', description: 'Lead the design vision for our web and mobile platforms.', requirements: 'Portfolio with high-quality case studies, expert in Figma.', location: 'London', salaryMin: 80000, salaryMax: 120000, jobType: 'full-time', workMode: 'hybrid', employerId: employer.id },
      { category: 'Design', title: 'Graphic Design Intern', description: 'Create visual assets for social media and marketing.', requirements: 'Proficiency in Photoshop and Illustrator.', location: 'Paris', salaryMin: 1200, salaryMax: 1800, jobType: 'internship', workMode: 'remote', employerId: employer.id },
      { category: 'Design', title: 'Product Designer', description: 'Bridge the gap between user needs and engineering possibilities.', requirements: '3+ years in product design, experience with design systems.', location: 'New York', salaryMin: 90000, salaryMax: 135000, jobType: 'full-time', workMode: 'onsite', employerId: employer.id },
      { category: 'Design', title: 'UX Research Intern', description: 'Conduct user interviews and synthesize feedback.', requirements: 'Background in Psychology or Design, curious mindset.', location: 'Remote', salaryMin: 2000, salaryMax: 3000, jobType: 'internship', workMode: 'remote', employerId: employer.id },
      { category: 'Design', title: 'Motion Graphics Artist', description: 'Produce 2D/3D animations for product explainers.', requirements: 'After Effects, Cinema 4D, creative flair.', location: 'Remote', salaryMin: 60000, salaryMax: 90000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Design', title: 'Web Design Intern', description: 'Design modern responsive websites for our brands.', requirements: 'Knowledge of HTML/CSS, eye for typography.', location: 'Amsterdam', salaryMin: 1800, salaryMax: 2500, jobType: 'internship', workMode: 'hybrid', employerId: employer.id },
      { category: 'Design', title: 'Brand Identity Lead', description: 'Define the visual language for our parent company.', requirements: 'Expert in branding and logo design.', location: 'Remote', salaryMin: 85000, salaryMax: 110000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Design', title: 'Game Environment Intern', description: 'Help build 3D worlds for our upcoming title.', requirements: 'Blender/Maya, passion for gaming.', location: 'Tokyo', salaryMin: 2500, salaryMax: 4000, jobType: 'internship', workMode: 'onsite', employerId: employer.id },
      { category: 'Design', title: 'Illustrator', description: 'Create unique editorial illustrations for our blog.', requirements: 'Distinct artistic style, proficient in digital drawing.', location: 'Remote', salaryMin: 50000, salaryMax: 70000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Design', title: 'Interaction Design Intern', description: 'Refine micro-interactions and transitions in our mobile app.', requirements: 'Knowledge of Principle or Framer.', location: 'New York', salaryMin: 2200, salaryMax: 3500, jobType: 'internship', workMode: 'hybrid', employerId: employer.id },

      // --- MARKETING (10) ---
      { category: 'Marketing', title: 'Social Media Manager', description: 'Grow our presence on LinkedIn, Twitter, and TikTok.', requirements: 'Excellent copywriting, data-driven mindset.', location: 'Remote', salaryMin: 55000, salaryMax: 80000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Marketing', title: 'Content Writer Intern', description: 'Write engaging blog posts and SEO-friendly articles.', requirements: 'Native English, strong research ability.', location: 'London', salaryMin: 1500, salaryMax: 2200, jobType: 'internship', workMode: 'hybrid', employerId: employer.id },
      { category: 'Marketing', title: 'SEO Specialist', description: 'Optimize our site architecture for maximum organic reach.', requirements: 'Experience with Ahrefs, SEMrush, and Technical SEO.', location: 'Remote', salaryMin: 65000, salaryMax: 95000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Marketing', title: 'PR Coordinator Intern', description: 'Assist in writing press releases and outreach.', requirements: 'Degree in Communications, very organized.', location: 'New York', salaryMin: 1800, salaryMax: 2600, jobType: 'internship', workMode: 'onsite', employerId: employer.id },
      { category: 'Marketing', title: 'Digital Ad Specialist', description: 'Manage Facebook and Google Ad budgets to drive growth.', requirements: 'Experience with high-spend campaigns.', location: 'Austin, TX', salaryMin: 70000, salaryMax: 110000, jobType: 'full-time', workMode: 'hybrid', employerId: employer.id },
      { category: 'Marketing', title: 'Email Marketing Intern', description: 'Help build nurture flows and newsletter templates.', requirements: 'Basic HTML, interest in user psychology.', location: 'Remote', salaryMin: 1200, salaryMax: 2000, jobType: 'internship', workMode: 'remote', employerId: employer.id },
      { category: 'Marketing', title: 'Brand Manager', description: 'Oversee how our brand is perceived across all channels.', requirements: '6+ years in marketing management.', location: 'Singapore', salaryMin: 110000, salaryMax: 160000, jobType: 'full-time', workMode: 'onsite', employerId: employer.id },
      { category: 'Marketing', title: 'Market Research Intern', description: 'Analyze competitor data and identify new trends.', requirements: 'Proficient in survey tools and data analysis.', location: 'Remote', salaryMin: 2000, salaryMax: 3200, jobType: 'internship', workMode: 'remote', employerId: employer.id },
      { category: 'Marketing', title: 'Affiliate Coordinator', description: 'Recruit and manage partners to promote our platform.', requirements: 'Networking skills, negotiation experience.', location: 'Remote', salaryMin: 50000, salaryMax: 75000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Marketing', title: 'Event Planning Intern', description: 'Help organize our yearly tech conference.', requirements: 'Outgoing personality, highly organized.', location: 'Las Vegas', salaryMin: 2500, salaryMax: 3500, jobType: 'internship', workMode: 'onsite', employerId: employer.id },

      // --- ENGINEERING (10) ---
      { category: 'Engineering', title: 'Civil Engineer', description: 'Manage infrastructure projects from planning to execution.', requirements: 'Professional license, 5+ years in civil engineering.', location: 'Dubai', salaryMin: 80000, salaryMax: 130000, jobType: 'full-time', workMode: 'onsite', employerId: employer.id },
      { category: 'Engineering', title: 'Mechanical Intern', description: 'Support the design and testing of hardware components.', requirements: 'Engineering student, knowledge of CAD.', location: 'Houston, TX', salaryMin: 2500, salaryMax: 3800, jobType: 'internship', workMode: 'onsite', employerId: employer.id },
      { category: 'Engineering', title: 'Electrical Engineer', description: 'Design electrical systems for our new office complexes.', requirements: 'BS in Electrical Engineering, Revit experience.', location: 'Sydney', salaryMin: 75000, salaryMax: 115000, jobType: 'full-time', workMode: 'hybrid', employerId: employer.id },
      { category: 'Engineering', title: 'Structural Intern', description: 'Assist in analyzing the stress load of skyscrapers.', requirements: 'Strong physics and math background.', location: 'Chicago', salaryMin: 2200, salaryMax: 3500, jobType: 'internship', workMode: 'onsite', employerId: employer.id },
      { category: 'Engineering', title: 'Aerospace Engineer', description: 'Work on cutting-edge propulsion systems for satellites.', requirements: 'MS in Aerospace, experience with simulation software.', location: 'Palo Alto', salaryMin: 120000, salaryMax: 190000, jobType: 'full-time', workMode: 'onsite', employerId: employer.id },
      { category: 'Engineering', title: 'Robotics Research Intern', description: 'Help train robotic arms for warehouse automation.', requirements: 'Python and C++, interest in AI.', location: 'Boston', salaryMin: 3000, salaryMax: 5000, jobType: 'internship', workMode: 'hybrid', employerId: employer.id },
      { category: 'Engineering', title: 'Environmental Engineer', description: 'Implement waste-reduction strategies for our factories.', requirements: 'Knowledge of EPA regulations, field work experience.', location: 'Remote', salaryMin: 65000, salaryMax: 95000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Engineering', title: 'Biomedical Engineering Intern', description: 'Help test the latest heart monitoring wearable devices.', requirements: 'Bio-engineering student, lab experience.', location: 'San Diego', salaryMin: 2800, salaryMax: 4200, jobType: 'internship', workMode: 'onsite', employerId: employer.id },
      { category: 'Engineering', title: 'Software Hardware Integrator', description: 'Ensure our firmware talks perfectly to our custom chips.', requirements: 'Embedded C, low-level debugging.', location: 'Austin, TX', salaryMin: 100000, salaryMax: 145000, jobType: 'full-time', workMode: 'onsite', employerId: employer.id },
      { category: 'Engineering', title: 'Solar Project Intern', description: 'Assist in planning large scale solar farms.', requirements: 'Renewable energy major, map-reading skills.', location: 'Remote', salaryMin: 1800, salaryMax: 2600, jobType: 'internship', workMode: 'remote', employerId: employer.id }
    ];

    console.log('Seeding 50+ professional jobs...');
    await Job.bulkCreate(jobList);

    console.log('🚀 50+ new jobs and internships added! 10 per category.');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
