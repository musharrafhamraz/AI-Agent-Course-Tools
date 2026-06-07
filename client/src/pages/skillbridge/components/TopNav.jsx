import { Bell, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopNav({ userName = 'Sarah Jenkins', userRole = 'HR Specialist' }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 md:px-16 py-4 flex justify-between items-center">
      <div className="flex flex-col">
        {/* <h2 className="text-xl font-bold text-primary">Good morning, {userName.split(' ')[0]} 👋</h2>
        <p className="text-sm text-gray-600">{currentDate}</p> */}
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/notifications"
          className="relative p-2 rounded-full hover:bg-gray-100 transition-all"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Link>

        <button className="p-2 rounded-full hover:bg-gray-100 transition-all">
          <HelpCircle className="w-5 h-5 text-gray-600" />
        </button>

        <div className="h-8 w-[1px] bg-gray-300 mx-2"></div>

        <Link to="/profile" className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-primary">{userName}</p>
            <p className="text-xs text-gray-600">{userRole}</p>
          </div>
          <img
            alt="User avatar"
            className="w-10 h-10 rounded-full border-2 border-teal-500 p-[2px] bg-white group-hover:scale-105 transition-transform"
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
          />
        </Link>
      </div>
    </header>
  );
}
