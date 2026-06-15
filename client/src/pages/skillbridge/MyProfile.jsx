import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import SideNav from './components/SideNav';

// ── Toggle switch component ────────────────────────────────────────────────────
function Toggle({ id, checked, onChange, disabled = false }) {
  return (
    <div className="relative inline-block w-12 align-middle select-none shrink-0">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <label
        htmlFor={id}
        className={`block h-6 rounded-full cursor-pointer transition-colors duration-200 ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        } ${checked ? 'bg-secondary' : 'bg-outline-variant'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </label>
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ icon, value, label, color }) {
  return (
    <div className={`bg-surface p-5 rounded-xl shadow-sm border-t-4 ${color} flex items-center gap-4 hover:-translate-y-1 transition-transform`}>
      <div className="w-11 h-11 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div>
        <span className="text-3xl font-bold text-primary block leading-tight">{value}</span>
        <span className="text-xs text-on-surface-variant uppercase font-medium tracking-wide">{label}</span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function MyProfile() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // notification preferences (local state — no backend for these yet)
  const [emailNotif,    setEmailNotif]    = useState(true);
  const [pushNotif,     setPushNotif]     = useState(true);
  const [criticalAlerts] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/certificates/profile-summary');
        setProfileData(res.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login', { state: { message: 'Please log in to view your profile.' } });
        } else {
          console.error('Profile load error:', err);
          setError('Could not load profile data.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── helpers ────────────────────────────────────────────────────────────────
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0][0];
  };

  // ── derived values ─────────────────────────────────────────────────────────
  const displayName   = profileData?.user?.full_name || authUser?.full_name || 'User';
  const displayEmail  = profileData?.user?.email     || authUser?.email     || '';
  const stats         = profileData?.stats           || {};
  const profile       = profileData?.profile;
  const certs         = profileData?.certificates    || [];

  // ── loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex">
        <SideNav />
        <main className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto" />
            <p className="text-on-surface-variant text-sm">Loading your profile…</p>
          </div>
        </main>
      </div>
    );
  }

  // ── error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex">
        <SideNav />
        <main className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-error">error</span>
            <p className="text-on-surface-variant">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-secondary text-on-secondary rounded-lg font-bold">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden">
      <SideNav />

      <main className="ml-64 flex-1 flex flex-col min-h-screen bg-background pb-20">

        {/* ── Hero banner ───────────────────────────────────────────────── */}
        <div className="relative w-full h-52 bg-gradient-to-r from-secondary via-secondary/80 to-primary overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {/* Abstract pattern */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${80 + i * 40}px`,
                  height: `${80 + i * 40}px`,
                  right: `${-20 + i * 60}px`,
                  top: `${-20 + i * 20}px`,
                  opacity: 0.4 - i * 0.05,
                }}
              />
            ))}
          </div>
          <button className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/35 backdrop-blur-md text-white px-5 py-1.5 rounded-full border border-white/30 transition flex items-center gap-1.5 text-sm font-medium">
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Customize Banner
          </button>
        </div>

        {/* ── Profile header ────────────────────────────────────────────── */}
        <div className="px-10 md:px-16 -mt-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-5">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-2xl border-4 border-background shadow-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shrink-0">
              {getInitials(displayName).toUpperCase()}
            </div>
            <div className="mb-1 space-y-1">
              <h1 className="text-3xl font-bold text-primary">{displayName}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-on-surface-variant">{displayEmail}</p>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="text-xs uppercase tracking-wider text-secondary font-bold">
                  {profile?.sector_type || 'Member'}
                </span>
                {profileData?.user?.member_since && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                    <span className="text-xs text-on-surface-variant">
                      Member since {profileData.user.member_since}
                    </span>
                  </>
                )}
              </div>
              {profile?.job_title && (
                <p className="text-sm text-on-surface-variant font-medium">
                  {profile.job_title}
                  {profile.organization_name && ` · ${profile.organization_name}`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-1">
            <button className="bg-primary text-on-primary px-8 py-2.5 rounded-lg font-bold shadow-md hover:scale-105 active:scale-95 transition-all">
              Edit Profile
            </button>
            <button className="w-11 h-11 flex items-center justify-center border border-outline rounded-lg text-primary hover:bg-surface-container-low transition">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        <div className="px-10 md:px-16 mt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatPill icon="school"      value={stats.courses_completed || 0}    label="Courses Completed"   color="border-secondary" />
            <StatPill icon="verified"    value={stats.certificates_earned || 0}  label="Certificates Earned" color="border-teal-400" />
            <StatPill icon="bolt"        value={`${stats.current_streak || 0}d`} label="Current Streak"      color="border-amber-500" />
            <StatPill icon="schedule"    value={`${stats.total_learning_hours || 0}h`} label="Time Invested" color="border-blue-400" />
          </div>
        </div>

        {/* ── About section ─────────────────────────────────────────────── */}
        <section className="px-10 md:px-16 mt-12">
          <div className="bg-surface rounded-xl p-8 md:p-12 shadow-sm border border-outline-variant">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-primary">Professional Journey</h2>
              <button className="text-secondary text-sm flex items-center gap-1 hover:underline">
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                Edit Fields
              </button>
            </div>

            {profile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left: bio */}
                <div className="space-y-2">
                  <label className="text-xs text-on-surface-variant uppercase font-medium tracking-wider block">About</label>
                  <p className="text-on-surface leading-relaxed">
                    {profile.job_title
                      ? `${profile.job_title} at ${profile.organization_name || 'an organisation'} with ${
                          profile.years_experience
                        } year${profile.years_experience !== 1 ? 's' : ''} of experience in the ${profile.sector_type} sector.`
                      : 'No bio added yet.'}
                  </p>

                  {profile.current_tools?.length > 0 && (
                    <div className="pt-3">
                      <label className="text-xs text-on-surface-variant uppercase font-medium tracking-wider block mb-2">Current Tools</label>
                      <div className="flex flex-wrap gap-2">
                        {profile.current_tools.map(tool => (
                          <span key={tool} className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-medium">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: grid details */}
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { label: 'Sector',       value: profile.sector_type },
                    { label: 'Experience',   value: profile.years_experience ? `${profile.years_experience} yrs` : '—' },
                    { label: 'Department',   value: profile.department_name || '—' },
                    { label: 'Organisation', value: profile.organization_name || '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="text-xs text-on-surface-variant uppercase font-medium tracking-wider block mb-1">{label}</label>
                      <p className="font-semibold text-primary truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* No profile yet */
              <div className="text-center py-8 space-y-4">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant">person_off</span>
                <p className="text-on-surface-variant">You haven't completed your professional profile yet.</p>
                <Link
                  to="/onboarding-role"
                  className="inline-block px-6 py-2 bg-secondary text-on-secondary rounded-lg font-bold hover:opacity-90 transition"
                >
                  Complete Onboarding →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── Certificates section ──────────────────────────────────────── */}
        <section className="mt-12">
          <div className="px-10 md:px-16 mb-5 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-semibold text-primary">My Certificates</h2>
              <p className="text-on-surface-variant text-sm">Industry-recognised credentials earned on SkillBridge.</p>
            </div>
            <Link to="/certificate/1" className="text-secondary font-bold text-sm hover:underline flex items-center gap-1">
              View All
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          {certs.length > 0 ? (
            <div
              className="flex overflow-x-auto gap-5 px-10 md:px-16 pb-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {certs.map(cert => (
                <Link
                  key={cert.id}
                  to={`/certificate/${cert.id}`}
                  className="min-w-[280px] flex-shrink-0 bg-surface rounded-xl p-5 border border-outline-variant shadow-sm hover:shadow-md hover:border-secondary transition-all group cursor-pointer"
                >
                  <div className="h-36 rounded-xl mb-4 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/20 relative flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-[72px] text-secondary opacity-80 group-hover:scale-110 transition-transform"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      workspace_premium
                    </span>
                    <div className="absolute top-2 right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[14px]">verified</span>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-primary group-hover:text-secondary transition-colors line-clamp-2">
                    {cert.course_title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 mb-3">Issued {cert.issue_date_short}</p>
                  {cert.tools_mastered?.length > 0 && (
                    <p className="text-xs text-on-surface-variant line-clamp-1">
                      Tools: {cert.tools_mastered.join(', ')}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      Verified
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-mono truncate">
                      {cert.certificate_number}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-10 md:px-16">
              <div className="bg-surface rounded-xl p-10 text-center border border-outline-variant">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">workspace_premium</span>
                <p className="text-on-surface-variant mb-4">No certificates yet. Complete a course to earn your first!</p>
                <Link
                  to="/courses"
                  className="inline-block px-6 py-2 bg-secondary text-on-secondary rounded-lg font-bold hover:opacity-90 transition"
                >
                  Browse Courses →
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ── Notification preferences ──────────────────────────────────── */}
        <section className="px-10 md:px-16 mt-12">
          <div className="bg-surface rounded-xl p-8 md:p-12 shadow-sm border border-outline-variant">
            <h2 className="text-2xl font-semibold text-primary mb-8">Notification Preferences</h2>
            <div className="space-y-6 divide-y divide-outline-variant">

              {[
                {
                  id: 'email-toggle',
                  label: 'Email Notifications',
                  desc: 'Weekly progress reports, course recommendations, and platform updates.',
                  checked: emailNotif,
                  onChange: (e) => setEmailNotif(e.target.checked),
                },
                {
                  id: 'push-toggle',
                  label: 'Push Notifications',
                  desc: 'Reminders for daily streaks, live lab sessions, and mentor messages.',
                  checked: pushNotif,
                  onChange: (e) => setPushNotif(e.target.checked),
                },
                {
                  id: 'alert-toggle',
                  label: 'Critical Alerts',
                  desc: 'Security notices and account-related billing alerts.',
                  checked: criticalAlerts,
                  onChange: () => {},
                  disabled: true,
                },
              ].map(({ id, label, desc, checked, onChange, disabled }) => (
                <div key={id} className="flex items-center justify-between pt-6 first:pt-0">
                  <div className="pr-8">
                    <h4 className="text-lg font-semibold text-primary">{label}</h4>
                    <p className="text-on-surface-variant text-sm mt-1">{desc}</p>
                  </div>
                  <Toggle id={id} checked={checked} onChange={onChange} disabled={disabled} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Danger zone ──────────────────────────────────────────────── */}
        <section className="px-10 md:px-16 mt-10">
          <div className="bg-surface rounded-xl p-8 border border-error/20">
            <h2 className="text-lg font-semibold text-error mb-2">Danger Zone</h2>
            <p className="text-on-surface-variant text-sm mb-4">
              Actions here are irreversible. Please be certain before proceeding.
            </p>
            <button className="px-5 py-2 border border-error text-error rounded-lg text-sm font-semibold hover:bg-error hover:text-white transition">
              Delete Account
            </button>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="w-full mt-16 bg-primary ml-64">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-16 py-10 max-w-[1280px] mx-auto text-on-primary">
          <div className="md:col-span-1">
            <span className="text-xl font-bold text-secondary-fixed block mb-4">SkillBridge</span>
            <p className="text-sm text-on-primary-fixed-variant">
              Empowering lifelong learners with cutting-edge AI and data science training.
            </p>
          </div>
          {[
            { heading: 'Explore',  links: ['About Us', 'Careers', 'API Docs'] },
            { heading: 'Support',  links: ['Contact Support', 'Privacy Policy', 'Terms of Service'] },
          ].map(({ heading, links }) => (
            <div key={heading} className="flex flex-col gap-2">
              <h5 className="text-sm uppercase font-semibold mb-2">{heading}</h5>
              {links.map(l => (
                <a key={l} href="#" className="text-on-primary-fixed-variant hover:text-secondary-fixed transition text-sm">{l}</a>
              ))}
            </div>
          ))}
          <div>
            <h5 className="text-sm uppercase font-semibold mb-3">Newsletter</h5>
            <p className="text-sm text-on-primary-fixed-variant mb-4">Stay updated with the latest AI trends.</p>
            <div className="flex">
              <input
                className="bg-white/10 border-0 rounded-l-lg px-3 py-2 w-full text-white placeholder:text-white/50 focus:ring-1 focus:ring-secondary outline-none text-sm"
                placeholder="Email address"
                type="email"
              />
              <button className="bg-secondary px-3 rounded-r-lg hover:bg-secondary/80 transition">
                <span className="material-symbols-outlined text-white">send</span>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-16 py-4 border-t border-white/10">
          <p className="text-sm text-on-primary-fixed-variant text-center">
            © 2024 SkillBridge AI. Empowering lifelong learners globally.
          </p>
        </div>
      </footer>
    </div>
  );
}
