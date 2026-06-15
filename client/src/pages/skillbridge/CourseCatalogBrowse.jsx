import { Link } from 'react-router-dom';
import { Search, Clock, Star, ArrowRight, Timer } from 'lucide-react';
import SideNav from './components/SideNav';
import TopNav from './components/TopNav';

export default function CourseCatalogBrowse() {
  const filters = [
    { name: 'All Courses', active: true },
    { name: 'My Department', active: false },
    { name: 'Government & Policy', active: false },
    { name: 'Beginner Friendly', active: false },
    { name: 'Advanced Tech', active: false },
    { name: 'Business Intelligence', active: false },
  ];

  const recommendedCourses = [
    {
      id: 1,
      title: 'Ethics in AI Systems',
      category: 'Machine Learning',
      duration: '12h 45m',
      rating: 4.9,
      icon: 'neurology',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-700'
    },
    {
      id: 2,
      title: 'SQL for Governance',
      category: 'Big Data',
      duration: '8h 20m',
      rating: 4.7,
      icon: 'database',
      bgColor: 'bg-teal-100',
      iconColor: 'text-teal-700'
    },
    {
      id: 3,
      title: 'Data Privacy 101',
      category: 'Compliance',
      duration: '15h 00m',
      rating: 5.0,
      icon: 'security',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-700'
    },
  ];

  const courses = [
    {
      id: 1,
      title: 'Full-Stack Public Infrastructure',
      description: 'Learn to build resilient, scalable backend systems for large-scale government platforms using modern architecture.',
      category: 'DEVELOPMENT',
      level: 'Intermediate',
      duration: '34 Hours',
      rating: 4.8,
      categoryColor: 'bg-teal-600',
      borderColor: 'border-teal-600'
    },
    {
      id: 2,
      title: 'UX for Civic Engagement',
      description: 'Designing accessible digital services that prioritize the citizen experience and inclusivity in modern governance.',
      category: 'DESIGN',
      level: 'Beginner',
      duration: '18 Hours',
      rating: 4.9,
      categoryColor: 'bg-amber-500',
      borderColor: 'border-amber-500'
    },
    {
      id: 3,
      title: 'Macroeconomic Policy Analysis',
      description: 'Deep dive into global market trends and their direct impact on local budgetary planning and resource allocation.',
      category: 'ECONOMICS',
      level: 'Advanced',
      duration: '42 Hours',
      rating: 4.6,
      categoryColor: 'bg-teal-600',
      borderColor: 'border-teal-600'
    },
    {
      id: 4,
      title: 'Foundations of Health Informatics',
      description: 'An introduction to managing large-scale medical data and public health records within secure institutional frameworks.',
      category: 'BIOSCIENCE',
      level: 'Beginner',
      duration: '22 Hours',
      rating: 4.8,
      categoryColor: 'bg-teal-600',
      borderColor: 'border-teal-600'
    },
    {
      id: 5,
      title: 'Automation in Manufacturing',
      description: 'Master the implementation of automated workflows and robotic precision in modern industrial environments.',
      category: 'ENGINEERING',
      level: 'Intermediate',
      duration: '28 Hours',
      rating: 4.7,
      categoryColor: 'bg-amber-500',
      borderColor: 'border-amber-500'
    },
    {
      id: 6,
      title: 'Leadership in Digital Transformation',
      description: 'Strategic frameworks for leading departments through complex technological shifts and cultural evolution.',
      category: 'MANAGEMENT',
      level: 'Advanced',
      duration: '16 Hours',
      rating: 4.9,
      categoryColor: 'bg-teal-600',
      borderColor: 'border-teal-600'
    },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SideNav />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-12">
            {/* Header & Search */}
            <section className="mt-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Explore Knowledge</h1>
                  <p className="text-lg text-on-surface-variant">Unlock your potential with over 450+ industry-recognized programs.</p>
                </div>
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={20} />
                  <input
                    className="w-full pl-12 pr-6 py-3 rounded-xl border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                    placeholder="Search for skills, tools, or courses..."
                    type="text"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {filters.map((filter, index) => (
                  <button
                    key={index}
                    className={`px-6 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-colors ${
                      filter.active
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </section>

            {/* Featured Department Banner */}
            <section className="mt-12">
              <div className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-xl overflow-hidden shadow-lg bg-primary-container">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/40 to-transparent flex flex-col justify-center p-12">
                  <span className="inline-block w-fit font-medium text-xs text-secondary-fixed bg-on-secondary-fixed-variant px-3 py-1 rounded-full mb-2 uppercase tracking-wider">
                    Your Department: Data Science
                  </span>
                  <h2 className="text-3xl font-bold text-on-primary mb-4 max-w-lg">Advanced Predictive Modeling for Strategic Policy</h2>
                  <p className="text-on-primary-container mb-6 max-w-md">Master the frameworks currently utilized by the Federal Analytics taskforce. Limited slots for Q4 cohort.</p>
                  <button className="bg-secondary-container text-on-secondary-container font-bold px-12 py-3 rounded-lg w-fit hover:brightness-95 active:scale-95 transition-all">
                    Enroll Now
                  </button>
                </div>
              </div>
            </section>

            {/* Recommended Scroll Section */}
            <section className="mt-20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-primary">Recommended For You</h3>
                <Link to="#" className="text-sm font-medium text-secondary hover:underline">View Personalized Path</Link>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6">
                {recommendedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="min-w-[320px] bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex gap-6 items-center mb-6">
                      <div className={`w-16 h-16 rounded-lg ${course.bgColor} flex items-center justify-center`}>
                        <span className={`text-3xl ${course.iconColor}`}>🧠</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-secondary uppercase tracking-wider">{course.category}</span>
                        <h4 className="text-lg font-semibold text-on-surface">{course.title}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <Clock size={18} /> {course.duration}
                      </span>
                      <span className="flex items-center gap-1 text-secondary font-bold">
                        <Star size={18} fill="currentColor" /> {course.rating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Course Grid */}
            <section className="mt-20 mb-20">
              <h3 className="text-2xl font-semibold text-primary mb-12">All Curriculum Library</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col border border-outline-variant/30"
                  >
                    <div className={`relative h-48 border-t-4 ${course.borderColor} bg-surface-container-low`}>
                      <span className="absolute top-3 right-3 bg-surface/90 backdrop-blur-md text-xs font-medium px-3 py-1 rounded-full text-primary border border-outline-variant">
                        {course.level}
                      </span>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${course.categoryColor} text-white px-3 py-0.5 rounded-full`}>
                          {course.category}
                        </span>
                        <div className="flex items-center gap-1 text-secondary font-bold text-sm">
                          <Star size={16} fill="currentColor" /> {course.rating}
                        </div>
                      </div>
                      <h4 className="text-lg font-semibold text-on-surface mb-4">{course.title}</h4>
                      <p className="text-sm text-on-surface-variant mb-6 line-clamp-2 flex-grow">{course.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="flex items-center gap-1 text-outline text-xs font-medium">
                          <Timer size={18} /> {course.duration}
                        </span>
                        <button className="text-sm font-medium text-primary hover:text-secondary transition-colors flex items-center gap-1">
                          Details <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="mt-12 flex justify-center">
                <button className="border border-outline text-primary font-medium px-12 py-3 rounded-lg hover:bg-surface-container-low transition-all active:scale-95">
                  Load More Courses
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
