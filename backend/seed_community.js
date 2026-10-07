require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');

const sampleCommunityUsers = [
  {
    name: 'Aarav Patel',
    email: 'aarav.patel@careerpilot.seed',
    password: 'Password@123',
    profile: {
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      college: 'Sri Shakthi Institute of Engineering and Technology',
      degree: 'B.Tech',
      branch: 'Computer Science and Engineering',
      graduationYear: 2024,
      location: 'Bengaluru, India',
      bio: 'Software Engineer @ Stripe. Passionate about distributed systems, low-latency architectures, and mentoring new grads.',
      skills: ['Java', 'Spring Boot', 'Kafka', 'AWS', 'Microservices', 'PostgreSQL'],
      targetRole: 'Software Development Engineer',
      careerInterests: ['Distributed Systems', 'Cloud Architecture', 'Backend Engineering'],
      careerStatus: 'Working',
      achievementSummary: 'Cleared 4 interview rounds at Stripe; Top 5% on LeetCode.',
      placementStatus: 'Stripe',
      profileVisibility: 'Public',
      github: 'https://github.com/aarav-patel',
      linkedin: 'https://linkedin.com/in/aarav-patel',
      projects: [
        {
          title: 'Distributed Event Bus',
          description: 'High-throughput event bus handling 50k msgs/sec with Kafka and Go.',
          technologies: ['Go', 'Kafka', 'Docker'],
          githubUrl: 'https://github.com/aarav-patel/event-bus'
        }
      ]
    }
  },
  {
    name: 'Priya Sundaram',
    email: 'priya.sundaram@careerpilot.seed',
    password: 'Password@123',
    profile: {
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      college: 'PSG College of Technology',
      degree: 'B.E.',
      branch: 'Information Technology',
      graduationYear: 2025,
      location: 'Chennai, India',
      bio: 'Frontend Specialist & Open Source Contributor. Building scalable React + Tailwind design systems.',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Redux Toolkit', 'GraphQL'],
      targetRole: 'Frontend Engineer',
      careerInterests: ['UI/UX Systems', 'Web Performance', 'React Core'],
      careerStatus: 'Looking for Full-Time',
      achievementSummary: 'Finalist in Smart India Hackathon 2024; Created UI library with 2k GitHub stars.',
      placementStatus: 'Microsoft (Incoming)',
      profileVisibility: 'Public',
      github: 'https://github.com/priya-sundaram',
      linkedin: 'https://linkedin.com/in/priya-sundaram',
      projects: [
        {
          title: 'Fluid Design System',
          description: 'Accessible component library with dark mode and zero-runtime CSS.',
          technologies: ['React', 'TypeScript', 'Tailwind CSS'],
          githubUrl: 'https://github.com/priya-sundaram/fluid-ui'
        }
      ]
    }
  },
  {
    name: 'Rohan Sharma',
    email: 'rohan.sharma@careerpilot.seed',
    password: 'Password@123',
    profile: {
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      college: 'Coimbatore Institute of Technology',
      degree: 'B.Tech',
      branch: 'Computer Science',
      graduationYear: 2026,
      location: 'Coimbatore, India',
      bio: 'Full Stack MERN Developer actively seeking summer internships. Love solving complex algorithmic problems.',
      skills: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'React', 'Git'],
      targetRole: 'Full Stack Developer',
      careerInterests: ['Web Development', 'DevOps', 'APIs'],
      careerStatus: 'Looking for Internship',
      achievementSummary: '5-star Coder on HackerRank; Built 4 production web applications.',
      placementStatus: 'Open to Opportunities',
      profileVisibility: 'Public',
      github: 'https://github.com/rohan-sharma',
      linkedin: 'https://linkedin.com/in/rohan-sharma'
    }
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@careerpilot.seed',
    password: 'Password@123',
    profile: {
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      college: 'Amrita Vishwa Vidyapeetham',
      degree: 'B.Tech',
      branch: 'Artificial Intelligence and Data Science',
      graduationYear: 2024,
      location: 'Bengaluru, India',
      bio: 'Data Scientist @ Amazon. Research interests in NLP, LLMs, and predictive telemetry models.',
      skills: ['Python', 'PyTorch', 'TensorFlow', 'NLP', 'SQL', 'Pandas', 'AWS SageMaker'],
      targetRole: 'Data Scientist / ML Engineer',
      careerInterests: ['Machine Learning', 'Natural Language Processing', 'Data Analytics'],
      careerStatus: 'Working',
      achievementSummary: 'Published 2 IEEE research papers in NLP; Cleared Amazon ML Specialist track.',
      placementStatus: 'Amazon',
      profileVisibility: 'Public',
      github: 'https://github.com/sneha-reddy',
      linkedin: 'https://linkedin.com/in/sneha-reddy'
    }
  },
  {
    name: 'Karthik Raja',
    email: 'karthik.raja@careerpilot.seed',
    password: 'Password@123',
    profile: {
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      college: 'Kumaraguru College of Technology',
      degree: 'B.E.',
      branch: 'ECE',
      graduationYear: 2025,
      location: 'Hyderabad, India',
      bio: 'Cloud & DevOps Enthusiast. Passionate about Kubernetes orchestration, CI/CD pipelines, and Terraform.',
      skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Linux', 'Python', 'Go'],
      targetRole: 'DevOps / Cloud Engineer',
      careerInterests: ['Cloud Infrastructure', 'Site Reliability', 'Automation'],
      careerStatus: 'Looking for Full-Time',
      achievementSummary: 'AWS Certified Solutions Architect Associate; Built automated GitOps deployment pipeline.',
      placementStatus: 'Google (Internship Cleared)',
      profileVisibility: 'Public',
      github: 'https://github.com/karthik-raja',
      linkedin: 'https://linkedin.com/in/karthik-raja'
    }
  },
  {
    name: 'Ananya Iyer',
    email: 'ananya.iyer@careerpilot.seed',
    password: 'Password@123',
    profile: {
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      college: 'Sri Shakthi Institute of Engineering and Technology',
      degree: 'B.Tech',
      branch: 'Computer Science and Engineering',
      graduationYear: 2024,
      location: 'Coimbatore, India',
      bio: 'Product Manager & UX Strategist. Helping tech teams build intuitive student and career platforms.',
      skills: ['Product Management', 'Figma', 'User Research', 'Agile', 'Jira', 'SQL'],
      targetRole: 'Associate Product Manager',
      careerInterests: ['Product Strategy', 'Growth Product Management', 'UX Design'],
      careerStatus: 'Working',
      achievementSummary: 'Led student-run incubator startup to 10k monthly active users.',
      placementStatus: 'Swiggy',
      profileVisibility: 'Public',
      github: '',
      linkedin: 'https://linkedin.com/in/ananya-iyer'
    }
  }
];

async function seedCommunity() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/careerpilot';
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    for (const item of sampleCommunityUsers) {
      let user = await User.findOne({ email: item.email });
      if (!user) {
        user = await User.create({
          name: item.name,
          email: item.email,
          password: item.password,
          role: 'student'
        });
        console.log(`Created user: ${user.name} (${user._id})`);
      }

      let profile = await Profile.findOne({ user: user._id });
      if (!profile) {
        profile = await Profile.create({
          user: user._id,
          ...item.profile
        });
        console.log(`Created profile for: ${user.name}`);
      } else {
        Object.assign(profile, item.profile);
        await profile.save();
        console.log(`Updated profile for: ${user.name}`);
      }
    }

    const publicProfilesCount = await Profile.countDocuments({ profileVisibility: 'Public' });
    console.log(`Total public profiles in database: ${publicProfilesCount}`);

    await mongoose.disconnect();
    console.log('Seed completed and database connection closed.');
  } catch (err) {
    console.error('Community seeding error:', err);
    process.exit(1);
  }
}

seedCommunity();
