import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { ArrowRight, Building2, Landmark, Search } from 'lucide-react';

export default function OnboardingRole() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sector, setSector] = useState('');
  const [experience, setExperience] = useState('');
  const [tools, setTools] = useState(['Excel', 'Jira']);
  const [newTool, setNewTool] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [formData, setFormData] = useState({
    jobTitle: '',
    organization: '',
    industry: '',
    companySize: '',
    province: '',
    department: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Prepare request data
      const profileData = {
        sector_type: sector === 'private' ? 'Private' : 'Government',
        organization_name: formData.organization || null,
        job_title: formData.jobTitle,
        years_experience: parseInt(experience.split('-')[0]) || 0,
        current_tools: tools,
        custom_department: formData.department || null,
        // Add sector-specific fields
        ...(sector === 'private' && {
          industry: formData.industry,
          company_size: formData.companySize
        }),
        ...(sector === 'gov' && {
          province: formData.province
        })
      };
      
      const response = await axios.post('/api/onboarding/profile', profileData);
      
      // Store profile ID for next steps
      localStorage.setItem('onboarding_profile_id', response.data.user_profile_id);
      
      navigate('/onboarding-tasks');
    } catch (err) {
      console.error('Profile creation error:', err);
      setError(err.response?.data?.detail || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTool = () => {
    if (newTool.trim() && !tools.includes(newTool.trim())) {
      setTools([...tools, newTool.trim()]);
      setNewTool('');
    }
  };

  const removeTool = (tool) => {
    setTools(tools.filter(t => t !== tool));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* TopNav */}
      <nav className="w-full sticky top-0 z-50 bg-surface border-b border-gray-200 flex justify-between items-center px-6 py-4">
        <span className="text-xl font-bold text-primary">SkillBridge</span>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100">❓</button>
          <div className="w-10 h-10 rounded-full bg-[#0f1f3d] flex items-center justify-center overflow-hidden">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center py-20 px-6 md:px-16">
        <div className="max-w-3xl w-full">
          {/* Progress Stepper */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold">1</div>
                <span className="text-xl font-bold text-teal-600">Your Role</span>
              </div>
              <div className="hidden md:flex flex-grow mx-6 h-[2px] bg-gray-300 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-teal-500"></div>
              </div>
              <div className="flex items-center gap-3 opacity-40">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">2</div>
                <span className="text-xl hidden md:inline">Skills</span>
              </div>
              <div className="hidden md:flex flex-grow mx-6 h-[2px] bg-gray-300 opacity-20"></div>
              <div className="flex items-center gap-3 opacity-40">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">3</div>
                <span className="text-xl hidden md:inline">Goals</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">Step 1 of 3: Defining your professional foundation</p>
          </div>

          {/* Form Section */}
          <section className="space-y-12">
            <header className="text-center md:text-left">
              <h1 className="text-4xl font-bold mb-4">Tell us about your work</h1>
              <p className="text-lg text-gray-600">We'll tailor your learning paths based on your current environment and experience.</p>
            </header>

            <form className="space-y-12" onSubmit={handleSubmit}>
              {/* Sector Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="cursor-pointer group">
                  <input
                    type="radio"
                    name="sector"
                    value="private"
                    checked={sector === 'private'}
                    onChange={(e) => setSector(e.target.value)}
                    className="hidden peer"
                  />
                  <div className="p-6 bg-white rounded-xl shadow-sm border-t-4 border-gray-200 peer-checked:border-teal-500 peer-checked:bg-teal-50 transition-all group-hover:scale-[1.02] flex flex-col items-center text-center gap-3">
                    <Building2 className="w-12 h-12 text-primary mb-2" />
                    <span className="text-xl font-semibold">Private Sector</span>
                    <p className="text-sm text-gray-600">Corporations, startups, and private entities.</p>
                  </div>
                </label>

                <label className="cursor-pointer group">
                  <input
                    type="radio"
                    name="sector"
                    value="gov"
                    checked={sector === 'gov'}
                    onChange={(e) => setSector(e.target.value)}
                    className="hidden peer"
                  />
                  <div className="p-6 bg-white rounded-xl shadow-sm border-t-4 border-gray-200 peer-checked:border-teal-500 peer-checked:bg-teal-50 transition-all group-hover:scale-[1.02] flex flex-col items-center text-center gap-3">
                    <Landmark className="w-12 h-12 text-primary mb-2" />
                    <span className="text-xl font-semibold">Government Dept</span>
                    <p className="text-sm text-gray-600">Ministries, federal agencies, and public services.</p>
                  </div>
                </label>
              </div>

              {/* Private Fields */}
              {sector === 'private' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-primary uppercase tracking-wider">Industry</label>
                    <select 
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      className="p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      <option value="">Select Industry</option>
                      <option>Technology</option>
                      <option>Finance & Banking</option>
                      <option>Healthcare</option>
                      <option>Education</option>
                      <option>Manufacturing</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-primary uppercase tracking-wider">Company Size</label>
                    <select 
                      value={formData.companySize}
                      onChange={(e) => setFormData({...formData, companySize: e.target.value})}
                      className="p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      <option value="">Select Size</option>
                      <option>1-10 employees</option>
                      <option>11-50 employees</option>
                      <option>51-200 employees</option>
                      <option>201-500 employees</option>
                      <option>500+ employees</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Government Fields */}
              {sector === 'gov' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-primary uppercase tracking-wider">Province</label>
                    <select 
                      value={formData.province}
                      onChange={(e) => setFormData({...formData, province: e.target.value})}
                      className="p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      <option value="">Select Province</option>
                      <option>Punjab</option>
                      <option>Sindh</option>
                      <option>Khyber Pakhtunkhwa</option>
                      <option>Balochistan</option>
                      <option>Gilgit-Baltistan</option>
                      <option>ICT</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-primary uppercase tracking-wider">Department</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full p-3 pr-12 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Search (e.g. FIA, IB, NADRA)"
                        required
                      />
                      <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Job Title */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-primary uppercase tracking-wider">Job Title</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                  className="p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>

              {/* Organization Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-primary uppercase tracking-wider">Organization Name</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({...formData, organization: e.target.value})}
                  className="p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g. Tech Corp"
                  required
                />
              </div>

              {/* Years of Experience */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-primary uppercase tracking-wider">Years of Experience</label>
                <div className="flex flex-wrap gap-2">
                  {['0-1', '1-3', '3-5', '5-10', '10+'].map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setExperience(range)}
                      className={`px-6 py-3 rounded-lg border transition-all flex-grow ${
                        experience === range
                          ? 'bg-teal-100 text-teal-700 border-teal-500 font-bold'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Tools */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-primary uppercase tracking-wider">Current Tools & Software</label>
                <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-teal-500 min-h-[48px]">
                  {tools.map((tool) => (
                    <span key={tool} className="bg-teal-100 text-teal-700 flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium">
                      {tool}
                      <button type="button" onClick={() => removeTool(tool)} className="hover:text-red-600">
                        ✕
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                    className="flex-grow border-none focus:ring-0 py-1 px-2 bg-transparent"
                    placeholder="Add tool..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-12 flex justify-center">
                <button
                  type="submit"
                  disabled={loading || !sector || !experience}
                  className="w-full md:w-auto px-20 py-4 bg-primary text-white rounded-lg text-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Continue'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-primary text-white mt-20 py-12 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <span className="text-2xl font-bold block mb-4">SkillBridge</span>
            <p className="text-sm opacity-80">Empowering professionals with AI-driven training and modern career pivots.</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-widest text-teal-400">Company</span>
            <a href="#" className="text-sm opacity-70 hover:text-teal-400">About</a>
            <a href="#" className="text-sm opacity-70 hover:text-teal-400">Contact Support</a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-widest text-teal-400">Legal</span>
            <a href="#" className="text-sm opacity-70 hover:text-teal-400">Privacy Policy</a>
            <a href="#" className="text-sm opacity-70 hover:text-teal-400">Terms of Service</a>
          </div>
          <div>
            <p className="text-sm opacity-60">© 2024 SkillBridge AI Training. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
