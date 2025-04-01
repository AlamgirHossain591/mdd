import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { compare, hash, hashSync } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';

// ইউজার ডেটা ফাইল পাথ
const usersFilePath = path.join(process.cwd(), 'app', 'api', 'auth', 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123456789';

// ইউজার টাইপ
type UserRole = 'admin' | 'superadmin';

type User = {
  id: string;
  email: string;
  password: string;
  name?: string;
  role: UserRole;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
};

// ইউজার ডেটা লোড করার ফাংশন
const loadUsers = (): User[] => {
  try {
    // চেক করা যে ফাইল আছে কিনা
    if (!fs.existsSync(usersFilePath)) {
      // ফাইল না থাকলে ডিফল্ট সুপার এডমিন তৈরি করা
      const superAdminPassword = 'ch.th.m.d.b@gmail.com';
      const hashedPassword = hashSync(superAdminPassword, 10);
      
      const defaultUsers: User[] = [{
        id: '1',
        email: 'ch.th.m.d.b@gmail.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'superadmin' as UserRole,
        approved: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }];
      
      fs.writeFileSync(usersFilePath, JSON.stringify(defaultUsers, null, 2));
      return defaultUsers;
    }
    
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('ইউজার ডেটা লোড করতে সমস্যা:', error);
    return [];
  }
};

// ইউজার সেভ করার ফাংশন
const saveUsers = (users: User[]) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('ইউজার ডেটা সেভ করতে সমস্যা:', error);
    return false;
  }
};

// লগইন ফাংশন
const loginUser = async (email: string, password: string) => {
  const users = loadUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return { success: false, message: 'ইউজার খুঁজে পাওয়া যায়নি' };
  }
  
  if (!user.approved) {
    return { success: false, message: 'আপনার একাউন্ট এখনো অনুমোদিত হয়নি' };
  }
  
  const isPasswordValid = await compare(password, user.password);
  
  if (!isPasswordValid) {
    return { success: false, message: 'পাসওয়ার্ড ভুল' };
  }
  
  // JWT টোকেন তৈরি করা
  const token = sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return {
    success: true,
    message: 'লগইন সফল',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    token
  };
};

// রেজিস্ট্রেশন ফাংশন
const registerUser = async (email: string, password: string, name: string) => {
  const users = loadUsers();
  
  // চেক করা যে ইমেইল ইতিমধ্যে ব্যবহৃত কিনা
  if (users.some(user => user.email === email)) {
    return { success: false, message: 'এই ইমেইল ঠিকানা ইতিমধ্যে নিবন্ধিত আছে' };
  }
  
  const hashedPassword = await hash(password, 10);
  
  const newUser: User = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    name,
    role: 'admin',
    approved: false, // নতুন ইউজার অনুমোদিত নয়
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  const isSaved = saveUsers(users);
  
  if (!isSaved) {
    return { success: false, message: 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে' };
  }
  
  return {
    success: true,
    message: 'রেজিস্ট্রেশন সফল। সুপার এডমিনের অনুমোদনের জন্য অপেক্ষা করুন।',
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      approved: newUser.approved
    }
  };
};

// টোকেন ভেরিফাই ফাংশন
const verifyToken = (token: string) => {
  try {
    return verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// অনুমোদিত ইউজার আপডেট ফাংশন
const approveUser = (adminToken: string, userId: string) => {
  const decodedToken = verifyToken(adminToken);
  
  if (!decodedToken || (decodedToken as any).role !== 'superadmin') {
    return { success: false, message: 'এই অপারেশন করার অনুমতি নেই' };
  }
  
  const users = loadUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: 'ইউজার খুঁজে পাওয়া যায়নি' };
  }
  
  users[userIndex].approved = true;
  users[userIndex].updatedAt = new Date().toISOString();
  
  const isSaved = saveUsers(users);
  
  if (!isSaved) {
    return { success: false, message: 'ইউজার অনুমোদন করতে সমস্যা হয়েছে' };
  }
  
  return {
    success: true,
    message: 'ইউজার সফলভাবে অনুমোদিত হয়েছে',
    user: {
      id: users[userIndex].id,
      email: users[userIndex].email,
      name: users[userIndex].name,
      role: users[userIndex].role,
      approved: users[userIndex].approved
    }
  };
};

// পেন্ডিং ইউজার লিস্ট ফাংশন
const getPendingUsers = (adminToken: string) => {
  const decodedToken = verifyToken(adminToken);
  
  if (!decodedToken || (decodedToken as any).role !== 'superadmin') {
    return { success: false, message: 'এই অপারেশন করার অনুমতি নেই' };
  }
  
  const users = loadUsers();
  const pendingUsers = users
    .filter(user => !user.approved && user.role === 'admin')
    .map(({ password, ...user }) => user); // পাসওয়ার্ড বাদ দেওয়া
  
  return {
    success: true,
    pendingUsers
  };
};

// POST - লগইন/রেজিস্ট্রেশন/এপ্রুভ রিকোয়েস্ট
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...data } = body;
    
    switch (action) {
      case 'login':
        const loginResult = await loginUser(data.email, data.password);
        return NextResponse.json(loginResult);
        
      case 'register':
        const registerResult = await registerUser(data.email, data.password, data.name);
        return NextResponse.json(registerResult);
        
      case 'approve':
        const approveResult = approveUser(data.token, data.userId);
        return NextResponse.json(approveResult);
        
      case 'getPendingUsers':
        const pendingUsersResult = getPendingUsers(data.token);
        return NextResponse.json(pendingUsersResult);
        
      case 'verify':
        const token = data.token;
        const user = verifyToken(token);
        
        if (!user) {
          return NextResponse.json({ 
            success: false, 
            message: 'টোকেন ভ্যালিড নয়' 
          });
        }
        
        return NextResponse.json({ 
          success: true, 
          user 
        });
        
      default:
        return NextResponse.json({ 
          success: false, 
          message: 'অজানা অ্যাকশন' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('API কল করতে সমস্যা:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'সার্ভার এরর' 
    }, { status: 500 });
  }
} 