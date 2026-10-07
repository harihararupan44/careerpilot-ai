const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Job = require('../models/Job');

const sampleJobs = [
  {
    title: 'Java Developer - Cloud Backend',
    company: 'Infosys Technologies',
    companyLogo: 'https://images.unsplash.com/photo-1523474253246-72cb9dcdd8b6?w=100&auto=format&fit=crop&q=80',
    description: 'Design, develop, and maintain robust enterprise Java backend services using Spring Boot and Hibernate with cloud-native PostgreSQL data layers.',
    location: 'Chennai',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experience: '0-2 years',
    skills: ['Java', 'Spring Boot', 'Hibernate', 'MySQL', 'REST APIs', 'Git', 'Docker'],
    salaryMin: 450000,
    salaryMax: 750000,
    salaryCurrency: 'INR',
    applicationUrl: 'https://careers.infosys.example.com/apply/java-dev',
    postedDate: new Date('2026-08-25'),
    deadline: new Date('2026-12-31'),
    source: 'CareerPilot Verified',
    isActive: true
  },
  {
    title: 'Software Development Engineer I (SDE I)',
    company: 'Amazon',
    companyLogo: 'https://images.unsplash.com/photo-1523474253246-72cb9dcdd8b6?w=100&auto=format&fit=crop&q=80',
    description: 'As an SDE I, you will work on customer-facing architectures, build scalable backends, and innovate with AWS cloud native technologies.',
    location: 'Bangalore',
    workMode: 'On-site',
    employmentType: 'Full-time',
    experience: '0-2 years',
    skills: ['Java', 'Python', 'AWS', 'DSA', 'SQL', 'Git', 'Distributed Systems'],
    salaryMin: 1400000,
    salaryMax: 1800000,
    salaryCurrency: 'INR',
    applicationUrl: 'https://amazon.jobs/example/sde-1',
    postedDate: new Date('2026-08-24'),
    deadline: new Date('2026-12-31'),
    source: 'CareerPilot Direct',
    isActive: true
  },
  {
    title: 'Full Stack Software Engineer',
    company: 'Stripe',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    description: 'Design and build economic infrastructure, payment gateway APIs, and high-performance React dashboard applications.',
    location: 'Bangalore',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experience: '1-3 years',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'REST APIs', 'Docker'],
    salaryMin: 1600000,
    salaryMax: 2200000,
    salaryCurrency: 'INR',
    applicationUrl: 'https://stripe.com/jobs/example/fullstack',
    postedDate: new Date('2026-08-23'),
    deadline: new Date('2026-12-15'),
    source: 'CareerPilot Direct',
    isActive: true
  },
  {
    title: 'Frontend Engineer - Web Core',
    company: 'Airbnb',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80',
    description: 'Join Airbnb Guest Experience creating world-class booking interfaces, performant design systems, and delightful travel discovery tools.',
    location: 'Remote',
    workMode: 'Remote',
    employmentType: 'Full-time',
    experience: '0-2 years',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Web Performance', 'JavaScript'],
    salaryMin: 1200000,
    salaryMax: 1600000,
    salaryCurrency: 'INR',
    applicationUrl: 'https://airbnb.com/careers/example/frontend',
    postedDate: new Date('2026-08-20'),
    deadline: new Date('2026-11-30'),
    source: 'CareerPilot',
    isActive: true
  },
  {
    title: 'Backend Distributed Systems Engineer',
    company: 'Uber',
    companyLogo: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=100&auto=format&fit=crop&q=80',
    description: 'Design low-latency matching and dispatch algorithms in Go and Python, scaling real-time rider and driver coordination worldwide.',
    location: 'Hyderabad',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experience: '1-3 years',
    skills: ['Go', 'Python', 'Node.js', 'PostgreSQL', 'Redis', 'Distributed Systems', 'Docker'],
    salaryMin: 1500000,
    salaryMax: 2000000,
    salaryCurrency: 'INR',
    applicationUrl: 'https://uber.com/jobs/example/backend',
    postedDate: new Date('2026-08-18'),
    deadline: new Date('2026-12-20'),
    source: 'CareerPilot Direct',
    isActive: true
  },
  {
    title: 'Software Engineering Intern - Summer 2026',
    company: 'Microsoft',
    companyLogo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&auto=format&fit=crop&q=80',
    description: 'Work alongside industry mentors on Microsoft Azure cloud services, developer tools, and cutting-edge software engineering initiatives.',
    location: 'Coimbatore',
    workMode: 'Hybrid',
    employmentType: 'Internship',
    experience: 'Student / Fresher',
    skills: ['C#', 'Java', 'Python', 'DSA', 'SQL', 'Git'],
    salaryMin: 50000,
    salaryMax: 80000,
    salaryCurrency: 'INR',
    applicationUrl: 'https://careers.microsoft.com/example/intern',
    postedDate: new Date('2026-08-15'),
    deadline: new Date('2026-12-01'),
    source: 'Campus Placement',
    isActive: true
  },
  {
    title: 'Cloud DevOps & Platform Engineer',
    company: 'Datadog',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
    description: 'Build automated CI/CD deployment pipelines, manage Kubernetes clusters, and scale cloud infrastructure monitoring across multi-region environments.',
    location: 'Bangalore',
    workMode: 'Remote',
    employmentType: 'Full-time',
    experience: '0-2 years',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'Terraform', 'CI/CD', 'Python'],
    salaryMin: 1100000,
    salaryMax: 1500000,
    salaryCurrency: 'INR',
    applicationUrl: 'https://datadog.com/careers/example/devops',
    postedDate: new Date('2026-08-12'),
    deadline: new Date('2026-12-10'),
    source: 'CareerPilot',
    isActive: true
  },
  {
    title: 'Junior Java & Spring Boot Engineer',
    company: 'Zoho Corporation',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
    description: 'Develop business productivity applications, CRM workflow modules, and scalable REST endpoints using Java, MySQL, and Redis.',
    location: 'Coimbatore',
    workMode: 'On-site',
    employmentType: 'Full-time',
    experience: '0-1 years',
    skills: ['Java', 'Spring Boot', 'MySQL', 'DSA', 'OOP', 'JavaScript'],
    salaryMin: 400000,
    salaryMax: 650000,
    salaryCurrency: 'INR',
    applicationUrl: 'https://zoho.com/careers/example/junior-java',
    postedDate: new Date('2026-08-10'),
    deadline: new Date('2026-11-28'),
    source: 'CareerPilot Verified',
    isActive: true
  }
];

async function seedJobs() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not set in environment variables');
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✔ Connected to MongoDB Atlas');

    // Count existing jobs
    const existingCount = await Job.countDocuments();
    console.log(`Current jobs count in database: ${existingCount}`);

    // Insert sample jobs (upsert based on title and company)
    let addedCount = 0;
    for (const jobData of sampleJobs) {
      const existing = await Job.findOne({
        title: jobData.title,
        company: jobData.company
      });

      if (!existing) {
        await Job.create(jobData);
        addedCount++;
        console.log(`✔ Seeded: ${jobData.title} @ ${jobData.company}`);
      } else {
        console.log(`- Already exists: ${jobData.title} @ ${jobData.company}`);
      }
    }

    console.log(`\n🎉 Seeding complete! Added ${addedCount} new job(s).`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedJobs();
