import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import SideNav from './components/SideNav';
import TopNav from './components/TopNav';
import { Play, CheckCircle, Lock, ChevronRight, ChevronLeft, Award, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function CourseModule() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentModuleId, setCurrentModuleId] = useState(null);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizGenerated, setQuizGenerated] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  useEffect(() => {
    // Set initial module from URL or first module
    if (course?.modules?.length > 0) {
      const moduleParam = searchParams.get('module');
      if (moduleParam) {
        const module = course.modules.find(m => m.id === parseInt(moduleParam));
        if (module && module.lessons?.length > 0) {
          setCurrentModuleId(module.id);
          setCurrentLessonId(module.lessons[0].id);
          return;
        }
      }
      
      // Default: find first incomplete lesson or first lesson
      for (const module of course.modules) {
        if (!module.lessons || module.lessons.length === 0) continue;
        
        const incompleteLesson = module.lessons.find(l => !l.is_completed);
        if (incompleteLesson) {
          setCurrentModuleId(module.id);
          setCurrentLessonId(incompleteLesson.id);
          return;
        }
      }
      
      // If all complete, show first module/lesson
      const firstModuleWithLessons = course.modules.find(m => m.lessons?.length > 0);
      if (firstModuleWithLessons) {
        setCurrentModuleId(firstModuleWithLessons.id);
        setCurrentLessonId(firstModuleWithLessons.lessons[0].id);
      }
    }
  }, [course, searchParams]);

  // Generate quiz when lesson loads (background task)
  useEffect(() => {
    if (!course || !currentModuleId || !currentLessonId) return;
    
    const currentModule = course.modules?.find(m => m.id === currentModuleId);
    const currentLesson = currentModule?.lessons?.find(l => l.id === currentLessonId);
    
    if (currentLesson && currentLesson.type === 'video' && !quizGenerated) {
      // Delay quiz generation by 5 seconds so user starts watching first
      const timer = setTimeout(() => {
        generateQuizForCurrentLesson();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [currentLessonId, course, quizGenerated]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${courseId}`);
      setCourse(response.data);
    } catch (err) {
      console.error('Error fetching course:', err);
      setLoading(false); // Set loading false immediately
      
      // Handle 403/401 - redirect to login
      if (err.response?.status === 403 || err.response?.status === 401) {
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Session expired. Please login again.' }
          });
        }, 100);
      } else if (err.response?.status === 404) {
        // Course not found - set course to null to trigger "not found" UI
        setCourse(null);
      } else {
        // Other errors
        setTimeout(() => {
          navigate('/dashboard', {
            state: { error: 'Failed to load course. Please try again.' }
          });
        }, 100);
      }
      return; // Exit early
    } finally {
      setLoading(false);
    }
  };

  const generateQuizForCurrentLesson = async () => {
    if (!currentLessonId || generatingQuiz || quizGenerated) return;
    
    try {
      setGeneratingQuiz(true);
      const response = await axios.post(`/api/quizzes/generate/lesson/${currentLessonId}`);
      
      if (response.data.success) {
        setQuizGenerated(true);
        console.log(`Quiz generated: ${response.data.quiz_title} (${response.data.cached ? 'cached' : 'new'})`);
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      // Fail silently - quiz is optional
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const markLessonComplete = async () => {
    if (!currentModuleId || !currentLessonId || markingComplete) return;
    
    try {
      setMarkingComplete(true);
      await axios.post(
        `/api/courses/${courseId}/modules/${currentModuleId}/lessons/${currentLessonId}/complete`
      );
      
      // Refresh course data
      await fetchCourseDetails();
    } catch (err) {
      console.error('Error marking lesson complete:', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Session expired. Please login again.' }
          });
        }, 100);
      }
      // Don't show error for other cases, just fail silently
    } finally {
      setMarkingComplete(false);
    }
  };

  const goToNextLesson = async () => {
    if (!course || !currentModuleId || !currentLessonId) return;

    // Mark current as complete if not already
    const currentModule = course.modules.find(m => m.id === currentModuleId);
    const currentLesson = currentModule?.lessons?.find(l => l.id === currentLessonId);
    
    if (currentLesson && !currentLesson.is_completed) {
      await markLessonComplete();
    }

    // Find next lesson
    const currentModuleIndex = course.modules.findIndex(m => m.id === currentModuleId);
    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLessonId);

    if (currentLessonIndex < currentModule.lessons.length - 1) {
      // Next lesson in same module
      setCurrentLessonId(currentModule.lessons[currentLessonIndex + 1].id);
    } else if (currentModuleIndex < course.modules.length - 1) {
      // First lesson of next module
      const nextModule = course.modules[currentModuleIndex + 1];
      setCurrentModuleId(nextModule.id);
      if (nextModule.lessons?.length > 0) {
        setCurrentLessonId(nextModule.lessons[0].id);
      }
    }
  };

  const goToPreviousLesson = () => {
    if (!course || !currentModuleId || !currentLessonId) return;

    const currentModuleIndex = course.modules.findIndex(m => m.id === currentModuleId);
    const currentModule = course.modules[currentModuleIndex];
    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLessonId);

    if (currentLessonIndex > 0) {
      // Previous lesson in same module
      setCurrentLessonId(currentModule.lessons[currentLessonIndex - 1].id);
    } else if (currentModuleIndex > 0) {
      // Last lesson of previous module
      const prevModule = course.modules[currentModuleIndex - 1];
      setCurrentModuleId(prevModule.id);
      if (prevModule.lessons?.length > 0) {
        setCurrentLessonId(prevModule.lessons[prevModule.lessons.length - 1].id);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SideNav activePage="courses" />
        <main className="flex-1 md:ml-64">
          <TopNav />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading course...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SideNav activePage="courses" />
        <main className="flex-1 md:ml-64">
          <TopNav />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Course not found</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-teal-600 hover:underline"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentModule = course.modules.find(m => m.id === currentModuleId);
  const currentLesson = currentModule?.lessons?.find(l => l.id === currentLessonId);
  
  // If no current module/lesson set yet, show loading
  if (!currentModule || !currentLesson) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SideNav activePage="courses" />
        <main className="flex-1 md:ml-64">
          <TopNav />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading lesson...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Check if this is the last lesson
  const currentModuleIndex = course.modules.findIndex(m => m.id === currentModuleId);
  const currentLessonIndex = currentModule?.lessons?.findIndex(l => l.id === currentLessonId) ?? -1;
  const isLastLesson = 
    currentModuleIndex === course.modules.length - 1 &&
    currentLessonIndex === (currentModule?.lessons?.length ?? 0) - 1;

  const isFirstLesson = currentModuleIndex === 0 && currentLessonIndex === 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav activePage="courses" />

      <main className="flex-1 md:ml-64">
        <TopNav />

        <div className="flex flex-col lg:flex-row">
          {/* Video/Content Area */}
          <div className="flex-1 p-6 md:p-8 lg:p-12">
            <div className="max-w-5xl mx-auto">
              {/* Course Header */}
              <div className="mb-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-600 hover:text-teal-600 mb-4 flex items-center gap-2"
                >
                  ← Back to Dashboard
                </button>
                <h2 className="text-2xl font-bold text-primary">{course.course.title}</h2>
              </div>

              {/* Video Player or Quiz */}
              {currentLesson?.type === 'quiz' ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl overflow-hidden mb-6 p-12 text-center border-2 border-blue-200">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">✅</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Module Complete!</h3>
                    <p className="text-gray-600 mb-6">
                      You've finished all lessons for {currentModule?.tool_name}.
                    </p>
                    <p className="text-sm text-gray-500">
                      Quiz feature coming soon. Click next to continue to the next module.
                    </p>
                  </div>
                </div>
              ) : currentLesson?.video_data?.embed_url ? (
                <div className="bg-black rounded-xl overflow-hidden mb-6 aspect-video">
                  <iframe
                    src={currentLesson.video_data.embed_url}
                    title={currentLesson.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-xl overflow-hidden mb-6 aspect-video flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="opacity-70">No video available</p>
                  </div>
                </div>
              )}

              {/* Lesson Info */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
                    Module {currentModule?.order} - {currentModule?.tool_name}
                  </span>
                  <span className="text-gray-600">
                    Lesson {currentLessonIndex + 1} of {currentModule?.lessons?.length || 0}
                  </span>
                  {currentLesson?.is_completed && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </span>
                  )}
                  {generatingQuiz && (
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-700"></div>
                      Generating Quiz...
                    </span>
                  )}
                  {quizGenerated && !generatingQuiz && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      ✅ Quiz Ready
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-primary mb-4">{currentLesson?.title}</h1>
                
                {currentLesson?.video_data && (
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>📺 {currentLesson.video_data.channel_title}</span>
                    <span>⏱️ {Math.floor(currentLesson.video_data.duration / 60)} min</span>
                    {currentLesson.video_data.view_count && (
                      <span>👁️ {parseInt(currentLesson.video_data.view_count).toLocaleString()} views</span>
                    )}
                  </div>
                )}

                {currentLesson?.video_data?.description && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-sm mb-2">About this video</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                      {currentLesson.video_data.description}
                    </p>
                  </div>
                )}
                
                {/* Quiz Button - Show after video */}
                {quizGenerated && currentLesson?.type === 'video' && (
                  <div className="mt-4">
                    <button
                      onClick={() => navigate(`/quiz/lesson/${currentLessonId}`)}
                      className="bg-purple-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-600 inline-flex items-center gap-2"
                    >
                      📝 Take Quiz on This Video
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Test your understanding of this lesson</p>
                  </div>
                )}
              </div>

              {/* Module Description */}
              {currentModule?.tool_description && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3">About {currentModule.tool_name}</h2>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-gray-700">{currentModule.tool_description}</p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between mt-12 pb-8">
                <button
                  onClick={goToPreviousLesson}
                  disabled={isFirstLesson}
                  className={`px-6 py-3 border-2 rounded-lg font-semibold flex items-center gap-2 justify-center ${
                    isFirstLesson
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous Lesson
                </button>

                <div className="flex gap-3">
                  {!currentLesson?.is_completed && (
                    <button
                      onClick={markLessonComplete}
                      disabled={markingComplete}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 flex items-center gap-2 justify-center disabled:opacity-50"
                    >
                      {markingComplete ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Marking...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Mark Complete
                        </>
                      )}
                    </button>
                  )}

                  {isLastLesson ? (
                    <button
                      onClick={async () => {
                        try {
                          await axios.post('/api/certificates/issue', { course_id: parseInt(courseId) });
                          navigate('/certificate');
                        } catch (err) {
                          console.error('Error claiming certificate', err);
                          navigate('/certificate');
                        }
                      }}
                      className="px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 flex items-center gap-2 justify-center"
                    >
                      <Award className="w-5 h-5" />
                      Finish & Claim Certificate
                    </button>
                  ) : (
                    <button
                      onClick={goToNextLesson}
                      className="px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 flex items-center gap-2 justify-center"
                    >
                      Next Lesson
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Module & Lesson List */}
          <aside className="w-full lg:w-96 bg-white border-t lg:border-l lg:border-t-0 border-gray-200 overflow-y-auto max-h-screen">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <h3 className="font-bold text-lg">Course Content</h3>
              <p className="text-sm text-gray-600 mt-1">
                {course.modules.length} modules • {course.course.estimated_hours}h total
              </p>
            </div>

            <div className="p-4">
              {course.modules.map((module, moduleIdx) => {
                const moduleProgress = module.total_lessons > 0
                  ? Math.round((module.completed_lessons / module.total_lessons) * 100)
                  : 0;
                
                const isCurrentModule = module.id === currentModuleId;
                const isModuleLocked = moduleIdx > 0 && !course.modules[moduleIdx - 1].is_completed;

                return (
                  <div key={module.id} className="mb-6">
                    {/* Module Header */}
                    <div className={`p-3 rounded-lg mb-2 ${
                      isCurrentModule ? 'bg-teal-50 border-2 border-teal-500' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-600">
                          MODULE {module.order}
                        </span>
                        {isModuleLocked ? (
                          <Lock className="w-4 h-4 text-gray-400" />
                        ) : module.is_completed ? (
                          <CheckCircle className="w-4 h-4 text-teal-500" />
                        ) : null}
                      </div>
                      <h4 className="font-bold text-sm mb-1">{module.title}</h4>
                      <p className="text-xs text-gray-600">
                        {module.total_lessons} lessons • {module.estimated_minutes}m
                      </p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-teal-500 h-full rounded-full transition-all"
                            style={{ width: `${moduleProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Lessons List */}
                    <div className="space-y-1 ml-2">
                      {module.lessons.map((lesson, lessonIdx) => {
                        const isCurrentLesson = lesson.id === currentLessonId;
                        const isLessonLocked = isModuleLocked || (lessonIdx > 0 && !module.lessons[lessonIdx - 1].is_completed);

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              if (!isLessonLocked) {
                                setCurrentModuleId(module.id);
                                setCurrentLessonId(lesson.id);
                              }
                            }}
                            disabled={isLessonLocked}
                            className={`w-full text-left p-3 rounded-lg transition-all ${
                              isCurrentLesson
                                ? 'bg-teal-100 border-2 border-teal-500 shadow-sm'
                                : lesson.is_completed
                                ? 'bg-gray-50 hover:bg-gray-100'
                                : isLessonLocked
                                ? 'bg-gray-50 opacity-50 cursor-not-allowed'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {lesson.is_completed ? (
                                  <CheckCircle className="w-5 h-5 text-teal-500" />
                                ) : isLessonLocked ? (
                                  <Lock className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <div className={`w-5 h-5 rounded-full border-2 ${
                                    isCurrentLesson ? 'border-teal-500' : 'border-gray-300'
                                  }`}></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm mb-0.5 truncate">
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {lesson.video_data?.duration 
                                    ? `${Math.floor(lesson.video_data.duration / 60)} min`
                                    : 'Video lesson'
                                  }
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
