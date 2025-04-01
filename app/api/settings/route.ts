import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// সেটিংস ডেটা ফাইল পাথ
const settingsFilePath = path.join(process.cwd(), 'app', 'api', 'settings', 'settings.json');

// সেটিংস ডেটা লোড করার ফাংশন
const loadSettings = () => {
  try {
    // চেক করা যে ফাইল আছে কিনা
    if (!fs.existsSync(settingsFilePath)) {
      // ফাইল না থাকলে ডিফল্ট সেটিংস অবজেক্ট সেভ করা
      const defaultSettings = {
        facebookPixel: {
          enabled: false,
          pixelId: '',
          events: []
        }
      };
      fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    }
    
    const data = fs.readFileSync(settingsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('সেটিংস ডেটা লোড করতে সমস্যা:', error);
    return {
      facebookPixel: {
        enabled: false,
        pixelId: '',
        events: []
      }
    };
  }
};

// সেটিংস সেভ করার ফাংশন
const saveSettings = (settings: any) => {
  try {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('সেটিংস সেভ করতে সমস্যা:', error);
    return false;
  }
};

// GET - সেটিংস পাওয়া
export async function GET() {
  try {
    const settings = loadSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('সেটিংস পাওয়া যায়নি:', error);
    return NextResponse.json(
      { error: 'সেটিংস পাওয়া যায়নি' },
      { status: 500 }
    );
  }
}

// POST - সেটিংস আপডেট করা
export async function POST(request: Request) {
  try {
    const settings = await request.json();
    
    if (!settings) {
      return NextResponse.json(
        { error: 'সেটিংস ডেটা প্রদান করা আবশ্যক' },
        { status: 400 }
      );
    }
    
    const isSaved = saveSettings(settings);
    
    if (!isSaved) {
      return NextResponse.json(
        { error: 'সেটিংস সেভ করতে সমস্যা হয়েছে' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'সেটিংস সফলভাবে আপডেট করা হয়েছে',
      settings
    });
  } catch (error) {
    console.error('সেটিংস আপডেট করতে সমস্যা:', error);
    return NextResponse.json(
      { error: 'সেটিংস আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
} 