import { Link } from 'react-router-dom';
import { Home, Search, LayoutDashboard } from 'lucide-react';

export default function NotFound404() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#fcf8ff] via-[#f5f2ff] to-[#e8e6ff]">
      {/* TopNavBar */}
      <header className="bg-surface/80 backdrop-blur-md w-full top-0 sticky shadow-sm z-50">
        <nav className="max-w-7xl mx-auto flex justify-between items-center px-16 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">SkillBridge</span>
          </div>
          <div className="hidden md:flex items-center gap-12">
            <Link to="/" className="text-on-surface-variant hover:text-secondary transition-colors">About</Link>
            <Link to="/pricing" className="text-on-surface-variant hover:text-secondary transition-colors">Pricing</Link>
            <Link to="/" className="text-on-surface-variant hover:text-secondary transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-primary">Log In</Link>
            <Link to="/signup" className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all">Get Started</Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-16 py-20">
        <div className="max-w-3xl w-full text-center">
          {/* 404 Typography */}
          <div className="relative inline-block mb-12">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-64 h-64 md:w-80 md:h-80 mb-6">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl font-extrabold text-primary opacity-10">404</span>
                </div>
              </div>
              <h1 className="text-6xl md:text-9xl font-extrabold text-primary tracking-tighter leading-none">
                404
              </h1>
            </div>
          </div>

          {/* Heading & Subtext */}
          <div className="space-y-3 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              Looks like this page took a career break.
            </h2>
            <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
              We couldn't find the skill path or course you were looking for. Perhaps it's currently being refactored for a better future.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={20} />
              Go to Dashboard
            </Link>
            <Link 
              to="/" 
              className="w-full sm:w-auto bg-transparent border-2 border-primary text-primary px-8 py-3 rounded-lg font-bold hover:bg-surface-container-low transition-all flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Back to Home
            </Link>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="bg-white p-1 rounded-xl flex items-center border border-outline-variant focus-within:ring-2 focus-within:ring-secondary transition-all shadow-sm">
              <Search className="ml-3 text-outline" size={20} />
              <input 
                className="w-full bg-transparent border-none focus:ring-0 px-3 py-2 placeholder:text-on-surface-variant" 
                placeholder="Search for courses, mentors, or articles..." 
                type="text"
              />
              <button className="bg-secondary text-white px-6 py-2 rounded-lg font-medium hover:bg-secondary/90 transition-transform active:scale-95">
                Search
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mt-2">
              Can't find what you need? Visit our <Link to="/help" className="text-secondary underline">Help Center</Link>.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 px-16 py-12">
          <div className="col-span-1">
            <span className="text-2xl font-bold text-white block mb-6">SkillBridge</span>
            <p className="text-sm text-on-primary-fixed-variant">
              Empowering professionals with AI-driven learning experiences. Level up your career today.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-sm font-bold text-white uppercase tracking-widest opacity-60">Product</span>
            <Link to="/courses" className="text-sm text-on-primary-fixed-variant hover:text-secondary-fixed transition-colors">Courses</Link>
            <Link to="/" className="text-sm text-on-primary-fixed-variant hover:text-secondary-fixed transition-colors">Mentorship</Link>
            <Link to="/" className="text-sm text-on-primary-fixed-variant hover:text-secondary-fixed transition-colors">For Business</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-sm font-bold text-white uppercase tracking-widest opacity-60">Company</span>
            <Link to="/" className="text-sm text-on-primary-fixed-variant hover:text-secondary-fixed transition-colors">About Us</Link>
            <Link to="/" className="text-sm text-on-primary-fixed-variant hover:text-secondary-fixed transition-colors">Careers</Link>
            <Link to="/" className="text-sm text-on-primary-fixed-variant hover:text-secondary-fixed transition-colors">Privacy Policy</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-sm font-bold text-white uppercase tracking-widest opacity-60">Contact</span>
            <Link to="/contact" className="text-sm text-on-primary-fixed-variant hover:text-secondary-fixed transition-colors">Contact Support</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-16 py-6 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-sm text-on-primary-fixed-variant opacity-80">© 2024 SkillBridge AI Training. All rights reserved.</span>
          <div className="flex gap-12">
            <Link to="/" className="text-sm text-on-primary-fixed-variant hover:text-secondary-fixed transition-colors">Terms</Link>
            <Link to="/" className="text-sm text-on-primary-fixed-variant hover:text-secondary-fixed transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
