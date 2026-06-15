import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Download, Calendar, Award, Wrench } from 'lucide-react';

export default function OnboardingPlan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [completing, setCompleting] = useState(false);
  
  const profileId = localStorage.getItem('onboarding_profile_id');

  useEffect(() => {
    if (!profileId) {
      navigate('/onboarding-role');
      return;
    }
    
    fetchLearningPlan();
  }, [profileId]);

  const fetchLearningPlan = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/onboarding/learning-plan/generate', {
        user_profile_id: parseInt(profileId)
      });
      
      setCourse(response.data.course);
      setModules(response.data.modules);
      
    } catch (err) {
      console.error('Error fetching learning plan:', err);
      setError(err.response?.data?.detail || 'Failed to generate learning plan');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = async () => {
    try {
      setCompleting(true);
      await axios.post('/api/onboarding/complete', {
        user_profile_id: parseInt(profileId)
      });
      
      // Clear onboarding data
      localStorage.removeItem('onboarding_profile_id');
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError(err.response?.data?.detail || 'Failed to complete onboarding');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your personalized learning plan...</p>
        </div>
      </div>
    );
  }

  const skills = modules;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* TopNav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">SkillBridge</span>
            <span className="bg-teal-100 text-teal-700 px-2 rounded text-xs font-bold">BETA</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="cursor-pointer hover:bg-gray-100 p-2 rounded-full">❓</span>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">👤</div>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden min-h-screen">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-6 md:px-16 pt-12 pb-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100/30 text-teal-700 rounded-full mb-6 animate-bounce">
            <span>✨</span>
            <span className="text-sm font-semibold">Curated by SkillBridge AI</span>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">Your personalised AI learning plan is ready!</h1>
          <p className="text-lg text-gray-600">Based on your role, here's what you'll learn to master productivity and innovation.</p>
        </section>

        {/* Stats Bar */}
        <section className="max-w-4xl mx-auto px-6 md:px-16 mb-12 relative z-10">
          <div className="bg-gray-100 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-teal-600">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider">Total tools</p>
                <p className="text-xl font-bold text-primary">{modules.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-teal-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider">Completion</p>
                <p className="text-xl font-bold text-primary">{Math.ceil((course?.estimated_hours || 8) / 2)} weeks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-teal-600">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider">Outcome</p>
                <p className="text-xl font-bold text-primary">Certificate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Plan Timeline */}
        <section className="max-w-4xl mx-auto px-6 md:px-16 pb-20 relative z-10">
          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-6 top-4 bottom-4 w-1 bg-teal-200 opacity-20 hidden md:block"></div>

            <div className="space-y-6">
              {skills.map((skill, index) => (
                <div key={skill.id} className="flex flex-col md:flex-row gap-6 group">
                  <div className="relative z-20 flex-shrink-0 hidden md:block">
                    <div className="w-12 h-12 rounded-full bg-teal-500 border-4 border-white flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-grow bg-white p-6 rounded-xl border-t-4 border-teal-500 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 p-2 flex items-center justify-center">
                      <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500 rounded"></div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center gap-4 mb-2">
                        <h3 className="text-xl font-bold text-primary">{skill.module_title}</h3>
                        <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                          {skill.tool_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-gray-600 mb-3">
                        <span className="flex items-center gap-2 text-sm">
                          <span>📚</span> {skill.lessons} lessons
                        </span>
                        <span className="flex items-center gap-2 text-sm">
                          <span>⏱️</span> {skill.estimated_minutes} min
                        </span>
                      </div>
                      <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        <p className="text-sm">
                          <span className="text-gray-600">Automates:</span> {skill.automates_what}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* CTA Section */}
              <div className="pt-12 flex flex-col md:flex-row items-center justify-center gap-6 border-t border-gray-300 mt-12">
                <button
                  onClick={handleStartLearning}
                  disabled={completing}
                  className="w-full md:w-auto px-20 py-4 bg-primary text-white font-bold rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {completing ? 'Loading...' : 'Start Learning'}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="text-primary font-bold hover:text-teal-600 flex items-center gap-2 py-4">
                  <Download className="w-5 h-5" />
                  Download as PDF
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <span className="text-2xl font-bold text-white block mb-4">SkillBridge</span>
            <p className="text-sm text-white/70">Empowering professionals through AI mastery.</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-teal-400 uppercase font-semibold">Platform</p>
            <a href="#" className="text-sm text-white/70 hover:text-teal-400">Courses</a>
            <a href="#" className="text-sm text-white/70 hover:text-teal-400">Pricing</a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-teal-400 uppercase font-semibold">Legal</p>
            <a href="#" className="text-sm text-white/70 hover:text-teal-400">Privacy Policy</a>
            <a href="#" className="text-sm text-white/70 hover:text-teal-400">Terms of Service</a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-teal-400 uppercase font-semibold">Support</p>
            <a href="#" className="text-sm text-white/70 hover:text-teal-400">Help Center</a>
            <a href="#" className="text-sm text-white/70 hover:text-teal-400">Contact Us</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-16 mt-12 pt-6 border-t border-white/10">
          <p className="text-sm text-white/60 text-center">© 2024 SkillBridge AI Training. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
