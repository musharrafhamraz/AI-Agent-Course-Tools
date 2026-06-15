import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SideNav from './components/SideNav';

// ─── helpers ────────────────────────────────────────────────────────────────

function clamp(v, min = 0, max = 100) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Convert 5 skill scores → 5 SVG polygon points on a 400×400 radar chart.
 * Centre = (200, 200), max radius = 140.
 */
function skillsToPolygon(skills, maxR = 140) {
  const cx = 200, cy = 200;
  const labels = Object.keys(skills);
  const n = labels.length;
  return labels.map((label, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const r = (clamp(skills[label]) / 100) * maxR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

/** Axis line endpoints for each skill axis */
function axisEndpoints(index, n, maxR = 140) {
  const cx = 200, cy = 200;
  const angle = (2 * Math.PI * index) / n - Math.PI / 2;
  return {
    x2: (cx + maxR * Math.cos(angle)).toFixed(1),
    y2: (cy + maxR * Math.sin(angle)).toFixed(1),
  };
}

/** Label position slightly beyond the max radius */
function labelPos(index, n, maxR = 155) {
  const cx = 200, cy = 200;
  const angle = (2 * Math.PI * index) / n - Math.PI / 2;
  return {
    x: (cx + maxR * Math.cos(angle)).toFixed(1),
    y: (cy + maxR * Math.sin(angle)).toFixed(1),
  };
}

const STATUS_STYLES = {
  completed:   'bg-teal-100 text-teal-700',
  in_progress: 'bg-amber-100 text-amber-700',
  not_started: 'bg-gray-100 text-gray-500',
};
const STATUS_LABEL = {
  completed:   'COMPLETED',
  in_progress: 'IN PROGRESS',
  not_started: 'NOT STARTED',
};

// ─── component ──────────────────────────────────────────────────────────────

export default function ProgressTracker() {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/progress/tracker');
      setData(res.data);
    } catch (err) {
      console.error('Progress tracker error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      } else {
        setError('Failed to load progress data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden flex">
        <SideNav />
        <main className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-secondary mx-auto" />
            <p className="text-on-surface-variant text-sm">Loading your progress...</p>
          </div>
        </main>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden flex">
        <SideNav />
        <main className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <span className="material-symbols-outlined text-5xl text-error">error</span>
            <p className="text-on-surface-variant">{error}</p>
            <button
              onClick={fetchProgress}
              className="px-6 py-2 bg-secondary text-on-secondary rounded-lg font-bold hover:opacity-90 transition"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const skills       = data?.skill_proficiency || {};
  const skillLabels  = Object.keys(skills);
  const n            = skillLabels.length || 1;
  const polygon      = skillsToPolygon(skills);

  const weekly       = data?.weekly_hours || {};
  const weekDays     = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const maxHours     = Math.max(1, ...weekDays.map(d => weekly[d] || 0));

  const streak       = data?.streak || { current: 0, longest: 0 };
  const xp           = data?.xp || 0;
  const completedMod = data?.completed_modules || 0;
  const totalMod     = data?.total_modules || 0;
  const overallPct   = data?.overall_progress || 0;
  const moduleLog    = data?.module_log || [];
  const certs        = data?.certificates || [];
  const course       = data?.current_course;

  const dayLabels    = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Highest-score skill for the floating tooltip
  const topSkill = skillLabels.reduce(
    (best, sk) => (skills[sk] > (skills[best] || 0) ? sk : best),
    skillLabels[0] || ''
  );

  return (
    <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden">
      <SideNav />

      {/* ── Main Content Canvas ─────────────────────────────────────────── */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">

        {/* ── Top Bar ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 h-16 bg-primary flex items-center justify-between px-10 shadow-[0px_4px_20px_rgba(15,31,61,0.05)] z-40">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-on-primary">Learning Journey</h1>
            <div className="hidden md:flex gap-6">
              <span className="text-sm text-on-primary-fixed-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary-fixed">bolt</span>
                {streak.current} Day Streak
              </span>
              <span className="text-sm text-on-primary-fixed-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary-fixed">stars</span>
                {xp.toLocaleString()} XP
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <span className="material-symbols-outlined text-on-primary cursor-pointer hover:text-secondary-fixed transition-colors">
                notifications
              </span>
            </div>
            {course && (
              <Link
                to={`/course/${course.id}`}
                className="bg-secondary text-on-secondary px-3 py-1.5 rounded-lg text-sm font-bold hover:scale-95 transition-all"
              >
                Resume Learning
              </Link>
            )}
          </div>
        </header>

        {/* ── Page Body ───────────────────────────────────────────────────── */}
        <section className="p-10 space-y-16">

          {/* ── Summary Stat Pills ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: 'school',        label: 'Modules Done',   value: `${completedMod}/${totalMod}`,     color: 'border-secondary' },
              { icon: 'bolt',          label: 'Current Streak', value: `${streak.current}d`,               color: 'border-amber-500' },
              { icon: 'stars',         label: 'Total XP',       value: xp.toLocaleString(),               color: 'border-purple-400' },
              { icon: 'trending_up',   label: 'Overall',        value: `${overallPct}%`,                  color: 'border-blue-400'   },
            ].map(stat => (
              <div
                key={stat.label}
                className={`bg-white rounded-xl p-5 shadow-sm border-t-4 ${stat.color} flex items-center gap-4 hover:-translate-y-1 transition-transform`}
              >
                <span className="material-symbols-outlined text-3xl text-primary">{stat.icon}</span>
                <div>
                  <p className="text-on-surface-variant text-xs">{stat.label}</p>
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Bento Grid: Radar + Stats ────────────────────────────────── */}
          <div className="grid grid-cols-12 gap-6">

            {/* Radar (Skill Map) */}
            <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl shadow-sm border-t-4 border-secondary relative overflow-hidden min-h-[440px]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-primary mb-1">Skills Proficiency Map</h2>
                  <p className="text-sm text-on-surface-variant">Multi-dimensional growth across AI &amp; Automation domains.</p>
                </div>
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold">
                  {overallPct < 30 ? 'Beginner' : overallPct < 70 ? 'Intermediate' : 'Advanced'}
                </span>
              </div>

              <div className="relative flex items-center justify-center h-[340px]">
                <svg className="w-full h-full max-w-[380px] transition-all duration-700 hover:scale-105" viewBox="0 0 400 400">
                  {/* Background grid circles */}
                  {[140, 100, 60, 20].map(r => (
                    <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="#e2e8f0" strokeDasharray="4 4" />
                  ))}

                  {/* Axis lines */}
                  {skillLabels.map((_, i) => {
                    const ep = axisEndpoints(i, n);
                    return <line key={i} x1="200" y1="200" x2={ep.x2} y2={ep.y2} stroke="#e2e8f0" />;
                  })}

                  {/* Skill polygon */}
                  {polygon && (
                    <polygon
                      fill="rgba(0,107,85,0.12)"
                      stroke="#006b55"
                      strokeWidth="2.5"
                      points={polygon}
                      className="transition-all duration-700"
                    />
                  )}

                  {/* Skill dot nodes */}
                  {skillLabels.map((sk, i) => {
                    const ep = axisEndpoints(i, n, (clamp(skills[sk]) / 100) * 140);
                    return (
                      <circle
                        key={sk}
                        cx={ep.x2}
                        cy={ep.y2}
                        r="5"
                        fill="#006b55"
                        className="hover:r-7 transition-all cursor-pointer"
                      />
                    );
                  })}

                  {/* Labels */}
                  {skillLabels.map((sk, i) => {
                    const pos = labelPos(i, n);
                    return (
                      <text
                        key={sk}
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="10"
                        fill="#0f1f3d"
                        fontWeight="500"
                      >
                        {sk}
                      </text>
                    );
                  })}
                </svg>

                {/* Floating tooltip for top skill */}
                {topSkill && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-lg border border-outline-variant shadow-lg">
                    <p className="text-xs font-bold text-secondary">{topSkill}</p>
                    <p className="text-2xl font-bold text-primary">{skills[topSkill]}%</p>
                  </div>
                )}
              </div>

              {/* Skill bars summary */}
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                {skillLabels.map(sk => (
                  <div key={sk}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface-variant truncate">{sk}</span>
                      <span className="font-bold text-primary">{skills[sk]}%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-secondary h-full rounded-full transition-all duration-700"
                        style={{ width: `${skills[sk]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column: Weekly Effort + Current Focus */}
            <div className="col-span-12 lg:col-span-4 space-y-6">

              {/* Weekly Effort */}
              <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-amber-500">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-primary">Weekly Effort</h3>
                  <span className="material-symbols-outlined text-amber-500">schedule</span>
                </div>
                <p className="text-4xl font-bold text-primary">
                  {weekly.total ?? 0}
                  <span className="text-lg text-on-surface-variant font-normal"> hrs</span>
                </p>
                <div className="flex items-end gap-2 mt-5 h-16">
                  {weekDays.map((d, i) => {
                    const h = weekly[d] || 0;
                    const pct = maxHours > 0 ? (h / maxHours) * 100 : 0;
                    const isToday = new Date().getDay() === (i + 1) % 7;
                    return (
                      <div
                        key={d}
                        className="flex-1 rounded-t-sm transition-all duration-500"
                        style={{
                          height: `${Math.max(pct, 8)}%`,
                          backgroundColor: h > 0 ? (isToday ? '#006b55' : '#b2dfdb') : '#e0e0e0',
                        }}
                        title={`${d.charAt(0).toUpperCase() + d.slice(1)}: ${h}h`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  {dayLabels.map((lbl, i) => (
                    <span key={i} className="text-[10px] text-on-surface-variant flex-1 text-center">{lbl}</span>
                  ))}
                </div>
              </div>

              {/* Current Focus / Streak */}
              <div className="bg-primary text-on-primary p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold mb-1">Current Focus</h3>
                  <p className="text-on-primary-fixed-variant text-sm mb-4 line-clamp-2">
                    {course?.title || 'No active course'}
                  </p>
                  {course && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Curriculum Progress</span>
                        <span>{course.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-primary-container h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-secondary-fixed-dim h-full rounded-full transition-all duration-700"
                          style={{ width: `${course.progress_percentage}%` }}
                        />
                      </div>
                      {course.next_lesson && (
                        <p className="text-xs text-on-primary-fixed-variant mt-2 pt-1 border-t border-white/10">
                          Next: <span className="font-semibold text-on-primary">{course.next_lesson}</span>
                        </p>
                      )}
                      <Link
                        to={`/course/${course.id}`}
                        className="block w-full mt-2 py-2.5 border border-secondary text-secondary rounded-lg text-xs font-bold text-center hover:bg-secondary hover:text-white transition-all"
                      >
                        Resume Learning
                      </Link>
                    </div>
                  )}

                  {/* Streak */}
                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-secondary-fixed">{streak.current}</p>
                      <p className="text-[10px] text-on-primary-fixed-variant uppercase tracking-wider">Current</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-on-primary">{streak.longest}</p>
                      <p className="text-[10px] text-on-primary-fixed-variant uppercase tracking-wider">Longest</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-on-primary">{streak.total_learning_days || 0}</p>
                      <p className="text-[10px] text-on-primary-fixed-variant uppercase tracking-wider">Total Days</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ── Certifications ──────────────────────────────────────────── */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-primary">Completed Certifications</h2>
                <p className="text-sm text-on-surface-variant">Recognised achievements in the professional AI ecosystem.</p>
              </div>
              <Link to="/certificate/1" className="flex items-center gap-2 text-secondary font-bold hover:underline text-sm">
                View All
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>

            {certs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {certs.map(cert => (
                  <div
                    key={cert.id}
                    className="bg-white p-4 rounded-xl border border-outline-variant hover:shadow-lg transition-all group"
                  >
                    <div className="aspect-video rounded-lg overflow-hidden mb-3 relative bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-secondary">workspace_premium</span>
                      <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-4xl">verified</span>
                      </div>
                    </div>
                    <h4 className="text-base font-semibold text-primary mb-1 line-clamp-2">{cert.course_title}</h4>
                    <p className="text-xs text-on-surface-variant mb-4">
                      Issued: {cert.issue_date} • ID: {cert.certificate_number}
                    </p>
                    {cert.tools_mastered && cert.tools_mastered.length > 0 && (
                      <p className="text-xs text-on-surface-variant mb-3">
                        Tools: {cert.tools_mastered.join(', ')}
                      </p>
                    )}
                    <button className="w-full py-2 bg-surface-container-low text-primary rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-secondary-container transition-colors text-sm">
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      Share to LinkedIn
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-outline-variant">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">workspace_premium</span>
                <p className="text-on-surface-variant">No certificates yet. Complete a course to earn your first certificate!</p>
                {course && (
                  <Link
                    to={`/course/${course.id}`}
                    className="inline-block mt-4 px-6 py-2 bg-secondary text-on-secondary rounded-lg font-bold hover:opacity-90 transition"
                  >
                    Continue Learning
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* ── Module Learning Log ──────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
            <div className="p-6 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
              <h3 className="text-xl font-semibold text-primary">Module Learning Log</h3>
              <span className="text-sm text-on-surface-variant">{completedMod} of {totalMod} completed</span>
            </div>

            {moduleLog.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface text-sm text-on-surface-variant">
                      {['Module Name', 'Course', 'AI Tool', 'Est. Time', 'Best Score', 'Status', ''].map(h => (
                        <th key={h} className="px-5 py-4 border-b border-outline-variant font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {moduleLog.map((row, idx) => (
                      <tr key={`${row.module_id}-${idx}`} className="hover:bg-surface-container transition-colors group">
                        <td className="px-5 py-5 border-b border-outline-variant font-bold text-primary">
                          {row.module_title}
                        </td>
                        <td className="px-5 py-5 border-b border-outline-variant text-on-surface-variant text-xs max-w-[160px] truncate">
                          {row.course_title}
                        </td>
                        <td className="px-5 py-5 border-b border-outline-variant text-on-surface-variant">
                          {row.tool_name || '—'}
                        </td>
                        <td className="px-5 py-5 border-b border-outline-variant text-on-surface-variant">
                          {row.time_invested}
                        </td>
                        <td className="px-5 py-5 border-b border-outline-variant font-semibold text-primary">
                          {row.score != null ? `${row.score}%` : '—'}
                        </td>
                        <td className="px-5 py-5 border-b border-outline-variant">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_STYLES[row.status]}`}>
                            {STATUS_LABEL[row.status]}
                          </span>
                        </td>
                        <td className="px-5 py-5 border-b border-outline-variant text-right">
                          <button className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                            more_vert
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-4 block">school</span>
                <p>No modules started yet. Begin your learning journey to track progress here.</p>
                <Link
                  to="/onboarding-role"
                  className="inline-block mt-4 px-6 py-2 bg-secondary text-on-secondary rounded-lg font-bold hover:opacity-90 transition"
                >
                  Start Learning
                </Link>
              </div>
            )}
          </div>

        </section>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="w-full mt-16 bg-primary">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-10 py-10 max-w-[1280px] mx-auto">
            <div className="col-span-1 md:col-span-2">
              <span className="text-xl font-bold text-secondary-fixed mb-3 block">SkillBridge</span>
              <p className="text-sm text-on-primary-fixed-variant max-w-sm">
                © 2024 SkillBridge AI. Empowering lifelong learners globally through adaptive AI pathways and professional certification.
              </p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-on-primary mb-4">Platform</h5>
              <ul className="space-y-2">
                {['About Us', 'Privacy Policy', 'Terms of Service'].map(l => (
                  <li key={l}><a className="text-sm text-on-primary-fixed-variant hover:text-secondary-fixed transition-colors" href="#">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-on-primary mb-4">Resources</h5>
              <ul className="space-y-2">
                {['Contact Support', 'Careers', 'API Docs'].map(l => (
                  <li key={l}><a className="text-sm text-on-primary-fixed-variant hover:text-secondary-fixed transition-colors" href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
