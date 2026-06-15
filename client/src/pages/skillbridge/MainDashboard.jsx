import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Award, Calendar, ArrowRight, Lock, PlayCircle } from 'lucide-react';
import axios from 'axios';
import SideNav from './components/SideNav';
import TopNav from './components/TopNav';

export default function MainDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/courses/my-courses');
      const coursesData = response.data.courses || [];
      setCourses(coursesData);
      
      // Set the first (most recent) course as current
      if (coursesData.length > 0) {
        const firstCourse = coursesData[0];
        setCurrentCourse(firstCourse);
        
        // Fetch detailed course data for the current course
        const detailsResponse = await axios.get(`/api/courses/${firstCourse.id}`);
        setCurrentCourse(detailsResponse.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setLoading(false);
      
      // Handle 403/401 - redirect to login
      if (err.response?.status === 403 || err.response?.status === 401) {
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Session expired. Please login again.' }
          });
        }, 100);
      } else {
        setError('Failed to load your courses');
      }
      return;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SideNav activePage="dashboard" />
        <main className="flex-1 md:ml-64">
          <TopNav />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your learning path...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Calculate stats from current course
  const totalModules = currentCourse?.modules?.length || 0;
  const completedModules = currentCourse?.modules?.filter(m => m.is_completed).length || 0;
  const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  
  // Find next uncompleted lesson
  let nextLesson = null;
  let nextModule = null;
  if (currentCourse?.modules) {
    for (const module of currentCourse.modules) {
      const uncompletedLesson = module.lessons?.find(l => !l.is_completed);
      if (uncompletedLesson) {
        nextLesson = uncompletedLesson;
        nextModule = module;
        break;
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav activePage="dashboard" />
      
      <main className="flex-1 md:ml-64">
        <TopNav />
        
        <div className="p-6 md:p-16 max-w-7xl mx-auto space-y-12">
          {/* Hero Progress Card */}
          {currentCourse && (
            <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0f1f3d] to-[#004d40] p-8 text-white shadow-xl">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
                <div className="space-y-6 flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">
                      {currentCourse.course.is_completed ? '✅ Completed' : '📚 In Progress'}
                    </span>
                    {totalModules > 0 && (
                      <span className="bg-teal-500/80 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {completedModules} of {totalModules} modules
                      </span>
                    )}
                  </div>

                  <h3 className="text-3xl font-bold">{currentCourse.course.title}</h3>
                  <p className="text-white/80">{currentCourse.course.description}</p>

                  <div className="space-y-2 max-w-md">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span className="text-teal-300">{progressPercentage}% complete</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-teal-400 h-full rounded-full transition-all duration-1000" 
                        style={{width: `${progressPercentage}%`}}
                      ></div>
                    </div>
                  </div>

                  {nextLesson && (
                    <div className="pt-2">
                      <p className="text-xs uppercase tracking-wider text-gray-300 mb-1">Next Lesson</p>
                      <p className="text-lg font-bold">{nextLesson.title}</p>
                      <p className="text-sm text-white/60 mt-1">
                        Module: {nextModule.title}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  {nextLesson ? (
                    <Link
                      to={`/course/${currentCourse.course.id}`}
                      className="bg-teal-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-teal-600 transition-all shadow-lg group"
                    >
                      Continue Learning
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <Link
                      to={`/course/${currentCourse.course.id}`}
                      className="bg-green-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-green-600 transition-all shadow-lg"
                    >
                      View Course
                      <Award className="w-5 h-5" />
                    </Link>
                  )}
                  <p className="text-sm text-center text-white/60">
                    {currentCourse.course.estimated_hours}h total • {totalModules} modules
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* No Course Message */}
          {!currentCourse && !loading && (
            <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 p-8 text-gray-700 shadow-xl">
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold mb-4">Welcome to SkillBridge!</h3>
                <p className="text-gray-600 mb-6">You haven't started any courses yet.</p>
                <Link
                  to="/onboarding-role"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90"
                >
                  Start Your Learning Journey
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </section>
          )}

          {/* Stats Row */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border-l-4 border-teal-500 hover:translate-y-[-4px] transition-transform shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-teal-500" />
              </div>
              <p className="text-gray-600 text-sm">Modules Completed</p>
              <h4 className="text-3xl font-bold text-primary mt-1">{completedModules}/{totalModules}</h4>
            </div>

            <div className="bg-white p-6 rounded-xl border-l-4 border-blue-400 hover:translate-y-[-4px] transition-transform shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-gray-600 text-sm">Estimated Time</p>
              <h4 className="text-3xl font-bold text-primary mt-1">
                {currentCourse?.course.estimated_hours || 0}h
              </h4>
            </div>

            <div className="bg-white p-6 rounded-xl border-l-4 border-orange-400 hover:translate-y-[-4px] transition-transform shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <PlayCircle className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-gray-600 text-sm">Video Lessons</p>
              <h4 className="text-3xl font-bold text-primary mt-1">
                {currentCourse?.modules?.reduce((acc, m) => acc + (m.lessons?.filter(l => l.type === 'video').length || 0), 0) || 0}
              </h4>
            </div>

            <div className="bg-white p-6 rounded-xl border-l-4 border-purple-400 hover:translate-y-[-4px] transition-transform shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-gray-600 text-sm">AI Tools</p>
              <h4 className="text-3xl font-bold text-primary mt-1">{totalModules}</h4>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* My Learning Path */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-primary">My Learning Path</h3>
                <Link to="/courses" className="text-teal-600 font-bold text-sm hover:underline">
                  View All Modules
                </Link>
              </div>

              <div className="space-y-4">
                {currentCourse?.modules && currentCourse.modules.length > 0 ? (
                  currentCourse.modules.map((module, idx) => {
                    const moduleProgress = module.total_lessons > 0 
                      ? Math.round((module.completed_lessons / module.total_lessons) * 100)
                      : 0;
                    
                    const isCompleted = module.is_completed;
                    const hasStarted = module.completed_lessons > 0;
                    const isInProgress = hasStarted && !isCompleted;
                    const isLocked = idx > 0 && !currentCourse.modules[idx - 1].is_completed;
                    
                    // Get category emoji
                    const getCategoryEmoji = (category) => {
                      const emojiMap = {
                        'Communication': '💬',
                        'Writing': '✍️',
                        'Design': '🎨',
                        'Productivity': '🔧',
                        'Analytics': '📊',
                        'Video': '🎥',
                        'Meeting': '🎤',
                        'Automation': '⚡',
                        'Research': '🔍',
                        'Translation': '🌐'
                      };
                      return emojiMap[category] || '🤖';
                    };

                    return (
                      <Link
                        key={module.id}
                        to={isLocked ? '#' : `/course/${currentCourse.course.id}?module=${module.id}`}
                        className={`bg-white p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 transition-all ${
                          isLocked
                            ? 'border border-gray-200 opacity-60 cursor-not-allowed'
                            : isInProgress
                            ? 'border-2 border-teal-500/20 shadow-md hover:shadow-lg'
                            : 'border border-gray-200 hover:border-teal-500'
                        }`}
                        onClick={(e) => isLocked && e.preventDefault()}
                      >
                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 ${
                          isCompleted ? 'bg-teal-100' : isInProgress ? 'bg-teal-100/20' : 'bg-gray-100'
                        } ${isLocked ? 'grayscale' : ''}`}>
                          <span className="text-2xl">{getCategoryEmoji(module.tool_category)}</span>
                        </div>
                        <div className="flex-1 space-y-1 w-full text-center md:text-left">
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-600">Module {module.order}</p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isCompleted
                                ? 'bg-teal-100 text-teal-700'
                                : isInProgress
                                ? 'bg-teal-500 text-white'
                                : isLocked
                                ? 'bg-gray-300 text-gray-600 flex items-center gap-1'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {isLocked && <Lock className="w-3 h-3" />}
                              {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : isLocked ? 'Locked' : 'Not Started'}
                            </span>
                          </div>
                          <h5 className="font-bold text-primary">{module.title}</h5>
                          <p className="text-xs text-gray-600">
                            {module.total_lessons} Lessons • {module.estimated_minutes}m total
                          </p>
                        </div>
                        <div className="w-full md:w-32 shrink-0 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>Progress</span>
                            <span className={isInProgress ? 'text-teal-600' : ''}>{moduleProgress}%</span>
                          </div>
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                            isCompleted ? 'bg-teal-100' : 'bg-gray-200'
                          }`}>
                            <div 
                              className={`h-full rounded-full ${
                                isCompleted ? 'bg-teal-500' : isLocked ? 'bg-gray-400' : 'bg-teal-500'
                              }`}
                              style={{width: `${moduleProgress}%`}}
                            ></div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No modules available yet
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
              {/* Recent Activity */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-4">Recent Activity</h3>
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                  <div className="p-6 space-y-6">
                    <div className="flex gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm text-on-surface leading-tight">
                          You completed: <span className="font-bold">Introduction to ChatGPT</span>
                        </p>
                        <p className="text-xs text-gray-600 opacity-70 mt-1">2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-orange-600">❓</span>
                      </div>
                      <div>
                        <p className="text-sm text-on-surface leading-tight">
                          Quiz passed: <span className="font-bold">Prompt Engineering Basics</span>
                        </p>
                        <p className="text-xs text-gray-600 opacity-70 mt-1">Yesterday</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600">🔓</span>
                      </div>
                      <div>
                        <p className="text-sm text-on-surface leading-tight">
                          New lesson unlocked: <span className="font-bold">Canva AI for Presentations</span>
                        </p>
                        <p className="text-xs text-gray-600 opacity-70 mt-1">Yesterday</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full p-3 text-center text-sm font-semibold text-teal-600 border-t border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                    View All Activity
                  </button>
                </div>
              </div>

              {/* Tip of the Day */}
              <div className="bg-[#00071b] text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <span className="text-[100px]">💡</span>
                </div>
                <h4 className="text-sm text-teal-400 mb-2 uppercase tracking-widest font-semibold">
                  Tip of the Day
                </h4>
                <p className="text-sm mb-4 leading-relaxed">
                  "When writing prompts, try giving the AI a persona like 'Expert Career Counselor' for more specific recruitment advice."
                </p>
                <button className="text-teal-400 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Learn More →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating AI Mentor Button */}
      <Link
        to="/mentor"
        className="fixed bottom-6 right-6 w-14 h-14 bg-teal-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <span className="text-2xl">💬</span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
      </Link>
    </div>
  );
}
