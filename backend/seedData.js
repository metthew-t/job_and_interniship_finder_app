const { Job, Employer, User, sequelize, Profile, Application } = require('./models');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database.');

    // 1. Force fix all tables using safe SQL
    const tables = ['users', 'profiles', 'employers', 'jobs', 'applications'];
    for (const table of tables) {
      try {
        await sequelize.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`);
        await sequelize.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`);
      } catch (e) {}
    }

    // 2. Fix specific columns that cause ENUM issues by converting them to TEXT/VARCHAR if needed
    try {
        await sequelize.query('ALTER TABLE "users" ALTER COLUMN "role" TYPE VARCHAR(255);');
        await sequelize.query('ALTER TABLE "jobs" ALTER COLUMN "job_type" TYPE VARCHAR(255);');
        await sequelize.query('ALTER TABLE "jobs" ALTER COLUMN "work_mode" TYPE VARCHAR(255);');
        await sequelize.query('ALTER TABLE "applications" ALTER COLUMN "status" TYPE VARCHAR(255);');
        await sequelize.query('ALTER TABLE "profiles" ALTER COLUMN "work_mode_preference" TYPE VARCHAR(255);');
        console.log('✅ Column types normalized.');
    } catch (e) {}

    // 3. Add custom columns
    try {
      await sequelize.query('ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "profile_completion_percentage" INTEGER DEFAULT 0;');
      await sequelize.query('ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "category" VARCHAR(255) DEFAULT \'Technology\';');
    } catch (e) {}

    // 4. Reset and Seed Jobs
    console.log('Seeding 25+ professional jobs...');
    await sequelize.query('TRUNCATE TABLE "jobs" CASCADE;');

    let employerUser = await User.findOne({ where: { role: 'employer' } });
    if (!employerUser) {
      employerUser = await User.create({
        email: 'recruiter@techworld.com',
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
        companyName: 'TechWorld Systems',
        description: 'Global leader in software innovation and AI research.'
      });
    }

    const jobList = [
      // TECHNOLOGY - 20 items
      { category: 'Technology', title: 'Senior Flutter Developer', description: 'Lead our cross-platform mobile strategy.', requirements: '5+ years experience, expert in Dart and State Management.', location: 'Remote', salaryMin: 95000, salaryMax: 140000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Technology', title: 'Junior Flutter Intern', description: 'Learn to build beautiful UIs with Flutter.', requirements: 'Basic Dart knowledge, CS student, passionate about mobile.', location: 'San Francisco', salaryMin: 20, salaryMax: 35, jobType: 'internship', workMode: 'hybrid', employerId: employer.id },
      { category: 'Technology', title: 'Full Stack Web Intern', description: 'Work with Node.js and React on real products.', requirements: 'Knowledge of HTML/CSS/JS, basic SQL.', location: 'Austin, TX', salaryMin: 2500, salaryMax: 4000, jobType: 'internship', workMode: 'onsite', employerId: employer.id },
      { category: 'Technology', title: 'Backend Engineer (Node.js)', description: 'Build scalable APIs for millions of users.', requirements: 'Node.js, Express, PostgreSQL, Redis.', location: 'Remote', salaryMin: 80000, salaryMax: 120000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Technology', title: 'Machine Learning Intern', description: 'Help train our computer vision models.', requirements: 'Python, PyTorch/TensorFlow, Linear Algebra.', location: 'New York', salaryMin: 3000, salaryMax: 5000, jobType: 'internship', workMode: 'hybrid', employerId: employer.id },
      { category: 'Technology', title: 'Cybersecurity Analyst', description: 'Protect our infrastructure from threats.', requirements: 'Network security, Pentesting, Ethical Hacking.', location: 'London', salaryMin: 70000, salaryMax: 110000, jobType: 'full-time', workMode: 'onsite', employerId: employer.id },
      { category: 'Technology', title: 'DevOps Engineer', description: 'Manage our AWS and Kubernetes clusters.', requirements: 'Terraform, Docker, CI/CD, Cloud architecture.', location: 'Remote', salaryMin: 100000, salaryMax: 150000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Technology', title: 'Data Scientist', description: 'Turn big data into business insights.', requirements: 'Python, R, Statistics, SQL, Tableau.', location: 'Seattle', salaryMin: 110000, salaryMax: 160000, jobType: 'full-time', workMode: 'hybrid', employerId: employer.id },
      { category: 'Technology', title: 'Android Developer Intern', description: 'Assist in native Android development.', requirements: 'Kotlin, Java, Android SDK basics.', location: 'Chicago', salaryMin: 2000, salaryMax: 3000, jobType: 'internship', workMode: 'onsite', employerId: employer.id },
      { category: 'Technology', title: 'iOS Developer', description: 'Craft premium Swift applications.', requirements: 'Swift, SwiftUI, Combine, App Store deployment.', location: 'Remote', salaryMin: 90000, salaryMax: 130000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Technology', title: 'Blockchain Research Intern', description: 'Research L2 scaling solutions.', requirements: 'Solidity, Rust, cryptography interest.', location: 'Remote', salaryMin: 3500, salaryMax: 5500, jobType: 'internship', workMode: 'remote', employerId: employer.id },
      { category: 'Technology', title: 'QA Automation Engineer', description: 'Maintain our automated testing suite.', requirements: 'Selenium, Cypress, JS, Jest.', location: 'Boston', salaryMin: 75000, salaryMax: 100000, jobType: 'full-time', workMode: 'hybrid', employerId: employer.id },
      { category: 'Technology', title: 'UI Engineer (React)', description: 'Create high-performance web components.', requirements: 'React, TypeScript, Next.js.', location: 'New York', salaryMin: 85000, salaryMax: 125000, jobType: 'full-time', workMode: 'onsite', employerId: employer.id },
      { category: 'Technology', title: 'AI Ethics Intern', description: 'Audit AI models for bias.', requirements: 'Philosophy or CS background, excellent writing.', location: 'Remote', salaryMin: 2500, salaryMax: 4000, jobType: 'internship', workMode: 'remote', employerId: employer.id },
      { category: 'Technology', title: 'Cloud Architect', description: 'Design enterprise cloud solutions.', requirements: 'AWS/Azure certified, 8+ years in infra.', location: 'Remote', salaryMin: 130000, salaryMax: 200000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Technology', title: 'Python Backend Developer', description: 'Power our data processing pipelines.', requirements: 'Python, Django/FastAPI, Celery.', location: 'Austin, TX', salaryMin: 80000, salaryMax: 115000, jobType: 'full-time', workMode: 'hybrid', employerId: employer.id },
      { category: 'Technology', title: 'AR/VR Developer Intern', description: 'Build immersive Unity experiences.', requirements: 'Unity, C#, 3D math basics.', location: 'Los Angeles', salaryMin: 2200, salaryMax: 3500, jobType: 'internship', workMode: 'onsite', employerId: employer.id },
      { category: 'Technology', title: 'Data Engineer', description: 'Build and maintain ETL pipelines.', requirements: 'Spark, Airflow, Hadoop, Snowflake.', location: 'Remote', salaryMin: 100000, salaryMax: 145000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },
      { category: 'Technology', title: 'Embedded Systems Intern', description: 'Write low-level code for IoT devices.', requirements: 'C/C++, Microcontrollers, Linux kernel.', location: 'Denver', salaryMin: 2500, salaryMax: 3800, jobType: 'internship', workMode: 'onsite', employerId: employer.id },
      { category: 'Technology', title: 'Technical Writer', description: 'Document our developer APIs.', requirements: 'Clear communication, Markdown, API knowledge.', location: 'Remote', salaryMin: 60000, salaryMax: 90000, jobType: 'full-time', workMode: 'remote', employerId: employer.id },

      // FINANCE
      { category: 'Finance', title: 'Investment Analyst', description: 'Market research and reporting.', requirements: 'Finance degree.', location: 'NY', salaryMin: 110000, salaryMax: 150000, jobType: 'full-time', workMode: 'onsite', employerId: employer.id },
      { category: 'Finance', title: 'Tax Intern', description: 'Assist in tax compliance.', requirements: 'Accounting student.', location: 'Chicago', salaryMin: 1500, salaryMax: 2500, jobType: 'internship', workMode: 'hybrid', employerId: employer.id },

      // DESIGN
      { category: 'Design', title: 'UI/UX Designer', description: 'Design modern web apps.', requirements: 'Figma, Portfolio.', location: 'London', salaryMin: 50000, salaryMax: 80000, jobType: 'full-time', workMode: 'hybrid', employerId: employer.id },
      { category: 'Design', title: 'Graphic Design Intern', description: 'Create social media assets.', requirements: 'Adobe Suite.', location: 'Paris', salaryMin: 1000, salaryMax: 1800, jobType: 'internship', workMode: 'remote', employerId: employer.id },

      // MARKETING
      { category: 'Marketing', title: 'SEO Specialist', description: 'Optimize our organic search.', requirements: '2+ years SEO experience.', location: 'Remote', salaryMin: 45000, salaryMax: 70000, jobType: 'full-time', workMode: 'remote', employerId: employer.id }
    ];

    await Job.bulkCreate(jobList);

    console.log('🚀 25+ new jobs and internships added! Ready for testing.');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
