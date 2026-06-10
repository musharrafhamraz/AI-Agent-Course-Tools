import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// SkillBridge Pages
import LandingPage from './pages/skillbridge/LandingPage';
import LoginPage from './pages/skillbridge/LoginPage';
import SignupPage from './pages/skillbridge/SignupPage';
import MainDashboard from './pages/skillbridge/MainDashboard';
import OnboardingRole from './pages/skillbridge/OnboardingRole';
import OnboardingTasks from './pages/skillbridge/OnboardingTasks';
import OnboardingPlan from './pages/skillbridge/OnboardingPlan';
import CourseCatalog from './pages/skillbridge/CourseCatalog';
import CourseModule from './pages/skillbridge/CourseModule';
import PricingPage from './pages/skillbridge/PricingPage';
import NotFound404 from './pages/skillbridge/NotFound404';
import QuizPage from './pages/skillbridge/QuizPage';
import ProgressTracker from './pages/skillbridge/ProgressTracker';
import Certificate from './pages/skillbridge/Certificate';
import Leaderboard from './pages/skillbridge/Leaderboard';
import CourseCatalogBrowse from './pages/skillbridge/CourseCatalogBrowse';
import AIMentorChat from './pages/skillbridge/AIMentorChat';
import MentorLibrary from './pages/skillbridge/MentorLibrary';
import CommunityFeed from './pages/skillbridge/CommunityFeed';
import NotificationsHub from './pages/skillbridge/NotificationsHub';
import MyProfile from './pages/skillbridge/MyProfile';
import Settings from './pages/skillbridge/Settings';
import AdminDashboard from './pages/skillbridge/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Onboarding Flow */}
          <Route path="/onboarding-role" element={<OnboardingRole />} />
          <Route path="/onboarding-tasks" element={<OnboardingTasks />} />
          <Route path="/onboarding-plan" element={<OnboardingPlan />} />

          {/* Main App Routes */}
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/browse" element={<CourseCatalogBrowse />} />
          <Route path="/course/:id" element={<CourseModule />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          
          {/* Additional Features */}
          <Route path="/progress" element={<ProgressTracker />} />
          <Route path="/certificate/:id" element={<Certificate />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/mentor" element={<AIMentorChat />} />
          <Route path="/mentors" element={<MentorLibrary />} />
          <Route path="/community" element={<CommunityFeed />} />
          <Route path="/notifications" element={<NotificationsHub />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* 404 */}
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
