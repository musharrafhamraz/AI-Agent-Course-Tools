import SideNav from './components/SideNav';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Enrolled', value: '1,284', trend: '+12% vs last mo', icon: '👥', bgColor: 'bg-secondary-container', textColor: 'text-secondary' },
    { label: 'Active This Week', value: '1,130', trend: '88% active rate', icon: '⚡', bgColor: 'bg-surface-container-high', textColor: 'text-primary' },
    { label: 'Avg. Completion', value: '68.4%', trend: 'Target: 75%', icon: '✅', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
    { label: 'Certifications', value: '452', trend: '+42 earned today', icon: '🏆', bgColor: 'bg-secondary-container', textColor: 'text-secondary' }
  ];

  const employees = [
    { name: 'Jane Smith', role: 'Lead Designer', department: 'Creative', progress: 92, lastActive: '2h ago', status: 'Completed', statusColor: 'bg-secondary-container/30 text-on-secondary-container border-secondary/20' },
    { name: 'Marcus Bell', role: 'Senior Engineer', department: 'Engineering', progress: 45, lastActive: 'Yesterday', status: 'Active', statusColor: 'bg-surface-container-high text-on-surface-variant border-outline-variant/30' },
    { name: 'Anita Lopez', role: 'Junior Analyst', department: 'Product', progress: 12, lastActive: '5 days ago', status: 'At Risk', statusColor: 'bg-error-container text-on-error-container border-error/20' },
    { name: 'David Kim', role: 'HR Director', department: 'Operations', progress: 78, lastActive: '15m ago', status: 'Active', statusColor: 'bg-surface-container-high text-on-surface-variant border-outline-variant/30' }
  ];

  const departments = [
    { name: 'Engineering', percentage: 84 },
    { name: 'Creative', percentage: 72 },
    { name: 'Product', percentage: 91 },
    { name: 'Operations', percentage: 56 }
  ];

  const pendingInvitations = [
    { email: 'sarah.k@tech.co', sent: '2 DAYS AGO' },
    { email: 'tom.chen@tech.co', sent: '4 HOURS AGO' }
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden">
      <SideNav />

      {/* Main Content Area */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen bg-background">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-6 py-4 bg-surface sticky top-0 border-b border-outline-variant z-40 backdrop-blur-md bg-surface/90">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="Search employees, skills, or courses..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-surface-container-high rounded-full transition-all text-on-surface-variant">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 hover:bg-surface-container-high rounded-full transition-all text-on-surface-variant">
              <span className="material-symbols-outlined">help</span>
            </button>
            <div className="h-10 w-10 rounded-full overflow-hidden border border-outline-variant cursor-pointer hover:ring-2 ring-primary transition-all">
              <div className="h-full w-full bg-primary-fixed flex items-center justify-center text-2xl">
                👨‍💼
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 md:p-12 space-y-12 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-primary">Organisation Overview</h2>
              <p className="text-on-surface-variant">Tracking growth and skill acquisition across 4 departments.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2 border border-outline text-primary font-bold rounded-lg text-sm flex items-center gap-2 hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-lg">download</span> Export Report
              </button>
              <button className="px-6 py-2 bg-primary text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-md hover:scale-95 transition-transform">
                <span className="material-symbols-outlined text-lg">person_add</span> Invite Employees
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-surface shadow-sm p-6 rounded-xl border-t-4 border-secondary transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <span className={`p-2 ${stat.bgColor} ${stat.textColor} rounded-lg text-2xl`}>
                    {stat.icon}
                  </span>
                  <span className="text-xs text-secondary">{stat.trend}</span>
                </div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Bento Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Team Progress Table */}
            <div className="lg:col-span-8 bg-surface rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-white">
                <h4 className="text-lg font-semibold text-primary">Team Progress Table</h4>
                <div className="flex gap-3">
                  <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
                    <span className="material-symbols-outlined">filter_list</span>
                  </button>
                  <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container-low text-on-surface-variant text-xs font-bold">
                    <tr>
                      <th className="px-6 py-4">Employee Name</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Course Progress</th>
                      <th className="px-6 py-4">Last Active</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {employees.map((employee, index) => (
                      <tr key={index} className="hover:bg-surface-container-lowest transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-bold text-primary">{employee.name}</p>
                              <p className="text-xs text-on-surface-variant">{employee.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{employee.department}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                              <div className={`h-full bg-secondary rounded-full`} style={{ width: `${employee.progress}%` }}></div>
                            </div>
                            <span className="text-xs text-secondary font-medium">{employee.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">{employee.lastActive}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 border rounded-full text-xs font-bold ${employee.statusColor}`}>
                            {employee.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-surface-container-low flex justify-center">
                <button className="text-primary font-bold text-sm hover:underline">View All 1,284 Employees</button>
              </div>
            </div>

            {/* Invite Panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-surface rounded-xl shadow-sm p-6 border-t-4 border-primary">
                <h4 className="text-lg font-semibold text-primary mb-3">Invite Employees</h4>
                <p className="text-sm text-on-surface-variant mb-6">Onboard new team members to start their learning journey.</p>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs text-on-surface uppercase tracking-tight font-medium">Email Addresses</label>
                    <textarea
                      className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                      placeholder="Paste emails separated by commas..."
                      rows="3"
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-on-surface uppercase tracking-tight font-medium">Assign Department</label>
                      <select className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary transition-all outline-none">
                        <option>Engineering</option>
                        <option>Creative</option>
                        <option>Product</option>
                        <option>Operations</option>
                      </select>
                    </div>
                    <button className="w-full bg-secondary text-white font-bold py-3 rounded-lg shadow-lg hover:bg-secondary/90 transition-all active:scale-[0.98]">
                      Send Invitations
                    </button>
                  </div>
                </form>
              </div>

              {/* Pending Invitations */}
              <div className="bg-surface rounded-xl shadow-sm p-6">
                <h5 className="text-sm font-bold text-primary mb-6 flex justify-between">
                  Pending Invitations
                  <span className="text-on-surface-variant font-normal">8 total</span>
                </h5>
                <ul className="space-y-3">
                  {pendingInvitations.map((invite, index) => (
                    <li key={index} className="flex items-center justify-between p-3 hover:bg-surface-container-low rounded-lg transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-base text-on-surface-variant">mail</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm">{invite.email}</p>
                          <p className="text-[10px] text-on-surface-variant font-medium">SENT {invite.sent}</p>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:text-error transition-all">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Department Comparison */}
            <div className="lg:col-span-6 bg-surface rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-semibold text-primary">Department Comparison</h4>
                <select className="border-none bg-surface-container-low rounded-lg text-xs py-1 outline-none">
                  <option>Avg. Completion</option>
                  <option>Participation</option>
                </select>
              </div>
              <div className="space-y-4 pt-6">
                {departments.map((dept, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-xs uppercase text-on-surface-variant font-medium">
                      <span>{dept.name}</span>
                      <span>{dept.percentage}%</span>
                    </div>
                    <div className="h-8 w-full bg-surface-container-high rounded-lg overflow-hidden flex items-center relative">
                      <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${dept.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Gap Analysis Heatmap */}
            <div className="lg:col-span-6 bg-surface rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-semibold text-primary">Skill Gap Analysis</h4>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-error rounded"></div>
                  <span className="text-xs text-on-surface-variant">Critical Gap</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="col-start-2 text-xs text-on-surface-variant py-2">UX Design</div>
                <div className="text-xs text-on-surface-variant py-2">React</div>
                <div className="text-xs text-on-surface-variant py-2">AI Ethics</div>
                
                <div className="text-xs text-on-surface-variant flex items-center justify-end pr-2">Creative</div>
                <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-inner">9/10</div>
                <div className="aspect-square bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center font-bold text-xs shadow-inner">4/10</div>
                <div className="aspect-square bg-surface-container-highest rounded-lg flex items-center justify-center font-bold text-xs shadow-inner">2/10</div>
                
                <div className="text-xs text-on-surface-variant flex items-center justify-end pr-2">Engineering</div>
                <div className="aspect-square bg-surface-container-high rounded-lg flex items-center justify-center font-bold text-xs shadow-inner">1/10</div>
                <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-inner">8/10</div>
                <div className="aspect-square bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center font-bold text-xs shadow-inner">6/10</div>
                
                <div className="text-xs text-on-surface-variant flex items-center justify-end pr-2">Product</div>
                <div className="aspect-square bg-error-container text-on-error-container rounded-lg flex items-center justify-center font-bold text-xs shadow-inner">0/10</div>
                <div className="aspect-square bg-surface-container-highest rounded-lg flex items-center justify-center font-bold text-xs shadow-inner">2/10</div>
                <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-inner">9/10</div>
              </div>
              <div className="mt-6 p-4 bg-surface-container-low rounded-lg text-sm italic">
                "Attention: Critical skill gap identified in Product team for UX Design fundamentals."
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
