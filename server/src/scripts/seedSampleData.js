import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User, { createAccount } from '../models/User.js';

const facultyMembers = [
  { name: 'Alan Turing', email: 'alan.turing@university.edu', department: 'Computer Science', password: 'Password123!' },
  { name: 'Barbara Liskov', email: 'barbara.liskov@university.edu', department: 'Information Technology', password: 'Password123!' },
  { name: 'Claude Shannon', email: 'claude.shannon@university.edu', department: 'Electrical Engineering', password: 'Password123!' },
  { name: 'Dorothy Vaughan', email: 'dorothy.vaughan@university.edu', department: 'Mathematics', password: 'Password123!' },
  { name: 'Enrico Fermi', email: 'enrico.fermi@university.edu', department: 'Physics', password: 'Password123!' }
];

const students = [
  { name: 'Aaron Cooper', email: 'aaron.cooper@example.com', rollNumber: '24CS001', department: 'Computer Science', password: 'Password123!' },
  { name: 'Bella Davis', email: 'bella.davis@example.com', rollNumber: '24CS002', department: 'Computer Science', password: 'Password123!' },
  { name: 'Caleb Foster', email: 'caleb.foster@example.com', rollNumber: '24CS003', department: 'Computer Science', password: 'Password123!' },
  { name: 'Diana Gomez', email: 'diana.gomez@example.com', rollNumber: '24CS004', department: 'Computer Science', password: 'Password123!' },
  { name: 'Ethan Harris', email: 'ethan.harris@example.com', rollNumber: '24CS005', department: 'Computer Science', password: 'Password123!' },
  { name: 'Fiona Jenkins', email: 'fiona.jenkins@example.com', rollNumber: '24IT001', department: 'Information Technology', password: 'Password123!' },
  { name: 'George Kelly', email: 'george.kelly@example.com', rollNumber: '24IT002', department: 'Information Technology', password: 'Password123!' },
  { name: 'Hannah Lewis', email: 'hannah.lewis@example.com', rollNumber: '24IT003', department: 'Information Technology', password: 'Password123!' },
  { name: 'Ian Martinez', email: 'ian.martinez@example.com', rollNumber: '24IT004', department: 'Information Technology', password: 'Password123!' },
  { name: 'Julia Nelson', email: 'julia.nelson@example.com', rollNumber: '24IT005', department: 'Information Technology', password: 'Password123!' },
  { name: 'Kevin Owens', email: 'kevin.owens@example.com', rollNumber: '24EE001', department: 'Electrical Engineering', password: 'Password123!' },
  { name: 'Laura Parker', email: 'laura.parker@example.com', rollNumber: '24EE002', department: 'Electrical Engineering', password: 'Password123!' },
  { name: 'Marcus Quinn', email: 'marcus.quinn@example.com', rollNumber: '24EE003', department: 'Electrical Engineering', password: 'Password123!' },
  { name: 'Nadia Ramirez', email: 'nadia.ramirez@example.com', rollNumber: '24EE004', department: 'Electrical Engineering', password: 'Password123!' },
  { name: 'Oliver Scott', email: 'oliver.scott@example.com', rollNumber: '24EE005', department: 'Electrical Engineering', password: 'Password123!' },
  { name: 'Paula Turner', email: 'paula.turner@example.com', rollNumber: '24ME001', department: 'Mechanical Engineering', password: 'Password123!' },
  { name: 'Quincy Underwood', email: 'quincy.underwood@example.com', rollNumber: '24ME002', department: 'Mechanical Engineering', password: 'Password123!' },
  { name: 'Rachel Vance', email: 'rachel.vance@example.com', rollNumber: '24ME003', department: 'Mechanical Engineering', password: 'Password123!' },
  { name: 'Samuel Wright', email: 'samuel.wright@example.com', rollNumber: '24ME004', department: 'Mechanical Engineering', password: 'Password123!' },
  { name: 'Tara Young', email: 'tara.young@example.com', rollNumber: '24ME005', department: 'Mechanical Engineering', password: 'Password123!' }
];

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB. Seeding sample accounts...');

    let facultyCreated = 0;
    for (const f of facultyMembers) {
      const existing = await User.findOne({ email: f.email.toLowerCase() });
      if (!existing) {
        await createAccount(f, 'faculty');
        facultyCreated++;
        console.log(`Created Faculty: ${f.name} (${f.email})`);
      } else {
        console.log(`Faculty already exists: ${f.name}`);
      }
    }

    let studentsCreated = 0;
    for (const s of students) {
      const existing = await User.findOne({ email: s.email.toLowerCase() });
      if (!existing) {
        await createAccount(s, 'student');
        studentsCreated++;
        console.log(`Created Student: ${s.name} [${s.rollNumber}] (${s.email})`);
      } else {
        console.log(`Student already exists: ${s.name}`);
      }
    }

    console.log(`\nSuccessfully finished seeding!`);
    console.log(`Faculty created: ${facultyCreated}/${facultyMembers.length}`);
    console.log(`Students created: ${studentsCreated}/${students.length}`);
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
