import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SideNav from './components/SideNav';

export default function AdminDashboard() {
  const [data, setData] = useState({
    stats: [],
    employees: [],
    departments: [],
    pendingInvitations: [],
    skillGaps: [],
    departmentsDropdown: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteDept, setInviteDept] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteError, setInviteError] = useState(false);

  // Fetch all dashboard overview data
  const fetchData = async () => {
    try {
      const res = await axios.get('/api/admin/overview');
      setData(res.data);
      if (res.data.departmentsDropdown?.length > 0) {
        // Only set default if not already selected
        setInviteDept(prev => prev || res.data.departmentsDropdown[0].id.toString());
      }
      setError('');
    } catch (err) {
      console.error('Error fetching admin overview:', err);
      setError('Failed to load dashboard statistics. Please check server status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter employees list based on search bar
  const filteredEmployees = (data.employees || []).filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Send invitations to list of emails
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmails.trim()) return;

    setInviting(true);
    setInviteMessage('');
    setInviteError(false);

    try {
      const res = await axios.post('/api/admin/invite', {
        emails: inviteEmails,
        department_id: inviteDept ? parseInt(inviteDept) : null
      });
      
      setInviteMessage(res.data.message);
      setInviteEmails('');
      
      // Refresh list to show pending invites
      fetchData();
    } catch (err) {
      setInviteError(true);
      setInviteMessage(err.response?.data?.detail || 'Failed to send invitations. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  // Cancel pending invitation
  const handleCancelInvite = async (email) => {
    if (!confirm(`Are you sure you want to cancel the invitation for ${email}?`)) return;
    try {
      await axios.delete(`/api/admin/invite/${encodeURIComponent(email)}`);
      fetchData();
    } catch (err) {
      console.error('Error cancelling invitation:', err);
      alert('Failed to cancel invitation. Please try again.');
    }
  };

  // Export report as downloadable CSV
  const handleExportReport = () => {
    if (filteredEmployees.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ['Employee Name', 'Role/Job Title', 'Department', 'Course Progress', 'Last Active', 'Status'];
    const rows = filteredEmployees.map(emp => [
      `"${emp.name.replace(/"/g, '""')}"`,
      `"${emp.role.replace(/"/g, '""')}"`,
      `"${emp.department.replace(/"/g, '""')}"`,
      `"${emp.progress}%"`,
      `"${emp.lastActive}"`,
      `"${emp.status}"`
    ]);

    // Prepend UTF-8 BOM so Excel opens it with correct encoding
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SkillBridge_Employee_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-secondary mx-auto" />
          <p className="text-on-surface-variant text-sm font-medium">Loading organization dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-outline-variant p-8 text-center space-y-6">
          <span className="material-symbols-outlined text-5xl text-error">error</span>
          <h2 className="text-2xl font-bold text-primary">Error Loading Dashboard</h2>
          <p className="text-on-surface-variant text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full py-2.5 bg-secondary text-on-secondary rounded-xl font-semibold hover:opacity-95 transition text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm focus:ring-2 focus:ring-primary outline-none text-primary font-medium"
                placeholder="Search employees, roles, or departments..."
                type="text"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary text-xs font-bold"
                >
                  Clear
                </button>
              )}
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
        <div className="p-6 md:p-12 space-y-12 max-w-7xl mx-auto w-full">
          
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-primary">Organisation Overview</h2>
              <p className="text-on-surface-variant">Tracking growth, course completions, and skill gaps across all active departments.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleExportReport}
                className="px-6 py-2.5 border border-outline text-primary font-bold rounded-lg text-sm flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">download</span> Export Report
              </button>
              <a 
                href="#invite-panel"
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-md hover:scale-[0.98] transition-transform"
              >
                <span className="material-symbols-outlined text-lg">person_add</span> Invite Section
              </a>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(data.stats || []).map((stat, index) => (
              <div key={index} className="bg-white shadow-sm p-6 rounded-xl border-t-4 border-secondary transition-all hover:shadow-md border border-outline-variant/35">
                <div className="flex justify-between items-start mb-4">
                  <span className={`p-2 rounded-lg text-2xl ${stat.bgColor || 'bg-secondary-container'} ${stat.textColor || 'text-secondary'}`}>
                    {stat.icon}
                  </span>
                  <span className="text-xs text-secondary font-bold bg-secondary-container/20 px-2 py-0.5 rounded-full">{stat.trend}</span>
                </div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2 font-semibold">{stat.label}</p>
                <h3 className="text-2xl font-bold text-primary">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Bento Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Team Progress Table */}
            <div className="lg:col-span-8 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-outline-variant/50">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-white">
                <div>
                  <h4 className="text-lg font-bold text-primary">Team Progress Table</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {searchQuery ? `Showing ${filteredEmployees.length} filtered results` : `Showing all enrolled personnel`}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
                    <span className="material-symbols-outlined">filter_list</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container-low text-on-surface-variant text-xs font-bold uppercase tracking-wider border-b border-outline-variant/55">
                    <tr>
                      <th className="px-6 py-4">Employee Name</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Course Progress</th>
                      <th className="px-6 py-4">Last Active</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee, index) => (
                        <tr key={index} className="hover:bg-surface-container-lowest transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-bold text-primary">{employee.name}</p>
                                <p className="text-xs text-on-surface-variant font-medium">{employee.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-primary font-medium">{employee.department}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                                <div className={`h-full bg-secondary rounded-full transition-all duration-500`} style={{ width: `${employee.progress}%` }}></div>
                              </div>
                              <span className="text-xs text-secondary font-bold">{employee.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant font-medium">{employee.lastActive}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 border rounded-full text-xs font-bold ${employee.statusColor}`}>
                              {employee.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-on-surface-variant font-medium">
                          No matching employees found for "{searchQuery}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-surface-container-low flex justify-center border-t border-outline-variant/50">
                <span className="text-primary font-bold text-xs uppercase tracking-wider">
                  Registry holds {data.employees?.length || 0} active learning profile(s)
                </span>
              </div>
            </div>

            {/* Invite Panel */}
            <div id="invite-panel" className="lg:col-span-4 space-y-6">
              
              <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-primary border border-outline-variant/40">
                <h4 className="text-lg font-bold text-primary mb-1">Invite Employees</h4>
                <p className="text-xs text-on-surface-variant mb-6">Onboard new team members to start their learning journey.</p>
                
                <form onSubmit={handleInvite} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs text-primary uppercase tracking-wider font-bold">Email Addresses</label>
                    <textarea
                      value={inviteEmails}
                      onChange={(e) => setInviteEmails(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-primary font-medium"
                      placeholder="Paste emails separated by commas or newlines..."
                      rows="3"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-primary uppercase tracking-wider font-bold">Assign Department</label>
                      <select 
                        value={inviteDept}
                        onChange={(e) => setInviteDept(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary transition-all outline-none text-primary font-semibold"
                        required
                      >
                        <option value="">Select Department...</option>
                        {(data.departmentsDropdown || []).map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>

                    {inviteMessage && (
                      <div className={`p-3.5 rounded-xl text-xs font-semibold border ${inviteError ? 'bg-error-container text-on-error-container border-error/20' : 'bg-emerald-50 text-emerald-800 border-emerald-100'}`}>
                        {inviteMessage}
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={inviting}
                      className="w-full bg-secondary text-white font-bold py-3 rounded-lg shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-75 flex items-center justify-center gap-2"
                    >
                      {inviting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Sending invites...
                        </>
                      ) : (
                        "Send Invitations"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Pending Invitations */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-outline-variant/40">
                <h5 className="text-sm font-bold text-primary mb-6 flex justify-between items-center">
                  Pending Invitations
                  <span className="text-xs bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface-variant font-bold">
                    {data.pendingInvitations?.length || 0} total
                  </span>
                </h5>
                
                {data.pendingInvitations && data.pendingInvitations.length > 0 ? (
                  <ul className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {data.pendingInvitations.map((invite, index) => (
                      <li key={index} className="flex items-center justify-between p-3 hover:bg-surface-container-low rounded-lg transition-colors group border border-outline-variant/30">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-base text-on-surface-variant">mail</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-primary truncate" title={invite.email}>{invite.email}</p>
                            <p className="text-[9px] text-on-surface-variant font-bold uppercase">
                              {invite.department} • SENT {invite.sent}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleCancelInvite(invite.email)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-error transition-all"
                          title="Cancel Invitation"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-on-surface-variant text-center py-4 italic">No pending invitations.</p>
                )}
              </div>
            </div>

            {/* Department Comparison */}
            <div className="lg:col-span-6 bg-white rounded-xl shadow-sm p-6 border border-outline-variant/45">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold text-primary">Department Comparison</h4>
                <span className="text-xs font-bold text-secondary-fixed bg-secondary-container/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  Avg. Course Completion
                </span>
              </div>
              <div className="space-y-4 pt-4 max-h-[360px] overflow-y-auto pr-1">
                {(data.departments || []).map((dept, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-xs uppercase text-on-surface-variant font-bold">
                      <span>{dept.name}</span>
                      <span>{dept.percentage}%</span>
                    </div>
                    <div className="h-8 w-full bg-surface-container-high rounded-lg overflow-hidden flex items-center relative border border-outline-variant/30">
                      <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${dept.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Gap Analysis Heatmap */}
            <div className="lg:col-span-6 bg-white rounded-xl shadow-sm p-6 border border-outline-variant/45">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold text-primary">Skill Gap Analysis</h4>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-error-container border border-error/20 rounded"></div>
                  <span className="text-xs text-on-surface-variant font-medium">Critical Gap (0-1)</span>
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-3 text-center">
                {/* Column Headers */}
                <div className="col-start-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant py-1">Canva AI</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant py-1">ChatGPT</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant py-1">Julius AI</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant py-1">Zapier</div>
                
                {/* Rows */}
                {(data.skillGaps || []).map((row, idx) => (
                  <React.Fragment key={idx}>
                    <div className="text-xs font-bold text-on-surface-variant flex items-center justify-end pr-2">{row.department}</div>
                    {row.scores.map((cell, cIdx) => {
                      let cellClass = "aspect-square rounded-lg flex items-center justify-center font-bold text-xs shadow-inner transition-all duration-300 border ";
                      if (cell.score >= 8) {
                        cellClass += "bg-secondary text-white border-secondary/20 hover:scale-105";
                      } else if (cell.score >= 5) {
                        cellClass += "bg-secondary-container text-on-secondary-container border-secondary/10 hover:scale-105";
                      } else if (cell.score >= 2) {
                        cellClass += "bg-surface-container-highest text-on-surface-variant border-outline-variant hover:scale-105";
                      } else {
                        cellClass += "bg-error-container text-on-error-container border-error/15 hover:scale-105";
                      }
                      return (
                        <div key={cIdx} className={cellClass} title={`${row.department} - ${cell.tool}: ${cell.score}/10`}>
                          {cell.score}/10
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-6 p-4 bg-surface-container-low rounded-lg text-xs italic border border-outline-variant/50 leading-relaxed text-on-surface-variant">
                * Note: Heatmap ranks are calculated on a scale of 10. Data is derived directly from department members' active onboarding skill selections and module achievements.
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
