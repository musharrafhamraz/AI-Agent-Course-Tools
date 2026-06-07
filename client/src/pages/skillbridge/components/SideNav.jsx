import { Link } from 'react-router-dom';
import { Home, BookOpen, TrendingUp, Bot, Settings, Shield, HelpCircle } from 'lucide-react';

export default function SideNav({ activePage = 'dashboard' }) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', to: '/dashboard' },
    { id: 'courses', icon: BookOpen, label: 'Courses', to: '/courses' },
    { id: 'progress', icon: TrendingUp, label: 'Progress', to: '/progress' },
    { id: 'mentor', icon: Bot, label: 'Mentor', to: '/mentor' },
    { id: 'settings', icon: Settings, label: 'Settings', to: '/settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-white p-6 gap-2 border-r border-gray-200 z-50">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-primary">SkillBridge</h1>
        <p className="text-sm text-gray-600 opacity-70">AI-Powered Learning</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <Link
              key={item.id}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-teal-100 text-teal-700 font-bold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="bg-[#0f1f3d] p-4 rounded-xl text-center text-white">
          <p className="text-sm mb-3 font-semibold">Unlock full potential</p>
          <button className="w-full py-2 bg-teal-500 text-white font-bold rounded-lg text-sm hover:bg-teal-600 transition-all">
            Upgrade to Pro
          </button>
        </div>

        <div className="space-y-1">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Shield className="w-5 h-5" />
            <span className="text-sm">Admin Panel</span>
          </Link>
          <Link
            to="/help"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm">Help Center</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
