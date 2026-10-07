const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Company = require('../models/Company');
const Job = require('../models/Job');
const InterviewExperience = require('../models/InterviewExperience');
const Profile = require('../models/Profile');

const seedCompaniesList = [
  {
    name: 'Amazon',
    slug: 'amazon',
    logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=120&auto=format&fit=crop&q=80',
    industry: 'E-Commerce & Cloud Infrastructure',
    companySize: 'Enterprise',
    companyType: 'Public',
    headquarters: 'Seattle, WA (Offices in Bangalore, Hyderabad, Chennai)',
    locations: ['Bangalore', 'Hyderabad', 'Chennai', 'Seattle', 'Gurgaon'],
    website: 'https://amazon.jobs',
    foundedYear: 1994,
    description: 'Global technology leader specializing in e-commerce, cloud computing (AWS), digital streaming, and artificial intelligence.',
    specializations: [
      'Software Development Engineer (SDE-1)',
      'Frontend Engineer',
      'Backend Engineer',
      'Cloud Support Engineer',
      'System Development Engineer'
    ],
    skills: ['Java', 'DSA', 'AWS', 'System Design', 'SQL', 'Spring Boot', 'OOP'],
    isActive: true
  },
  {
    name: 'Google',
    slug: 'google',
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80',
    industry: 'Internet, AI & Cloud Technologies',
    companySize: 'Enterprise',
    companyType: 'Public',
    headquarters: 'Mountain View, CA (Offices in Bangalore, Hyderabad)',
    locations: ['Bangalore', 'Hyderabad', 'Mountain View', 'Gurgaon'],
    website: 'https://careers.google.com',
    foundedYear: 1998,
    description: 'World leader in search, machine learning, cloud infrastructure (GCP), Android OS, and scalable computing platforms.',
    specializations: [
      'Software Engineer (L3/L4)',
      'Site Reliability Engineer',
      'Data Scientist',
      'Machine Learning Engineer',
      'Frontend Engineer'
    ],
    skills: ['C++', 'Python', 'DSA', 'Algorithms', 'Distributed Systems', 'Go', 'GCP'],
    isActive: true
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    logo: 'https://images.unsplash.com/photo-1583321500900-82807e458f3c?w=120&auto=format&fit=crop&q=80',
    industry: 'Cloud & Enterprise Software',
    companySize: 'Enterprise',
    companyType: 'Public',
    headquarters: 'Redmond, WA (Offices in Bangalore, Hyderabad, Noida)',
    locations: ['Bangalore', 'Hyderabad', 'Noida', 'Redmond'],
    website: 'https://careers.microsoft.com',
    foundedYear: 1975,
    description: 'Pioneer in personal computing, cloud computing (Azure), enterprise software, developer tooling, and AI integration.',
    specializations: [
      'Software Engineer',
      'Support Engineer',
      'Data Engineer',
      'Full Stack Developer',
      'Cloud Solution Architect'
    ],
    skills: ['C#', 'Azure', 'DSA', 'TypeScript', 'SQL', 'React', 'Operating Systems'],
    isActive: true
  },
  {
    name: 'TCS',
    slug: 'tcs',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80',
    industry: 'IT Services & Consulting',
    companySize: 'Enterprise',
    companyType: 'Public',
    headquarters: 'Mumbai, India (Global operations across 55 countries)',
    locations: ['Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'],
    website: 'https://www.tcs.com/careers',
    foundedYear: 1968,
    description: 'Tata Consultancy Services is a global leader in IT services, digital and business solutions with massive campus recruitment drives (NQT/Digital/Prime).',
    specializations: [
      'Systems Engineer (Ninja)',
      'Developer (Digital)',
      'Solution Architect (Prime)',
      'QA Automation Engineer',
      'Full Stack Trainee'
    ],
    skills: ['Java', 'Python', 'SQL', 'DBMS', 'C', 'Web Fundamentals', 'Communication'],
    isActive: true
  },
  {
    name: 'Infosys',
    slug: 'infosys',
    logo: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=120&auto=format&fit=crop&q=80',
    industry: 'IT Services & Digital Consulting',
    companySize: 'Enterprise',
    companyType: 'Public',
    headquarters: 'Bangalore, India (Global presence across 50+ countries)',
    locations: ['Bangalore', 'Mysore', 'Pune', 'Hyderabad', 'Chennai'],
    website: 'https://www.infosys.com/careers',
    foundedYear: 1981,
    description: 'Global leader in next-generation digital services and consulting, renowned for its state-of-the-art Mysore training campus and HackWithInfy challenge.',
    specializations: [
      'System Engineer',
      'Specialist Programmer (SES)',
      'Digital Specialist Engineer (DSE)',
      'Cloud Operations Analyst'
    ],
    skills: ['Java', 'Data Structures', 'Python', 'SQL', 'OOP', 'Spring Boot', 'Angular'],
    isActive: true
  },
  {
    name: 'Accenture',
    slug: 'accenture',
    logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=120&auto=format&fit=crop&q=80',
    industry: 'Global Management & Technology Consulting',
    companySize: 'Enterprise',
    companyType: 'Public',
    headquarters: 'Dublin, Ireland (Major delivery centers in Bangalore, Gurgaon, Mumbai)',
    locations: ['Bangalore', 'Gurgaon', 'Mumbai', 'Hyderabad', 'Chennai', 'Pune'],
    website: 'https://www.accenture.com/in-en/careers',
    foundedYear: 1989,
    description: 'Global professional services company providing strategy, consulting, digital, cloud infrastructure, and security solutions.',
    specializations: [
      'Associate Software Engineer (ASE)',
      'Advanced Associate Software Engineer (AASE)',
      'Data Analytics Associate',
      'Cloud DevOps Analyst'
    ],
    skills: ['Java', 'Python', 'Critical Thinking', 'SQL', 'Cloud Basics', 'Agile', 'DSA'],
    isActive: true
  },
  {
    name: 'Zoho',
    slug: 'zoho',
    logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=120&auto=format&fit=crop&q=80',
    industry: 'SaaS & Business Productivity Software',
    companySize: 'Large',
    companyType: 'Private',
    headquarters: 'Chennai, India (Tenkasi, Austin, Singapore & Global)',
    locations: ['Chennai', 'Tenkasi', 'Salem', 'Austin', 'Singapore'],
    website: 'https://www.zoho.com/careers',
    foundedYear: 1996,
    description: 'Bootstrapped SaaS powerhouse building a complete suite of business productivity, CRM, collaboration, and ERP applications used by 100M+ users worldwide.',
    specializations: [
      'Software Developer',
      'UI/UX Designer',
      'Technical Support Engineer',
      'QA Engineer',
      'DevOps Engineer'
    ],
    skills: ['Java', 'C', 'DSA', 'OOP', 'Problem Solving', 'JavaScript', 'Database Design'],
    isActive: true
  },
  {
    name: 'Wipro',
    slug: 'wipro',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80',
    industry: 'IT, Cloud & Digital Services',
    companySize: 'Enterprise',
    companyType: 'Public',
    headquarters: 'Bangalore, India (Offices in 60+ countries)',
    locations: ['Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kochi'],
    website: 'https://careers.wipro.com',
    foundedYear: 1945,
    description: 'Leading global information technology, consulting and business process services company with elite hiring initiatives (Elite NTH & Turbo).',
    specializations: [
      'Project Engineer (Elite)',
      'Turbo Engineer',
      'Cloud Network Specialist',
      'Cybersecurity Analyst'
    ],
    skills: ['Java', 'C++', 'SQL', 'OOP', 'Networking', 'Python', 'Aptitude'],
    isActive: true
  },
  {
    name: 'Uber',
    slug: 'uber',
    logo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    industry: 'Mobility, Logistics & High-Concurrency Systems',
    companySize: 'Enterprise',
    companyType: 'Public',
    headquarters: 'San Francisco, CA (Tech centers in Bangalore, Hyderabad)',
    locations: ['Bangalore', 'Hyderabad', 'San Francisco', 'Amsterdam'],
    website: 'https://www.uber.com/careers',
    foundedYear: 2009,
    description: 'Global mobility platform handling millions of concurrent trips and deliveries with ultra-low-latency real-time dispatch systems.',
    specializations: [
      'Software Engineer I / II',
      'Backend Engineer (Go/Java)',
      'Frontend Engineer (React Native)',
      'Data Infrastructure Engineer'
    ],
    skills: ['Go', 'Java', 'DSA', 'System Design', 'Kafka', 'Redis', 'Microservices'],
    isActive: true
  },
  {
    name: 'Razorpay',
    slug: 'razorpay',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop&q=80',
    industry: 'Fintech & Payment Gateway Infrastructure',
    companySize: 'Large',
    companyType: 'Startup',
    headquarters: 'Bangalore, India',
    locations: ['Bangalore', 'Mumbai', 'Delhi'],
    website: 'https://razorpay.com/jobs',
    foundedYear: 2014,
    description: 'India’s premier payment gateway and neo-banking platform powering digital financial workflows for millions of businesses.',
    specializations: [
      'Software Development Engineer I',
      'Frontend Engineer',
      'Platform Engineer',
      'Security Engineer'
    ],
    skills: ['Golang', 'PHP', 'Node.js', 'React', 'Distributed Systems', 'MySQL', 'DSA'],
    isActive: true
  }
];

async function seedCompanies() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    for (const compData of seedCompaniesList) {
      const company = await Company.findOneAndUpdate(
        { name: new RegExp(`^${compData.name}$`, 'i') },
        { $set: compData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[SEEDED] Company: ${company.name} (ID: ${company._id})`);

      // Link up existing Jobs by company name
      await Job.updateMany(
        { company: new RegExp(`^${compData.name}$`, 'i'), companyRef: null },
        { $set: { companyRef: company._id } }
      );

      // Link up existing Interview Experiences by company name
      await InterviewExperience.updateMany(
        { companyName: new RegExp(`^${compData.name}$`, 'i'), company: null },
        { $set: { company: company._id } }
      );

      // Link up existing Profiles by placementStatus
      await Profile.updateMany(
        { placementStatus: new RegExp(`^${compData.name}$`, 'i'), currentCompany: null },
        { $set: { currentCompany: company._id } }
      );
    }

    console.log('\n✅ Companies successfully seeded and relational links established!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding companies:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedCompanies();
}

module.exports = { seedCompanies, seedCompaniesList };
