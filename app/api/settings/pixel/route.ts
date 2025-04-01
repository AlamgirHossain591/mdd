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

// GET - পিক্সেল সেটিংস পাওয়া
export async function GET() {
  try {
    const settings = loadSettings();
    
    return NextResponse.json({
      success: true,
      pixelSettings: settings.facebookPixel
    });
  } catch (error) {
    console.error('পিক্সেল সেটিংস পাওয়া যায়নি:', error);
    return NextResponse.json(
      { error: 'পিক্সেল সেটিংস পাওয়া যায়নি' },
      { status: 500 }
    );
  }
}

// POST - পিক্সেল সেটিংস আপডেট করা
export async function POST(request: Request) {
  try {
    const pixelSettings = await request.json();
    
    if (!pixelSettings) {
      return NextResponse.json(
        { error: 'পিক্সেল সেটিংস ডেটা প্রদান করা আবশ্যক' },
        { status: 400 }
      );
    }
    
    // বর্তমান সেটিংস লোড
    const settings = loadSettings();
    
    // পিক্সেল সেটিংস আপডেট
    settings.facebookPixel = {
      ...settings.facebookPixel,
      ...pixelSettings
    };
    
    const isSaved = saveSettings(settings);
    
    if (!isSaved) {
      return NextResponse.json(
        { error: 'পিক্সেল সেটিংস সেভ করতে সমস্যা হয়েছে' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'পিক্সেল সেটিংস সফলভাবে আপডেট করা হয়েছে',
      pixelSettings: settings.facebookPixel
    });
  } catch (error) {
    console.error('পিক্সেল সেটিংস আপডেট করতে সমস্যা:', error);
    return NextResponse.json(
      { error: 'পিক্সেল সেটিংস আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
} 