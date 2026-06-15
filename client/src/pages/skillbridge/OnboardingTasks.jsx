import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, Plus, ArrowRight, X, Edit2, Save } from 'lucide-react';

export default function OnboardingTasks() {
  const navigate = useNavigate();
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  // Add custom task states
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    category: '',
    task_name: '',
    task_description: '',
    frequency: 'weekly',
    complexity: 'medium'
  });
  
  // Edit task states
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState(null);
  
  const profileId = localStorage.getItem('onboarding_profile_id');

  useEffect(() => {
    if (!profileId) {
      navigate('/onboarding-role');
      return;
    }
    
    fetchTasks();
  }, [profileId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/onboarding/tasks/generate', {
        user_profile_id: parseInt(profileId)
      });
      
      setTasks(response.data.tasks);
      setMatchPercentage(response.data.match_percentage);
      
      // Auto-select all tasks initially
      const allTaskIds = [];
      Object.values(response.data.tasks).forEach(category => {
        category.forEach(task => allTaskIds.push(task.id));
      });
      setSelectedTasks(allTaskIds);
      
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.detail || 'Failed to generate tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    try {
      setSubmitting(true);
      
      // Separate custom tasks (with string IDs) from regular tasks
      const regularTasks = selectedTasks.filter(id => typeof id === 'number');
      const customTaskIds = selectedTasks.filter(id => typeof id === 'string');
      
      // Get custom task objects
      const customTasksToSend = [];
      Object.values(tasks).forEach(categoryTasks => {
        categoryTasks.forEach(task => {
          if (customTaskIds.includes(task.id)) {
            customTasksToSend.push({
              category: task.category,
              task_name: task.task_name,
              task_description: task.task_description,
              frequency: task.frequency,
              complexity: task.complexity,
              estimated_hours: task.estimated_hours || 4
            });
          }
        });
      });
      
      await axios.post('/api/onboarding/tasks/confirm', {
        user_profile_id: parseInt(profileId),
        selected_task_ids: regularTasks,
        custom_tasks: customTasksToSend
      });
      
      navigate('/onboarding-tools');
    } catch (err) {
      console.error('Error confirming tasks:', err);
      setError(err.response?.data?.detail || 'Failed to save tasks');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTask = (id) => {
    setSelectedTasks(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const deleteTask = (taskId, category) => {
    // Remove from tasks state
    setTasks(prev => {
      const updated = { ...prev };
      updated[category] = updated[category].filter(t => t.id !== taskId);
      // Remove category if empty
      if (updated[category].length === 0) {
        delete updated[category];
      }
      return updated;
    });
    
    // Remove from selected
    setSelectedTasks(prev => prev.filter(id => id !== taskId));
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditedTask({ ...task });
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditedTask(null);
  };

  const saveEdit = (category) => {
    if (!editedTask) return;
    
    setTasks(prev => {
      const updated = { ...prev };
      updated[category] = updated[category].map(t => 
        t.id === editedTask.id ? editedTask : t
      );
      return updated;
    });
    
    setEditingTaskId(null);
    setEditedTask(null);
  };

  const addCustomTask = () => {
    if (!newTask.category || !newTask.task_name || !newTask.task_description) {
      setError('Please fill all fields for the custom task');
      return;
    }
    
    // Create temporary ID for custom task
    const tempId = `custom_${Date.now()}`;
    const customTask = {
      ...newTask,
      id: tempId,
      estimated_hours: 4
    };
    
    // Add to tasks
    setTasks(prev => {
      const updated = { ...prev };
      if (!updated[newTask.category]) {
        updated[newTask.category] = [];
      }
      updated[newTask.category].push(customTask);
      return updated;
    });
    
    // Auto-select the new task
    setSelectedTasks(prev => [...prev, tempId]);
    
    // Reset form
    setNewTask({
      category: '',
      task_name: '',
      task_description: '',
      frequency: 'weekly',
      complexity: 'medium'
    });
    setShowAddTask(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your personalized tasks...</p>
        </div>
      </div>
    );
  }

  const handleContinueClick = () => {
    handleContinue();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* TopNav */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <span className="text-xl font-bold text-primary">SkillBridge</span>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">🔔</button>
            <button className="p-2 hover:bg-gray-100 rounded-full">❓</button>
            <div className="w-10 h-10 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-16 py-12">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-20">
          <div className="flex items-center w-full max-w-3xl">
            <div className="flex flex-col items-center gap-2 flex-1 opacity-50">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-xs uppercase font-semibold">Role</span>
            </div>
            <div className="h-1 bg-gray-300 flex-1 mb-8"></div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white ring-4 ring-teal-100 font-semibold">2</div>
              <span className="text-xs uppercase font-semibold text-teal-600">Review Tasks</span>
            </div>
            <div className="h-1 bg-gray-300 flex-1 mb-8"></div>
            <div className="flex flex-col items-center gap-2 flex-1 opacity-50">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">3</div>
              <span className="text-xs uppercase">Your Plan</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-4xl font-bold">Here's what we think you do at work</h1>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              ✨ AI-generated
            </span>
          </div>
          <p className="text-lg text-gray-600">Review this list. Tick the tasks that match your job. Add any we missed.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column */}
          <div className="w-full lg:w-[65%] space-y-12">
            {/* Render Categories Dynamically */}
            {Object.entries(tasks).map(([category, categoryTasks]) => (
              <section key={category}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">
                    {category.toLowerCase().includes('report') ? '📊' : 
                     category.toLowerCase().includes('communic') ? '💬' : '📝'}
                  </span>
                  <h2 className="text-2xl font-bold">{category}</h2>
                </div>
                <div className="grid gap-4">
                  {categoryTasks.map(task => (
                    <div key={task.id}>
                      {editingTaskId === task.id ? (
                        // Edit Mode
                        <div className="bg-white p-6 rounded-xl border-2 border-teal-500 space-y-4">
                          <input
                            type="text"
                            value={editedTask.task_name}
                            onChange={(e) => setEditedTask({...editedTask, task_name: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg font-bold text-lg"
                            placeholder="Task name"
                          />
                          <textarea
                            value={editedTask.task_description}
                            onChange={(e) => setEditedTask({...editedTask, task_description: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            rows="3"
                            placeholder="Task description"
                          />
                          <div className="flex gap-4">
                            <select
                              value={editedTask.frequency}
                              onChange={(e) => setEditedTask({...editedTask, frequency: e.target.value})}
                              className="p-2 border border-gray-300 rounded-lg"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                            <select
                              value={editedTask.complexity}
                              onChange={(e) => setEditedTask({...editedTask, complexity: e.target.value})}
                              className="p-2 border border-gray-300 rounded-lg"
                            >
                              <option value="low">Low Complexity</option>
                              <option value="medium">Medium Complexity</option>
                              <option value="high">High Complexity</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(category)}
                              className="px-4 py-2 bg-teal-500 text-white rounded-lg flex items-center gap-2 hover:bg-teal-600"
                            >
                              <Save className="w-4 h-4" /> Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <label className="group cursor-pointer relative">
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(task.id)}
                            onChange={() => toggleTask(task.id)}
                            className="hidden peer"
                          />
                          <div className={`bg-white p-6 rounded-xl border transition-all flex items-start gap-4 ${
                            selectedTasks.includes(task.id)
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-teal-300'
                          }`}>
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedTasks.includes(task.id) ? 'bg-teal-500 border-teal-500' : 'border-gray-400'
                            }`}>
                              {selectedTasks.includes(task.id) && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{task.task_name}</h3>
                                <div className="flex items-center gap-2">
                                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                                    {task.frequency}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      startEditTask(task);
                                    }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit task"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      deleteTask(task.id, category);
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete task"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-gray-600">{task.task_description}</p>
                            </div>
                          </div>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Add Task Button */}
            <div className="space-y-4">
              {!showAddTask ? (
                <button 
                  onClick={() => setShowAddTask(true)}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-3 text-gray-600 hover:bg-gray-50 hover:border-teal-400 hover:text-teal-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-semibold">Add a custom task we missed</span>
                </button>
              ) : (
                <div className="bg-white p-6 rounded-xl border-2 border-teal-500 space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-primary">Add Custom Task</h3>
                    <button
                      onClick={() => {
                        setShowAddTask(false);
                        setNewTask({
                          category: '',
                          task_name: '',
                          task_description: '',
                          frequency: 'weekly',
                          complexity: 'medium'
                        });
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Category</label>
                    <input
                      type="text"
                      value={newTask.category}
                      onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="e.g., Administration, Project Management"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Task Name</label>
                    <input
                      type="text"
                      value={newTask.task_name}
                      onChange={(e) => setNewTask({...newTask, task_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Brief task title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea
                      value={newTask.task_description}
                      onChange={(e) => setNewTask({...newTask, task_description: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows="3"
                      placeholder="Describe what this task involves..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Frequency</label>
                      <select
                        value={newTask.frequency}
                        onChange={(e) => setNewTask({...newTask, frequency: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">Complexity</label>
                      <select
                        value={newTask.complexity}
                        onChange={(e) => setNewTask({...newTask, complexity: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={addCustomTask}
                    className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition-all"
                  >
                    Add Task
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sticky Summary */}
          <aside className="w-full lg:w-[35%]">
            <div className="sticky top-24 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-primary">Your Work Profile</h3>

              {/* Progress Circle */}
              <div className="flex items-center justify-center py-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="#e5e7eb" strokeWidth="8"></circle>
                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="#06b6d4" strokeWidth="8" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * matchPercentage / 100)}></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{Math.round(matchPercentage)}%</span>
                    <span className="text-xs text-gray-600 uppercase">Matched</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span className="text-sm">Tasks selected</span>
                  </div>
                  <span className="font-bold">{selectedTasks.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>📂</span>
                    <span className="text-sm">Categories covered</span>
                  </div>
                  <span className="font-bold">{Object.keys(tasks).length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>⏱️</span>
                    <span className="text-sm">Estimated focus</span>
                  </div>
                  <span className="font-bold">{selectedTasks.length * 3-4} hrs/wk</span>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  We'll use these tasks to prioritize your skill gaps and recommend the most relevant modules.
                </p>
                <button
                  onClick={handleContinueClick}
                  disabled={submitting || selectedTasks.length === 0}
                  className="w-full bg-primary text-white py-3 px-6 rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : 'Build My Learning Plan'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white mt-20 py-12">
        <div className="max-w-7xl mx-auto px-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <span className="text-2xl font-bold block mb-4">SkillBridge</span>
            <p className="text-sm opacity-80">Empowering career growth through AI-tailored learning pathways.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 uppercase">Product</h4>
            <div className="space-y-2 text-sm opacity-70">
              <a href="#" className="block hover:text-teal-400">Career Tracks</a>
              <a href="#" className="block hover:text-teal-400">Skill Assessments</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 uppercase">Company</h4>
            <div className="space-y-2 text-sm opacity-70">
              <a href="#" className="block hover:text-teal-400">About Us</a>
              <a href="#" className="block hover:text-teal-400">Privacy Policy</a>
            </div>
          </div>
          <div>
            <p className="text-sm opacity-60">© 2024 SkillBridge AI Training. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
