import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-pink-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">পেজটি পাওয়া যায়নি</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          আপনি যে পেজটি খুঁজছেন সেটি পাওয়া যায়নি। হয়তো পেজটি সরানো হয়েছে অথবা লিংকটি ভুল।
        </p>
        <Link 
          href="/"
          className="px-6 py-3 bg-pink-600 text-white rounded-full font-medium hover:bg-pink-700 transition-colors"
        >
          হোম পেজে ফিরে যান
        </Link>
      </div>
    </div>
  );
} 