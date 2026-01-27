
import React from 'react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate, currentPage }) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => onNavigate('home')}
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="font-bold text-xl tracking-tight text-gray-900">WhiteTriangle</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <button 
          onClick={() => onNavigate('home')}
          className={`text-sm font-medium ${currentPage === 'home' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Marketplace
        </button>
        <button 
          onClick={() => onNavigate('dashboard')}
          className={`text-sm font-medium ${currentPage === 'dashboard' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          My Trades
        </button>
        <button 
          onClick={() => onNavigate('security')}
          className={`text-sm font-medium ${currentPage === 'security' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Security
        </button>
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => onNavigate('admin')}
            className={`text-sm font-medium ${currentPage === 'admin' ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Admin Panel
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Verified User</p>
              <p className="text-sm font-semibold text-gray-900">{user.email}</p>
            </div>
            <button 
              onClick={onLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={() => onNavigate('auth')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md shadow-blue-100"
          >
            Get Started
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
