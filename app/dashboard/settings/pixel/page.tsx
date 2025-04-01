'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// ফেসবুক পিক্সেল ইভেন্ট টাইপ
type FacebookPixelEvent = {
  id: string;
  name: string;
  active: boolean;
};

// ফেসবুক পিক্সেল সেটিংস টাইপ
type FacebookPixelSettings = {
  enabled: boolean;
  pixelId: string;
  events: FacebookPixelEvent[];
};

export default function FacebookPixelSettingsPage() {
  // সেটিংস স্টেট
  const [settings, setSettings] = useState<FacebookPixelSettings>({
    enabled: false,
    pixelId: '',
    events: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // পিক্সেল সেটিংস লোড করা
  useEffect(() => {
    const loadPixelSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/settings/pixel');
        
        if (!response.ok) {
          throw new Error('পিক্সেল সেটিংস লোড করতে সমস্যা হয়েছে');
        }
        
        const data = await response.json();
        setSettings(data.pixelSettings);
        setError(null);
      } catch (error) {
        console.error('পিক্সেল সেটিংস লোড করতে সমস্যা:', error);
        setError('পিক্সেল সেটিংস লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।');
      } finally {
        setLoading(false);
      }
    };
    
    loadPixelSettings();
  }, []);
  
  // পিক্সেল আইডি হ্যান্ডেল করা
  const handlePixelIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      pixelId: e.target.value
    }));
  };
  
  // পিক্সেল এনাবল/ডিসেবল টগল করা
  const handleToggleEnabled = () => {
    setSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };
  
  // নতুন ইভেন্ট যোগ করা
  const handleAddEvent = () => {
    const newEvent: FacebookPixelEvent = {
      id: Date.now().toString(),
      name: '',
      active: true
    };
    
    setSettings(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));
  };
  
  // ইভেন্ট আপডেট করা
  const handleEventChange = (id: string, field: keyof FacebookPixelEvent, value: any) => {
    setSettings(prev => ({
      ...prev,
      events: prev.events.map(event => 
        event.id === id ? { ...event, [field]: value } : event
      )
    }));
  };
  
  // ইভেন্ট মুছে ফেলা
  const handleRemoveEvent = (id: string) => {
    setSettings(prev => ({
      ...prev,
      events: prev.events.filter(event => event.id !== id)
    }));
  };
  
  // সেটিংস সেভ করা
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // পিক্সেল আইডি ফরম্যাট চেক করা
      if (settings.enabled && !settings.pixelId.trim()) {
        toast.error('পিক্সেল আইডি দিতে হবে');
        return;
      }
      
      // API কল করে সেটিংস সেভ করা
      const response = await fetch('/api/settings/pixel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'পিক্সেল সেটিংস সেভ করতে সমস্যা হয়েছে');
      }
      
      toast.success('পিক্সেল সেটিংস সফলভাবে সেভ হয়েছে!');
    } catch (error: any) {
      console.error('পিক্সেল সেটিংস সেভ করতে সমস্যা:', error);
      setError(error.message || 'পিক্সেল সেটিংস সেভ করতে সমস্যা হয়েছে');
      toast.error(error.message || 'পিক্সেল সেটিংস সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };
  
  // সাধারণ ফেসবুক ইভেন্ট গুলো
  const commonEvents = [
    'PageView',
    'ViewContent',
    'AddToCart',
    'InitiateCheckout',
    'Purchase',
    'AddPaymentInfo',
    'CompleteRegistration',
    'Contact',
    'CustomizeProduct',
    'Donate',
    'FindLocation',
    'Schedule',
    'Search',
    'StartTrial',
    'SubmitApplication',
    'Subscribe'
  ];
  
  // সাধারণ ইভেন্ট যোগ করা
  const handleAddCommonEvent = (eventName: string) => {
    // চেক করা যে ইভেন্ট আগে থেকে আছে কিনা
    const eventExists = settings.events.some(event => event.name === eventName);
    
    if (eventExists) {
      toast.error(`${eventName} ইভেন্ট ইতিমধ্যে যোগ করা হয়েছে`);
      return;
    }
    
    const newEvent: FacebookPixelEvent = {
      id: Date.now().toString(),
      name: eventName,
      active: true
    };
    
    setSettings(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));
    
    toast.success(`${eventName} ইভেন্ট যোগ করা হয়েছে`);
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-800">ফেসবুক পিক্সেল সেটিংস</h1>
        <p className="text-blue-600">আপনার ওয়েবসাইটে ফেসবুক পিক্সেল কনফিগার করুন</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
          {error}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-800">ফেসবুক পিক্সেল</h2>
              <div className="flex items-center">
                <span className="mr-2 text-blue-600">{settings.enabled ? 'এনাবল' : 'ডিসেবল'}</span>
                <button 
                  onClick={handleToggleEnabled}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                    settings.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  } transition-colors duration-300 focus:outline-none`}
                >
                  <span 
                    className={`inline-block w-4 h-4 transform transition-transform duration-300 bg-white rounded-full ${
                      settings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} 
                  />
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-blue-800 mb-2" htmlFor="pixelId">
                পিক্সেল আইডি
              </label>
              <input 
                type="text" 
                id="pixelId"
                value={settings.pixelId}
                onChange={handlePixelIdChange}
                placeholder="ফেসবুক পিক্সেল আইডি দিন (উদাহরণ: 123456789012345)"
                className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                disabled={!settings.enabled}
              />
              <p className="text-sm text-blue-600 mt-1">
                আপনার ফেসবুক পিক্সেল আইডি দিন (ফেসবুক Event Manager থেকে পাওয়া যাবে)
              </p>
            </div>
            
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-blue-800">ইভেন্টস</h3>
                <button 
                  onClick={handleAddEvent}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  disabled={!settings.enabled}
                >
                  + নতুন ইভেন্ট
                </button>
              </div>
              
              <div className="mb-6 border rounded-lg p-4 bg-blue-50">
                <h4 className="text-blue-800 font-medium mb-2">সাধারণ ইভেন্টস</h4>
                <div className="flex flex-wrap gap-2">
                  {commonEvents.map(event => (
                    <button
                      key={event}
                      onClick={() => handleAddCommonEvent(event)}
                      className="bg-white text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200 hover:bg-blue-100"
                      disabled={!settings.enabled}
                    >
                      + {event}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                {settings.events.length === 0 ? (
                  <div className="text-center py-8 text-blue-600 bg-blue-50 rounded">
                    কোন ইভেন্ট যোগ করা হয়নি। উপরের বাটন ক্লিক করে ইভেন্ট যোগ করুন।
                  </div>
                ) : (
                  settings.events.map(event => (
                    <div key={event.id} className="bg-gray-50 p-4 rounded border flex items-center">
                      <div className="flex-1">
                        <input 
                          type="text"
                          value={event.name}
                          onChange={(e) => handleEventChange(event.id, 'name', e.target.value)}
                          className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                          placeholder="ইভেন্ট নাম"
                          disabled={!settings.enabled}
                        />
                      </div>
                      <div className="ml-4 flex items-center">
                        <span className="mr-2 text-blue-600">{event.active ? 'এক্টিভ' : 'ইনএক্টিভ'}</span>
                        <button 
                          onClick={() => handleEventChange(event.id, 'active', !event.active)}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                            event.active ? 'bg-blue-600' : 'bg-gray-300'
                          } transition-colors duration-300 focus:outline-none mr-4`}
                          disabled={!settings.enabled}
                        >
                          <span 
                            className={`inline-block w-4 h-4 transform transition-transform duration-300 bg-white rounded-full ${
                              event.active ? 'translate-x-6' : 'translate-x-1'
                            }`} 
                          />
                        </button>
                        <button 
                          onClick={() => handleRemoveEvent(event.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                          disabled={!settings.enabled}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-8">
            <button 
              onClick={handleSaveSettings}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  সেভ হচ্ছে...
                </>
              ) : 'সেটিংস সেভ করুন'}
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">পিক্সেল ইম্প্লিমেন্টেশন গাইড</h2>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-medium text-blue-800 mb-2">১. ফেসবুক পিক্সেল সেটাপ</h3>
            <p className="text-blue-600 mb-2">
              উপরে আপনার ফেসবুক পিক্সেল আইডি যোগ করুন এবং প্রয়োজনীয় ইভেন্টগুলো সক্রিয় করুন।
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-medium text-blue-800 mb-2">২. সার্ভার-সাইড ট্র্যাকিং</h3>
            <p className="text-blue-600 mb-2">
              আপনার ওয়েবসাইটের সার্ভার-সাইড ট্র্যাকিং স্বয়ংক্রিয়ভাবে সেটাপ হয়ে যাবে। 
              এটি  <code className="bg-white px-1 py-0.5 rounded">Checkout</code>, <code className="bg-white px-1 py-0.5 rounded">Purchase</code> এবং  
              <code className="bg-white px-1 py-0.5 rounded">AddToCart</code> ইভেন্টগুলো ক্যাপচার করবে।
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-medium text-blue-800 mb-2">৩. ব্রাউজার-সাইড ট্র্যাকিং</h3>
            <p className="text-blue-600 mb-2">
              ব্রাউজার-সাইডে ইভেন্ট ট্র্যাক করতে নিম্নের ফাংশন ব্যবহার করুন:
            </p>
            <pre className="bg-gray-800 text-white p-3 rounded overflow-x-auto">
              {`fbq('track', 'PageView');
fbq('track', 'ViewContent', {
  content_ids: ['product_id'],
  content_type: 'product',
  value: 100,
  currency: 'BDT'
});`}
            </pre>
          </div>
          
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-medium text-blue-800 mb-2">৪. ডিবাগিং</h3>
            <p className="text-blue-600">
              ফেসবুক পিক্সেল হেল্পারের মাধ্যমে আপনার পিক্সেল সঠিকভাবে কাজ করছে কিনা চেক করুন।
              <a href="https://www.facebook.com/business/help/198406354510962" target="_blank" rel="noreferrer" className="underline ml-1">
                ফেসবুক পিক্সেল হেল্পার
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 