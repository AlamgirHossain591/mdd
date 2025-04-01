'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  RiDashboardLine, 
  RiShoppingBag3Line, 
  RiUserLine, 
  RiSettings4Line, 
  RiLogoutBoxRLine,
  RiMenu2Line,
  RiCloseLine,
  RiStore2Line,
  RiFileListLine,
  RiBarChartBoxLine
} from 'react-icons/ri';

const menuItems = [
  { 
    name: 'ড্যাশবোর্ড', 
    href: '/dashboard', 
    icon: RiDashboardLine 
  },
  { 
    name: 'পণ্য ব্যবস্থাপনা', 
    href: '/dashboard/products', 
    icon: RiShoppingBag3Line 
  },
  { 
    name: 'অর্ডার সমূহ', 
    href: '/dashboard/orders', 
    icon: RiFileListLine 
  },
  { 
    name: 'ক্যাটাগরি', 
    href: '/dashboard/categories', 
    icon: RiStore2Line 
  },
  { 
    name: 'গ্রাহক', 
    href: '/dashboard/customers', 
    icon: RiUserLine 
  },
  { 
    name: 'রিপোর্ট', 
    href: '/dashboard/reports', 
    icon: RiBarChartBoxLine 
  },
  { 
    name: 'সেটিংস', 
    href: '/dashboard/settings', 
    icon: RiSettings4Line 
  },
];

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* মোবাইল নেভিগেশন বাটন */}
      <div className="fixed top-0 left-0 p-4 z-50 block md:hidden">
        <button 
          onClick={toggleMobileMenu} 
          className="p-2 text-gray-700 bg-white rounded-md shadow-md hover:bg-gray-50"
        >
          {isMobileMenuOpen ? (
            <RiCloseLine className="w-6 h-6" />
          ) : (
            <RiMenu2Line className="w-6 h-6" />
          )}
        </button>
      </div>
      
      {/* সাইডবার */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white shadow-md z-40 transition-transform duration-300 transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-64 md:w-72
      `}>
        <div className="h-full flex flex-col">
          {/* লোগো */}
          <div className="px-6 py-8 flex items-center border-b border-gray-200">
            <h1 className="text-xl font-bold text-pink-600">আয়ান ফ্যাশন অ্যাডমিন</h1>
          </div>

          {/* নেভিগেশন মেনু */}
          <nav className="flex-1 py-6 px-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors
                      ${pathname === item.href 
                        ? 'bg-pink-50 text-pink-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* লগআউট বাটন */}
          <div className="p-4 border-t border-gray-200">
            <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900">
              <RiLogoutBoxRLine className="w-5 h-5 mr-3" />
              লগআউট
            </button>
          </div>
        </div>
      </aside>
    </>
  );
} 