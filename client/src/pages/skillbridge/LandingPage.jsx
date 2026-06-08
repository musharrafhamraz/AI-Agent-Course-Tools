import { Link } from 'react-router-dom';

export default function LandingPage() {
  const departments = [
    { name: 'Marketing', icon: '📢', description: 'Master AI Copywriting & Growth Analytics.', sample: 'Prompt Engineering for SEO' },
    { name: 'HR', icon: '👥', description: 'AI-driven Talent Acquisition & Culture.', sample: 'Sentiment Analysis in Reviews' },
    { name: 'Finance', icon: '💰', description: 'Predictive Modeling & Fraud Detection AI.', sample: 'Auto-Tax reconciliation' },
    { name: 'FIA', icon: '🔒', description: 'Advanced Cyber-Security & Forensic AI.', sample: 'Deepfake Detection Patterns' },
    { name: 'NADRA', icon: '🪪', description: 'Biometric Systems & Data Integrity.', sample: 'Large Scale Identity Matching' },
    { name: 'IB', icon: '🛡️', description: 'Strategic Intelligence & Threat Assessment.', sample: 'Predictive Signal Intelligence' },
    { name: 'Power & Works', icon: '⚡', description: 'Smart Grid Management & Maintenance.', sample: 'AI-based Load Balancing' },
  ];

  return (
    <div className="bg-background text-on-surface scroll-smooth">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 md:px-16 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">SkillBridge</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a className="text-secondary border-b-2 border-secondary hover:text-secondary transition-colors" href="#about">About</a>
            <Link className="text-on-surface-variant hover:text-secondary transition-colors" to="/pricing">Pricing</Link>
            <a className="text-on-surface-variant hover:text-secondary transition-colors" href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-6 py-2 text-primary transition-all scale-95 active:scale-90">Log In</Link>
            <Link to="/signup" className="bg-secondary text-on-secondary px-6 py-2 rounded-lg hover:opacity-90 transition-all scale-95 active:scale-90 shadow-sm">Get Started</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-8 md:px-16 grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-6">
              <span className="inline-block bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">TRANSFORM YOUR CAREER</span>
              <h1 className="text-4xl md:text-5xl font-bold text-primary max-w-lg leading-tight">Learn AI tools built for your exact job.</h1>
              <p className="text-lg text-on-surface-variant max-w-md">Personalised skills roadmaps for professionals and government departments. Stay ahead of the curve with AI-driven curriculum.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/signup" className="bg-secondary text-on-secondary px-12 py-4 rounded-lg text-lg font-semibold transition-transform hover:scale-105">Get Started Free</Link>
                <button className="border-2 border-primary text-primary px-12 py-4 rounded-lg text-lg font-semibold transition-transform hover:bg-primary/5">See How It Works</button>
              </div>
            </div>
            <div className="relative flex justify-center items-center">
              <div className="absolute -z-10 w-[140%] h-[140%] bg-gradient-to-br from-secondary-container/30 to-surface-container-highest/50 rounded-full blur-3xl"></div>
              <div className="relative w-full aspect-square max-w-md">
                <img className="w-full h-full object-cover rounded-3xl shadow-2xl rotate-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWMda-FgU5c0ncbV5daI7IyYhToX9tGROitkFfS02BlSy6jWwZyUIls30wvarUFQCIzriBzFPOhQ-JqjzVZ3t3Sla90Wj-vv40LYwwr4wZUj1HwAS8nnuVqzU7PyeWYwAfRx9f6yN-hQqX2kwKrYcoQgEWuNgT5YIN1CJjhFzytOEtMJS-iPMx7hwAYsPedHUpeqUESw_RwKg4EBslzXlS6OeLZBIg1pgAbURjaexJNJDsknOmFBuAEe8TO-uh0c59qf5E__Y6m-w" alt="Professional Learning" />
                <div className="absolute -top-4 -right-4 bg-white p-3 rounded-xl shadow-lg border-l-4 border-secondary animate-bounce">
                  <span className="text-2xl">✨</span>
                  <span className="text-xs font-medium ml-2">AI Optimized Roadmap</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-primary py-6">
          <div className="max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-on-primary">12,000+</p>
              <p className="text-sm text-on-primary-container">trained</p>
            </div>
            <div className="text-center border-l border-on-primary-fixed-variant">
              <p className="text-3xl font-bold text-on-primary">200+</p>
              <p className="text-sm text-on-primary-container">AI tools</p>
            </div>
            <div className="text-center border-l border-on-primary-fixed-variant">
              <p className="text-3xl font-bold text-on-primary">40+</p>
              <p className="text-sm text-on-primary-container">departments</p>
            </div>
            <div className="text-center border-l border-on-primary-fixed-variant">
              <p className="text-3xl font-bold text-on-primary">98%</p>
              <p className="text-sm text-on-primary-container">completion</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-8 md:px-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary">How SkillBridge Works</h2>
              <p className="text-on-surface-variant mt-2">Simple, effective, and tailored to your career trajectory.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-secondary hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-secondary text-2xl">👤</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Tell us role</h3>
                <p className="text-sm text-on-surface-variant">Define your current job title and department. Our AI analyzes the necessary technical stack for your position.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-secondary hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-secondary text-2xl">🗺️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Get roadmap</h3>
                <p className="text-sm text-on-surface-variant">Receive a step-by-step personalized learning path highlighting AI tools that will automate your routine tasks.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-secondary hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-secondary text-2xl">✅</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Learn & earn</h3>
                <p className="text-sm text-on-surface-variant">Complete modules, earn industry-recognized certifications, and boost your department's efficiency levels.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Department Showcase */}
        <section className="py-20 bg-surface overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 md:px-16 mb-6">
            <h2 className="text-3xl font-bold text-primary">Tailored for Every Sector</h2>
          </div>
          <div className="department-strip flex gap-6 overflow-x-auto px-8 md:px-16 pb-6" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            {departments.map((dept, index) => (
              <div key={index} className="group min-w-[280px] bg-white rounded-xl p-6 shadow-sm border border-outline-variant hover:border-secondary transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{dept.icon}</span>
                  <h4 className="text-lg font-semibold">{dept.name}</h4>
                </div>
                <p className="text-sm text-on-surface-variant mb-6">{dept.description}</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-secondary-container/20 p-2 rounded-lg">
                  <p className="text-xs font-medium text-secondary">Sample: {dept.sample}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-surface-container">
          <div className="max-w-7xl mx-auto px-8 md:px-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary">Success Stories</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm italic">
                <p className="text-on-surface mb-6">"SkillBridge transformed how our marketing department handles data. We've seen a 40% increase in productivity since incorporating AI into our daily workflows."</p>
                <div className="flex items-center gap-4">
                  <img className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAq_3wMo_Aq7RmhHf1z-m0BOugCKNoim-t7HDz-he3Wpkue17hqsjMPNVMf1tr5_NeSHNGg0bGY12b5Lpwsi0noLxf0-eqFZJXJFGp3Mu3oboRGotQ7qciY1jddWTzxyR8kJv3G6UiaoLEI1SdbGPIfc4-RH1IYsN-p0whNY27pvFDJMZz7dZZul8KVVzKUBEBgKbGW0y12hkGuXkqHpHpp1cdRAIVwLwHDbrI3XZq8eucjAOc6yTl1HdoHbm2EVBbRODEjV90uMik" alt="Sarah J." />
                  <div>
                    <h5 className="text-sm font-bold">Sarah J.</h5>
                    <p className="text-xs text-on-surface-variant">Marketing Director</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm italic">
                <p className="text-on-surface mb-6">"The government-specific roadmaps are genius. We were able to train 50 officers in record time with very specific tools for forensic analysis."</p>
                <div className="flex items-center gap-4">
                  <img className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpuxirwpAHM8oaiurWrVDhrV3jwriXlQA9dfGMFlN0gIBnpAwmicHdkks_1bb0W2CkR3Q21_eq4K4wcGRoX2Fhyu-I9RCCfzF45fDCisQu4XJJthoCBOs7AQNnKqGAf8MsfRfJx1Ev-CbvItlrf8JO0kYy8AGkMfvkyvhPnlJdpY-Rjg_AdTTIFWlXawaZE2gq8FcA-8Tn4yj25yHVTDIGiXWxpqEipOL-S6dOBa-43-gBVsFcuN_IoeH-_8GxgSOk7UPtRH1fXWQ" alt="Lt. Col Ahmed" />
                  <div>
                    <h5 className="text-sm font-bold">Lt. Col Ahmed</h5>
                    <p className="text-xs text-on-surface-variant">Public Safety Dept</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm italic">
                <p className="text-on-surface mb-6">"Best investment we made this year. The 'Learn & Earn' model keeps the team motivated, and the certificates are actually recognized by our peers."</p>
                <div className="flex items-center gap-4">
                  <img className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6Br-ffs_vOq6wyEHRZsRtpNKjs61YQU_-5vFC1EyBgkuVXjmyFABr9D_ypi7Vj0sOlhqr-dQ3-cgxi0MSO1urXKPMTuHqIxMzpyQcEiDm6Go0uuYe28_S1iwdy4l1U8o1MVDaYgxFfREvKo8nJgjzyeL9i5PCp0O_woHVjQWbTT8ZS6U1dvD17YmgKMZLzp5yeDRZ38fxA4kDr_Y0DlUKnBla8rAuYFwHX2r8GGkUxRkRPNaPoAh58v9CwWLy00ZOs6TP4hwV7SI" alt="Maya Lee" />
                  <div>
                    <h5 className="text-sm font-bold">Maya Lee</h5>
                    <p className="text-xs text-on-surface-variant">Head of Operations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-8 md:px-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary">Scalable Plans</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 items-end">
              {/* Individual */}
              <div className="bg-white p-12 rounded-xl shadow-sm border border-outline-variant h-full">
                <h3 className="text-2xl font-semibold mb-2">Individual</h3>
                <p className="text-3xl font-bold mb-6">$29<span className="text-base text-on-surface-variant">/mo</span></p>
                <ul className="space-y-3 mb-12">
                  <li className="flex items-center gap-2 text-sm"><span className="text-secondary">✓</span> Personal roadmap</li>
                  <li className="flex items-center gap-2 text-sm"><span className="text-secondary">✓</span> Unlimited AI tools access</li>
                  <li className="flex items-center gap-2 text-sm"><span className="text-secondary">✓</span> Certification</li>
                </ul>
                <button className="w-full border-2 border-primary text-primary py-3 rounded-lg font-medium hover:bg-primary/5 transition-colors">Start Free Trial</button>
              </div>
              {/* Team */}
              <div className="bg-white p-12 rounded-xl shadow-md border-2 border-secondary h-full scale-105 relative z-10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary px-6 py-1 rounded-full text-xs font-medium">Most Popular</div>
                <h3 className="text-2xl font-semibold mb-2">Team</h3>
                <p className="text-3xl font-bold mb-6">$99<span className="text-base text-on-surface-variant">/mo</span></p>
                <ul className="space-y-3 mb-12">
                  <li className="flex items-center gap-2 text-sm font-bold"><span className="text-secondary">✓</span> Everything in Individual</li>
                  <li className="flex items-center gap-2 text-sm"><span className="text-secondary">✓</span> 10 Team Members</li>
                  <li className="flex items-center gap-2 text-sm"><span className="text-secondary">✓</span> Progress Analytics</li>
                </ul>
                <button className="w-full bg-secondary text-on-secondary py-3 rounded-lg font-medium shadow-lg hover:opacity-90 transition-opacity">Get Started</button>
              </div>
              {/* Enterprise */}
              <div className="bg-white p-12 rounded-xl shadow-sm border border-outline-variant h-full">
                <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
                <p className="text-3xl font-bold mb-6">Custom</p>
                <ul className="space-y-3 mb-12">
                  <li className="flex items-center gap-2 text-sm font-bold"><span className="text-secondary">✓</span> Unlimited Departments</li>
                  <li className="flex items-center gap-2 text-sm"><span className="text-secondary">✓</span> Custom Integrations</li>
                  <li className="flex items-center gap-2 text-sm"><span className="text-secondary">✓</span> Dedicated Mentor</li>
                </ul>
                <button className="w-full border-2 border-primary text-primary py-3 rounded-lg font-medium hover:bg-primary/5 transition-colors">Contact Sales</button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-8 md:px-16">
            <div className="bg-secondary rounded-3xl p-12 text-center text-on-secondary shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-radial from-white via-transparent to-transparent"></div>
              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl font-bold">Start your AI learning journey today</h2>
                <p className="text-lg opacity-90 max-w-xl mx-auto">Join thousands of professionals already future-proofing their careers with automated workflows and AI expertise.</p>
                <Link to="/signup" className="inline-block bg-white text-secondary px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-surface transition-colors transform hover:scale-105 mt-4">Create Free Account</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-on-primary">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 px-8 md:px-16 py-12">
          <div className="space-y-4">
            <span className="text-2xl font-bold">SkillBridge</span>
            <p className="text-sm opacity-70">Empowering the workforce through intelligent, automated learning paths designed for the digital age.</p>
          </div>
          <div>
            <h6 className="font-semibold mb-4">Product</h6>
            <ul className="space-y-2 text-sm text-on-primary-fixed-variant">
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">Features</a></li>
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">Roadmaps</a></li>
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">Enterprise</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-semibold mb-4">Company</h6>
            <ul className="space-y-2 text-sm text-on-primary-fixed-variant">
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">About Us</a></li>
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">Careers</a></li>
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">Success Stories</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-semibold mb-4">Support</h6>
            <ul className="space-y-2 text-sm text-on-primary-fixed-variant">
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">Help Center</a></li>
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 md:px-16 py-6 border-t border-on-primary-fixed-variant text-center opacity-60">
          <p className="text-sm">© 2024 SkillBridge AI Training. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
