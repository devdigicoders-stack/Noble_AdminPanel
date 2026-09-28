import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Inbox, User, Key, LogOut, Shield, Phone, ExternalLink,
  ChevronRight, Building2, CheckCircle2
} from 'lucide-react';

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const navLinks = [
    { name: 'Enquiries', path: '/', icon: Inbox },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Change Password', path: '/change-password', icon: Key },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-[#0A1931] text-white flex flex-col justify-between shrink-0 border-r border-slate-800 shadow-2xl">
        <div>
          
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800">
            <div className="bg-white p-2.5 rounded-2xl inline-block shadow-md">
              <img src="/logo.svg" alt="Noble Housekeeping" className="h-9 w-auto object-contain" />
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#DFBF7A]">Admin Panel</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DFBF7A]/20 text-[#DFBF7A] border border-[#DFBF7A]/30">CR 206871</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Enquiry &amp; Support Management</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Main Menu
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#DFBF7A] text-[#0A1931] shadow-lg shadow-[#DFBF7A]/10 font-extrabold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </NavLink>
              );
            })}
          </nav>

          {/* Website Quick Link */}
          <div className="px-4 pt-2">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-slate-700/60 text-slate-300 text-xs font-semibold transition"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[#DFBF7A]" />
                <span>Visit Live Website</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* User Card & Logout Bottom */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gold-gradient text-[#0A1931] font-extrabold flex items-center justify-center text-sm shadow-md shrink-0">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{admin?.name || 'Administrator'}</h4>
              <p className="text-[11px] text-slate-400 truncate">{admin?.email || ''}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Session</span>
          </button>
        </div>

      </aside>

      {/* Main Content View */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div>
            <h2 className="text-lg font-extrabold text-[#0A1931]">Noble Housekeeping &amp; Contracting</h2>
            <p className="text-xs text-slate-500">Official Management Portal &bull; State of Qatar</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Portal Live</span>
            </span>
          </div>
        </header>

        <div className="p-4 sm:p-8 flex-1">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
