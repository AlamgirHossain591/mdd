'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../auth/AuthContext';

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  
  const isLinkActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  const menuItems = [
    { path: '/dashboard', label: 'ড্যাশবোর্ড', roles: ['admin', 'superadmin'] },
    { path: '/dashboard/products', label: 'পণ্যসমূহ', roles: ['admin', 'superadmin'] },
    { path: '/dashboard/orders', label: 'অর্ডারসমূহ', roles: ['admin', 'superadmin'] },
    { path: '/dashboard/customers', label: 'গ্রাহকবৃন্দ', roles: ['admin', 'superadmin'] },
    { path: '/dashboard/settings', label: 'সেটিংস', roles: ['admin', 'superadmin'] },
    { path: '/dashboard/settings/pixel', label: 'ফেসবুক পিক্সেল', roles: ['admin', 'superadmin'] },
    { path: '/dashboard/users', label: 'ইউজার ম্যানেজমেন্ট', roles: ['superadmin'] },
  ];
  
  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div className={`w-64 bg-white shadow-md h-screen p-4 sticky top-0 ${className}`}>
      <div className="flex justify-center mb-6 pt-4">
        <Link href="/dashboard">
          <h1 className="text-2xl font-bold text-blue-800">AYYAN</h1>
        </Link>
      </div>
      
      <nav className="space-y-2">
        {filteredMenuItems.map((item, index) => (
          <Link
            key={index}
            href={item.path}
            className={`block px-4 py-2 rounded ${
              isLinkActive(item.path)
                ? 'bg-pink-100 text-pink-600' 
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      
      <div className="absolute bottom-8 left-0 w-full px-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          লগআউট
        </button>
      </div>
    </div>
  );
} 