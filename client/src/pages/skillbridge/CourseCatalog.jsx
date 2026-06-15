import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SideNav from './components/SideNav';
import TopNav from './components/TopNav';
import { Search, Star, PlayCircle } from 'lucide-react';
import axios from 'axios';

export default function CourseCatalog() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/courses/my-courses');
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setLoading(false);
      
      // If 403, likely not authenticated - redirect to login
      if (err.response?.status === 403 || err.response?.status === 401) {
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Please login to view courses.' }
          });
        }, 100);
      } else {
        // For other errors, just show empty courses
        setCourses([]);
      }
      return;
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course?.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav activePage="courses" />

      <main className="flex-1 md:ml-64">
        <TopNav />

        {/* Catalog Body */}
        <div className="px-6 md:px-16 py-12 max-w-7xl mx-auto w-full flex flex-col gap-12">
          {/* Hero Section */}
          <section className="flex flex-col gap-6">
            <h1 className="text-5xl font-bold text-primary">My Learning Courses</h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Continue your personalized learning journey with AI-powered courses tailored to your role and goals.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mt-4">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-12 pr-4 py-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Search your courses..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </section>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your courses...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && courses.length === 0 && (
            <div className="text-center py-20">
              <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Courses Yet</h3>
              <p className="text-gray-600 mb-6">Start your learning journey by completing the onboarding process.</p>
              <Link
                to="/onboarding-role"
                className="inline-flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-teal-600"
              >
                Start Onboarding
              </Link>
            </div>
          )}

          {/* Course Grid */}
          {!loading && filteredCourses.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                if (!course || !course.id) return null;
                
                const isInProgress = course.progress_percentage > 0 && !course.is_completed;
                const isCompleted = course.is_completed;

                return (
                  <article key={course.id} className="bg-white rounded-xl border-t-4 border-teal-500 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="h-48 bg-gradient-to-br from-teal-400 to-blue-500 rounded-t-lg flex items-center justify-center">
                      <PlayCircle className="w-16 h-16 text-white/80" />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          isCompleted ? 'bg-green-100 text-green-700' :
                          isInProgress ? 'bg-orange-100 text-orange-700' : 
                          'bg-teal-100 text-teal-700'
                        }`}>
                          {isCompleted ? '✅ Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">{course.total_modules} modules</span>
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-primary mb-2">{course.title}</h2>
                      <p className="text-gray-600 mb-4 flex-grow line-clamp-2">{course.description}</p>
                      <div className="flex items-center gap-6 text-gray-600 mb-4">
                        <span className="flex items-center gap-2 text-sm">
                          ⏱️ {course.estimated_hours}h
                        </span>
                        <span className="flex items-center gap-2 text-sm">
                          📚 {course.total_modules} modules
                        </span>
                      </div>
                      {course.progress_percentage > 0 && (
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-teal-600 font-bold">Progress</span>
                            <span>{course.progress_percentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full transition-all" style={{width: `${course.progress_percentage}%`}}></div>
                          </div>
                        </div>
                      )}
                      <Link
                        to={`/course/${course.id}`}
                        className={`w-full py-3 rounded-lg font-bold text-center transition-colors ${
                          isInProgress
                            ? 'border-2 border-teal-500 text-teal-500 hover:bg-teal-50'
                            : 'bg-teal-500 text-white hover:bg-teal-600'
                        }`}
                      >
                        {isInProgress ? 'Continue Learning' : isCompleted ? 'Review Course' : 'Start Course'}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          {/* No Results */}
          {!loading && searchQuery && filteredCourses.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-600">No courses match your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
