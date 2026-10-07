const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Profile = require('../models/Profile');

const mentorsData = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@careerpilot.dev',
    password: 'password123',
    college: 'IIT Madras',
    location: 'Bangalore, India',
    targetRole: 'Senior Backend Engineer',
    placementStatus: 'Google',
    skills: ['Java', 'Spring Boot', 'System Design', 'Microservices', 'Distributed Systems', 'Kafka'],
    careerStatus: 'Working',
    openToGuidance: true,
    guidanceTopics: ['Java', 'DSA', 'System Design', 'Placement Preparation', 'Resume Review'],
    guidanceBio: 'Backend engineer at Google. Happy to help pre-final and final year students with Java backend roadmaps, DSA pattern practice, and system design interviews.',
    guidanceExperience: 'Placed at Google via referral off-campus. 4+ years mentoring college grads.',
    preferredGuidanceMode: 'Online',
    bio: 'Senior Backend Engineer passionate about distributed systems and cloud architecture.'
  },
  {
    name: 'Karthik Raja',
    email: 'karthik.raja@careerpilot.dev',
    password: 'password123',
    college: 'Anna University (CEG)',
    location: 'Chennai, India',
    targetRole: 'Software Development Engineer',
    placementStatus: 'Amazon',
    skills: ['C++', 'DSA', 'Python', 'AWS', 'SQL', 'DynamoDB'],
    careerStatus: 'Working',
    openToGuidance: true,
    guidanceTopics: ['DSA', 'Placement Preparation', 'Interview Preparation', 'C++'],
    guidanceBio: 'SDE at Amazon AWS. I can guide you on LeetCode patterns, Amazon Leadership Principles (STAR format), and campus placement coding rounds.',
    guidanceExperience: 'Cracked Amazon SDE-1 on-campus. Guided 20+ juniors into Tier-1 product companies.',
    preferredGuidanceMode: 'Online',
    bio: 'Software engineer building scalable cloud services on AWS.'
  },
  {
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@careerpilot.dev',
    password: 'password123',
    college: 'BITS Pilani',
    location: 'Hyderabad, India',
    targetRole: 'Full Stack Engineer',
    placementStatus: 'Microsoft',
    skills: ['React', 'Node.js', 'TypeScript', 'Next.js', 'GraphQL', 'MongoDB'],
    careerStatus: 'Working',
    openToGuidance: true,
    guidanceTopics: ['Web Development', 'Full Stack Development', 'Projects', 'Resume Preparation'],
    guidanceBio: 'Full stack engineer at Microsoft. Let me help you build standout fullstack projects for your portfolio and review your resume for top tech recruiters.',
    guidanceExperience: 'Placed at Microsoft through summer internship PPO.',
    preferredGuidanceMode: 'Both',
    bio: 'Building developer tools and modern web experiences at Microsoft.'
  },
  {
    name: 'Vikram Sundaram',
    email: 'vikram.sundaram@careerpilot.dev',
    password: 'password123',
    college: 'NIT Trichy',
    location: 'Bangalore, India',
    targetRole: 'Cloud & DevOps Engineer',
    placementStatus: 'Stripe',
    skills: ['Kubernetes', 'Docker', 'Go', 'Terraform', 'CI/CD', 'AWS'],
    careerStatus: 'Working',
    openToGuidance: true,
    guidanceTopics: ['Cloud', 'DevOps', 'AWS', 'Internship Preparation', 'Career Planning'],
    guidanceBio: 'Infrastructure engineer at Stripe. Ready to guide anyone interested in Cloud native engineering, DevOps toolchains, and high-scale reliability.',
    guidanceExperience: '3 years in infrastructure engineering at Stripe & high-growth fintech startups.',
    preferredGuidanceMode: 'Online',
    bio: 'Cloud infrastructure architect focused on global payment reliability.'
  }
];

async function seedMentors() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas...');

    for (const data of mentorsData) {
      let user = await User.findOne({ email: data.email });
      if (!user) {
        user = await User.create({
          name: data.name,
          email: data.email,
          password: data.password,
          role: 'student'
        });
        console.log(`Created user: ${user.name}`);
      }

      await Profile.findOneAndUpdate(
        { user: user._id },
        {
          $set: {
            college: data.college,
            location: data.location,
            targetRole: data.targetRole,
            placementStatus: data.placementStatus,
            skills: data.skills,
            careerStatus: data.careerStatus,
            openToGuidance: data.openToGuidance,
            guidanceTopics: data.guidanceTopics,
            guidanceBio: data.guidanceBio,
            guidanceExperience: data.guidanceExperience,
            preferredGuidanceMode: data.preferredGuidanceMode,
            bio: data.bio,
            profileVisibility: 'Public'
          }
        },
        { upsert: true, new: true }
      );
      console.log(`Updated Guidance Profile for: ${data.name}`);
    }

    console.log('✅ Guidance Mentors Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding mentors:', error);
    process.exit(1);
  }
}

seedMentors();
