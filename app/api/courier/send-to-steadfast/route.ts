import { NextResponse } from 'next/server';

// স্টেডফাস্ট কুরিয়ার সার্ভিসের API URL
const STEADFAST_BASE_URL = 'https://portal.packzy.com/api/v1';

// অর্ডার ক্রিয়েট করার এন্ডপয়েন্ট
export async function POST(request: Request) {
  try {
    const { apiKey, secretKey, order } = await request.json();
    
    // API কী এবং সিক্রেট কী চেক করা
    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: 'API কী এবং সিক্রেট কী প্রয়োজন' },
        { status: 400 }
      );
    }
    
    // অর্ডার ডাটা চেক করা
    if (!order || !order.recipient_name || !order.recipient_phone || !order.recipient_address || order.cod_amount === undefined) {
      return NextResponse.json(
        { error: 'অর্ডার ডাটা অসম্পূর্ণ আছে' },
        { status: 400 }
      );
    }
    
    // রিকোয়েস্ট প্যারামিটার প্রস্তুত করা
    const params = {
      invoice: order.invoice,
      recipient_name: order.recipient_name,
      recipient_phone: order.recipient_phone.replace(/[^0-9]/g, ''), // ফোন নাম্বার থেকে নন-ডিজিট ক্যারেক্টার রিমুভ করা
      recipient_address: order.recipient_address,
      cod_amount: order.cod_amount,
      note: `CANCEL HOLE CHARGE NIBEN ${order.note || ''}`
    };
    
    // স্টেডফাস্ট API কল করা
    const response = await fetch(`${STEADFAST_BASE_URL}/create_order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
        'Secret-Key': secretKey
      },
      body: JSON.stringify(params)
    });
    
    // রেসপন্স ডাটা
    const responseData = await response.json();
    
    // API রেসপন্স চেক করা
    if (!response.ok) {
      console.error('স্টেডফাস্ট API থেকে এরর:', responseData);
      return NextResponse.json(
        { 
          error: responseData.message || 'কুরিয়ার সার্ভিসে অর্ডার পাঠাতে সমস্যা হয়েছে', 
          details: responseData 
        },
        { status: response.status }
      );
    }
    
    // সাকসেস রেসপন্স
    return NextResponse.json({
      success: true,
      message: 'অর্ডার সফলভাবে কুরিয়ারে পাঠানো হয়েছে',
      tracking_code: responseData.consignment?.tracking_code || responseData.consignment?.trackingCode,
      consignment_id: responseData.consignment?.consignment_id || responseData.consignment?.id,
      status: responseData.consignment?.status || 'in_review',
      created_at: responseData.consignment?.created_at || new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('স্টেডফাস্ট API কল করতে সমস্যা:', error);
    return NextResponse.json(
      { error: error.message || 'কুরিয়ার সার্ভিসে অর্ডার পাঠাতে অভ্যন্তরীণ সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// ডেলিভারি স্ট্যাটাস চেক করার ফাংশন
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const apiKey = url.searchParams.get('apiKey');
    const secretKey = url.searchParams.get('secretKey');
    const trackingCode = url.searchParams.get('trackingCode');
    const consignmentId = url.searchParams.get('consignmentId');
    const invoice = url.searchParams.get('invoice');
    
    // API কী এবং সিক্রেট কী চেক করা
    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: 'API কী এবং সিক্রেট কী প্রয়োজন' },
        { status: 400 }
      );
    }
    
    // কোন আইডি বা ট্র্যাকিং কোড দেওয়া হয়েছে কিনা চেক করা
    if (!trackingCode && !consignmentId && !invoice) {
      return NextResponse.json(
        { error: 'ট্র্যাকিং কোড, কনসাইনমেন্ট আইডি বা ইনভয়েস নাম্বার প্রয়োজন' },
        { status: 400 }
      );
    }
    
    // রিকোয়েস্ট URL তৈরি করা
    let requestUrl;
    if (trackingCode) {
      requestUrl = `${STEADFAST_BASE_URL}/status_by_trackingcode/${trackingCode}`;
    } else if (consignmentId) {
      requestUrl = `${STEADFAST_BASE_URL}/status_by_cid/${consignmentId}`;
    } else {
      requestUrl = `${STEADFAST_BASE_URL}/status_by_invoice/${invoice}`;
    }
    
    // স্টেডফাস্ট API কল করা
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey,
        'Secret-Key': secretKey
      }
    });
    
    // রেসপন্স ডাটা
    const responseData = await response.json();
    
    // API রেসপন্স চেক করা
    if (!response.ok) {
      console.error('স্টেডফাস্ট API থেকে এরর:', responseData);
      return NextResponse.json(
        { 
          error: responseData.message || 'কুরিয়ার স্ট্যাটাস চেক করতে সমস্যা হয়েছে', 
          details: responseData 
        },
        { status: response.status }
      );
    }
    
    // বাংলা ভাষায় ডেলিভারি স্ট্যাটাস রিটার্ন করা
    const statusMapping: {[key: string]: string} = {
      'pending': 'প্রক্রিয়াধীন',
      'delivered_approval_pending': 'ডেলিভারি অনুমোদন অপেক্ষমান',
      'partial_delivered_approval_pending': 'আংশিক ডেলিভারি অনুমোদন অপেক্ষমান',
      'cancelled_approval_pending': 'বাতিল অনুমোদন অপেক্ষমান',
      'unknown_approval_pending': 'অজানা স্ট্যাটাস অনুমোদন অপেক্ষমান',
      'delivered': 'ডেলিভারি সম্পন্ন',
      'partial_delivered': 'আংশিক ডেলিভারি সম্পন্ন',
      'cancelled': 'বাতিল করা হয়েছে',
      'hold': 'হোল্ড করা আছে',
      'in_review': 'রিভিউয়ের অপেক্ষায়',
      'unknown': 'অজানা স্ট্যাটাস'
    };
    
    const deliveryStatus = responseData.delivery_status || 'unknown';
    const banglaStatus = statusMapping[deliveryStatus] || 'অজানা স্ট্যাটাস';
    
    // সাকসেস রেসপন্স
    return NextResponse.json({
      success: true,
      status: deliveryStatus,
      banglaStatus,
      message: `কুরিয়ার স্ট্যাটাস: ${banglaStatus}`
    });
    
  } catch (error: any) {
    console.error('স্টেডফাস্ট API স্ট্যাটাস চেক করতে সমস্যা:', error);
    return NextResponse.json(
      { error: error.message || 'কুরিয়ার স্ট্যাটাস চেক করতে অভ্যন্তরীণ সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
} 