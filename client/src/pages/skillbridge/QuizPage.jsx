import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Sparkles, Award } from 'lucide-react';
import SideNav from './components/SideNav';
import TopNav from './components/TopNav';
import axios from 'axios';

export default function QuizPage() {
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (lessonId) {
      fetchQuiz();
    }
  }, [lessonId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/quizzes/lesson/${lessonId}`);
      setQuiz(response.data.quiz);
      setQuestions(response.data.questions);
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setLoading(false);
      
      if (err.response?.status === 403 || err.response?.status === 401) {
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Session expired. Please login again.' }
          });
        }, 100);
      } else if (err.response?.status === 404) {
        setTimeout(() => {
          navigate('/dashboard', {
            state: { error: 'Quiz not found for this module.' }
          });
        }, 100);
      } else {
        setTimeout(() => {
          navigate('/dashboard', {
            state: { error: 'Failed to load quiz. Please try again.' }
          });
        }, 100);
      }
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      alert(`Please answer all questions. ${unanswered.length} question(s) remaining.`);
      return;
    }

    try {
      setSubmitting(true);
      const submission = {
        answers: questions.map(q => ({
          question_id: q.id,
          selected_answer: answers[q.id]
        }))
      };
      
      const response = await axios.post(`/api/quizzes/${quiz.id}/submit`, submission);
      setResults(response.data);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Session expired. Please login again.' }
          });
        }, 100);
      }
      // Fail silently for other errors
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <SideNav activePage="courses" />
        <div className="flex-1 flex flex-col md:ml-64">
          <TopNav />
          <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading quiz...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <SideNav activePage="courses" />
        <div className="flex-1 flex flex-col md:ml-64">
          <TopNav />
          <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Quiz not found</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-teal-600 hover:underline"
              >
                Return to Dashboard
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show results screen
  if (results) {
    return (
      <div className="flex h-screen bg-gray-50">
        <SideNav activePage="courses" />
        <div className="flex-1 flex flex-col md:ml-64">
          <TopNav />
          <main className="flex-grow overflow-y-auto px-4 md:px-16 py-12 flex flex-col items-center">
            <div className="w-full max-w-3xl">
              {/* Results Header */}
              <div className={`text-center mb-12 p-12 rounded-2xl ${
                results.passed 
                  ? 'bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200' 
                  : 'bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200'
              }`}>
                {results.passed ? (
                  <Award className="w-20 h-20 text-green-600 mx-auto mb-4" />
                ) : (
                  <XCircle className="w-20 h-20 text-orange-600 mx-auto mb-4" />
                )}
                <h1 className="text-4xl font-bold mb-4">
                  {results.passed ? '🎉 Congratulations!' : '📚 Keep Learning'}
                </h1>
                <p className="text-xl text-gray-700 mb-6">
                  You scored <span className="font-bold text-2xl">{results.percentage}%</span>
                </p>
                <p className="text-gray-600">
                  {results.score} out of {results.total_questions} questions correct
                </p>
                {results.passed ? (
                  <p className="text-green-700 font-semibold mt-4">
                    ✅ You passed! (Required: {results.passing_score}%)
                  </p>
                ) : (
                  <p className="text-orange-700 font-semibold mt-4">
                    You need {results.passing_score}% to pass. Try again!
                  </p>
                )}
              </div>

              {/* Detailed Results */}
              <div className="space-y-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Review Your Answers</h2>
                {questions.map((question, idx) => {
                  const result = results.results.find(r => r.question_id === question.id);
                  const isCorrect = result?.is_correct;

                  return (
                    <div key={question.id} className={`bg-white p-6 rounded-xl border-2 ${
                      isCorrect ? 'border-green-200' : 'border-red-200'
                    }`}>
                      <div className="flex items-start gap-4 mb-4">
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-2">Question {idx + 1}</p>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">{question.text}</h3>
                          
                          <div className="space-y-2">
                            {question.options.map((option, optIdx) => {
                              const optionLetter = String.fromCharCode(65 + optIdx);
                              const isSelected = result?.selected_answer === optionLetter;
                              const isCorrectAnswer = result?.correct_answer === optionLetter;

                              return (
                                <div
                                  key={optIdx}
                                  className={`p-3 rounded-lg border-2 ${
                                    isCorrectAnswer
                                      ? 'border-green-500 bg-green-50'
                                      : isSelected
                                      ? 'border-red-500 bg-red-50'
                                      : 'border-gray-200 bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                      isCorrectAnswer
                                        ? 'bg-green-500 text-white'
                                        : isSelected
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-300 text-gray-700'
                                    }`}>
                                      {optionLetter}
                                    </span>
                                    <span className="flex-1">{option}</span>
                                    {isCorrectAnswer && (
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                    )}
                                    {isSelected && !isCorrectAnswer && (
                                      <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                {results.passed ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-teal-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-600"
                  >
                    Continue to Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setResults(null);
                        setAnswers({});
                        setCurrentQuestionIndex(0);
                      }}
                      className="bg-teal-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-600"
                    >
                      Retake Quiz
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50"
                    >
                      Back to Dashboard
                    </button>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestion.id];
  const progressPercentage = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNav activePage="courses" />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <TopNav />
        
        <main className="flex-grow overflow-y-auto px-4 md:px-16 py-12 flex flex-col items-center">
          {/* Header Section */}
          <div className="w-full max-w-2xl text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-2 block">Knowledge Check</span>
            <h1 className="text-3xl font-bold text-primary mb-2">{quiz.title}</h1>
            <p className="text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          {/* Progress Container */}
          <div className="w-full max-w-2xl mb-12">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-gray-600">
                {answeredCount} of {questions.length} answered
              </span>
              <span className="text-sm font-bold text-teal-600">{progressPercentage}% Complete</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500 transition-all duration-300" 
                style={{width: `${progressPercentage}%`}}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-md border-t-4 border-teal-500 mb-6">
            <h2 className="text-2xl font-semibold text-primary mb-8">
              {currentQuestion.text}
            </h2>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const optionLetter = String.fromCharCode(65 + idx);
                const isSelected = selectedAnswer === optionLetter;

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(currentQuestion.id, optionLetter)}
                    className={`w-full text-left p-4 rounded-xl flex items-center gap-4 group transition-all ${
                      isSelected
                        ? 'border-2 border-teal-500 bg-teal-50'
                        : 'border-2 border-gray-200 hover:bg-gray-50 hover:border-teal-300'
                    }`}
                  >
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                      isSelected
                        ? 'bg-teal-500 text-white'
                        : 'border-2 border-gray-300 text-gray-600 group-hover:border-teal-500 group-hover:text-teal-600'
                    }`}>
                      {optionLetter}
                    </span>
                    <span className={`flex-1 ${isSelected ? 'text-primary font-medium' : 'text-gray-700'}`}>
                      {option}
                    </span>
                    {isSelected && (
                      <CheckCircle className="text-teal-500" size={20} fill="currentColor" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Motivational Message */}
          {answeredCount > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-teal-500" size={20} />
              <p className="text-sm font-bold text-teal-600">
                {answeredCount === questions.length 
                  ? "All questions answered! Ready to submit?" 
                  : `Great progress! ${questions.length - answeredCount} more to go.`}
              </p>
            </div>
          )}
          
          {/* Navigation */}
          <div className="flex w-full max-w-2xl justify-between items-center mt-4">
            <button 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={20} />
              Previous
            </button>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <button 
                onClick={handleSubmit}
                disabled={submitting || answeredCount < questions.length}
                className="bg-teal-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-600 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Quiz
                    <CheckCircle size={20} />
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
              >
                Next Question
                <ArrowRight size={20} />
              </button>
            )}
          </div>

          {/* Passing Score Info */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Passing score: <span className="font-bold text-teal-600">{quiz.passing_score}%</span></p>
          </div>
        </main>
      </div>
    </div>
  );
}
