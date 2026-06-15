import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Download, Share2, Copy, CheckCircle, Award, Sparkles, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

// ── confetti ──────────────────────────────────────────────────────────────────
function launchConfetti() {
  const colors = ['#006b55', '#5df8ce', '#00071b', '#ffddb4', '#ffffff'];
  for (let i = 0; i < 70; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;pointer-events:none;z-index:9999;
      width:${Math.random() * 9 + 4}px;height:${Math.random() * 9 + 4}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      left:${Math.random() * 100}vw;top:-20px;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      transform:rotate(${Math.random() * 360}deg);
    `;
    document.body.appendChild(el);
    el.animate(
      [
        { top: '-20px', opacity: 1, transform: `translate(0,0) rotate(0deg)` },
        { top: '100vh', opacity: 0, transform: `translate(${Math.random() * 200 - 100}px,0) rotate(${Math.random() * 1200}deg)` },
      ],
      { duration: Math.random() * 3000 + 2000, easing: 'cubic-bezier(0,0.9,0.91,1)' }
    ).onfinish = () => el.remove();
  }
}

// ── Certificate card (printable) ─────────────────────────────────────────────
function CertCard({ cert, userName }) {
  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border-t-4 border-secondary overflow-hidden">
      {/* shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="p-10 md:p-16 border-[10px] border-double border-outline-variant m-4 relative">
        {/* Corner accents */}
        {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2',
          'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((cls, i) => (
          <div key={i} className={`absolute w-10 h-10 border-secondary ${cls}`} />
        ))}

        <div className="flex flex-col items-center text-center space-y-5">
          {/* Academy name */}
          <span className="text-xl font-bold text-primary tracking-widest opacity-50 uppercase">
            SkillBridge Academy
          </span>

          {/* Seal */}
          <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center ring-4 ring-secondary/30">
            <Award className="text-secondary" size={42} />
          </div>

          <h2 className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
            Certificate of Achievement
          </h2>

          {/* Recipient */}
          <div className="space-y-1">
            <p className="text-on-surface-variant italic text-sm">This is to certify that</p>
            <p className="text-4xl md:text-5xl font-bold text-primary">{userName}</p>
          </div>

          <p className="text-on-surface-variant text-sm max-w-md">
            has successfully completed the comprehensive professional development programme
          </p>

          <p className="text-2xl font-bold text-secondary">{cert.course_title}</p>

          {/* Tool badges */}
          {cert.tools_mastered?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {cert.tools_mastered.map(tool => (
                <span
                  key={tool}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant text-sm font-medium"
                >
                  <ShieldCheck size={13} className="text-secondary" />
                  {tool}
                </span>
              ))}
            </div>
          )}

          {/* Footer meta */}
          <div className="grid grid-cols-2 w-full pt-10 border-t border-outline-variant mt-6 gap-4">
            <div className="text-left">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Completion Date</p>
              <p className="font-bold text-primary">{cert.issue_date_display}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Verification ID</p>
              <p className="text-sm font-bold text-secondary font-mono">{cert.certificate_number}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Certificate() {
  const { id } = useParams();          // optional cert id from route /certificate/:id
  const navigate = useNavigate();

  const [certs, setCerts]         = useState([]);
  const [userName, setUserName]   = useState('');
  const [activeCert, setActive]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [copied, setCopied]       = useState(false);
  const [issuing, setIssuing]     = useState(false);
  const [issueError, setIssueErr] = useState('');
  const confettiFired             = useRef(false);

  // ── fetch all certs ──────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/certificates/my-certificates');
        const data = res.data;
        setCerts(data.certificates || []);
        setUserName(data.full_name || '');

        if (data.certificates?.length > 0) {
          // If route has :id, try to show that cert; else show first
          const target = id
            ? data.certificates.find(c => String(c.id) === String(id)) || data.certificates[0]
            : data.certificates[0];
          setActive(target);

          // Fire confetti once if we have certs
          if (!confettiFired.current) {
            confettiFired.current = true;
            setTimeout(launchConfetti, 400);
          }
        }
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login', { state: { message: 'Please log in to view your certificates.' } });
        } else {
          setError('Could not load certificates. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleCopy = () => {
    if (!activeCert) return;
    const url = `${window.location.origin}/certificate/verify/${activeCert.verification_hash}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLinkedIn = () => {
    if (!activeCert) return;
    const url = encodeURIComponent(`${window.location.origin}/certificate/verify/${activeCert.verification_hash}`);
    const title = encodeURIComponent(`I just earned my "${activeCert.course_title}" certificate on SkillBridge! 🎓`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${title}`, '_blank');
  };

  const handleIssueCurrent = async (courseId) => {
    setIssuing(true);
    setIssueErr('');
    try {
      const res = await axios.post('/api/certificates/issue', { course_id: courseId });
      const newCert = res.data;
      setCerts(prev => {
        const exists = prev.find(c => c.id === newCert.id);
        return exists ? prev : [newCert, ...prev];
      });
      setActive(newCert);
      launchConfetti();
    } catch (err) {
      setIssueErr(err.response?.data?.detail || 'Could not issue certificate. Make sure the course is 100% complete.');
    } finally {
      setIssuing(false);
    }
  };

  // ── loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-secondary mx-auto" />
          <p className="text-on-surface-variant text-sm">Loading your certificates…</p>
        </div>
      </div>
    );
  }

  // ── error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          <span className="material-symbols-outlined text-5xl text-error">error</span>
          <p className="text-on-surface-variant">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-secondary text-on-secondary rounded-lg font-bold">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── no certs yet ─────────────────────────────────────────────────────────
  if (certs.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <TopBar userName={userName} />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-6 max-w-lg">
            <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mx-auto">
              <Award size={48} className="text-secondary" />
            </div>
            <h2 className="text-3xl font-bold text-primary">No Certificates Yet</h2>
            <p className="text-on-surface-variant">
              Complete a course to earn your first SkillBridge certificate. Each certificate is blockchain-verified and shareable on LinkedIn.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-8 py-3 rounded-lg font-bold hover:opacity-90 transition"
            >
              Browse Courses →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── active index ──────────────────────────────────────────────────────────
  const activeIdx = certs.findIndex(c => c.id === activeCert?.id);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopBar userName={userName} />

      <main className="max-w-7xl mx-auto px-6 md:px-16 py-12 flex-1 w-full">

        {/* ── Celebration header ───────────────────────────────────────── */}
        <section className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold mb-6 uppercase tracking-wider">
            <Sparkles size={14} />
            Programme Completed
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">
            Congratulations, {userName.split(' ')[0]}!
          </h1>
          <p className="text-on-surface-variant max-w-xl mx-auto">
            You have earned {certs.length} certificate{certs.length !== 1 ? 's' : ''} on SkillBridge.
            Each is blockchain-verified and industry recognised.
          </p>

          {/* Cert switcher (if multiple) */}
          {certs.length > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setActive(certs[Math.max(0, activeIdx - 1)])}
                disabled={activeIdx === 0}
                className="p-2 rounded-full border border-outline-variant hover:bg-surface-container disabled:opacity-30 transition"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-on-surface-variant font-medium">
                {activeIdx + 1} / {certs.length}
              </span>
              <button
                onClick={() => setActive(certs[Math.min(certs.length - 1, activeIdx + 1)])}
                disabled={activeIdx === certs.length - 1}
                className="p-2 rounded-full border border-outline-variant hover:bg-surface-container disabled:opacity-30 transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Certificate preview ────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-5">
            {activeCert && <CertCard cert={activeCert} userName={userName} />}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition shadow-md">
                <Download size={18} />
                Download PDF
              </button>
              <button
                onClick={handleLinkedIn}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-secondary text-white rounded-xl font-semibold hover:opacity-90 transition shadow-md"
              >
                <Share2 size={18} />
                Share on LinkedIn
              </button>
              <button
                onClick={handleCopy}
                title="Copy verification link"
                className="px-4 py-3.5 border border-outline-variant rounded-xl hover:bg-surface-container transition text-primary"
              >
                {copied ? <CheckCircle size={20} className="text-secondary" /> : <Copy size={20} />}
              </button>
            </div>

            {copied && (
              <p className="text-xs text-secondary font-medium text-center animate-fade-in">
                ✅ Verification link copied to clipboard!
              </p>
            )}

            {/* Verification URL display */}
            {activeCert && (
              <div className="flex items-center gap-2 bg-surface-container-low rounded-xl px-4 py-3 border border-outline-variant">
                <ShieldCheck size={16} className="text-secondary shrink-0" />
                <p className="text-xs text-on-surface-variant font-mono truncate">
                  {window.location.origin}/certificate/verify/{activeCert.verification_hash}
                </p>
              </div>
            )}
          </div>

          {/* ── Sidebar ────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">

            {/* All certificates list */}
            {certs.length > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-outline-variant p-5">
                <h3 className="text-base font-semibold text-primary mb-4">All Certificates</h3>
                <div className="space-y-2">
                  {certs.map(cert => (
                    <button
                      key={cert.id}
                      onClick={() => setActive(cert)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        activeCert?.id === cert.id
                          ? 'border-secondary bg-secondary-container'
                          : 'border-outline-variant hover:border-secondary hover:bg-surface-container'
                      }`}
                    >
                      <p className="text-sm font-semibold text-primary line-clamp-1">{cert.course_title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{cert.issue_date_short}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-outline-variant p-5">
              <h3 className="text-base font-semibold text-primary mb-4">Certificate Details</h3>
              {activeCert && (
                <div className="space-y-3">
                  {[
                    { label: 'Certificate ID',    value: activeCert.certificate_number },
                    { label: 'Issue Date',         value: activeCert.issue_date_display },
                    { label: 'Tools Mastered',     value: activeCert.tools_mastered?.join(', ') || '—' },
                    { label: 'Verification Hash',  value: activeCert.verification_hash, mono: true },
                  ].map(({ label, value, mono }) => (
                    <div key={label} className="border-b border-outline-variant pb-3 last:border-0 last:pb-0">
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-0.5">{label}</p>
                      <p className={`text-sm font-semibold text-primary truncate ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* What's Next */}
            <div className="bg-white rounded-2xl shadow-sm border-t-4 border-secondary p-5">
              <h3 className="text-base font-semibold text-primary mb-2">What's Next?</h3>
              <p className="text-sm text-on-surface-variant mb-4">Keep the momentum going with another course.</p>
              <Link
                to="/courses"
                className="block w-full py-2.5 text-center border border-secondary text-secondary rounded-xl font-semibold hover:bg-secondary hover:text-white transition text-sm"
              >
                Browse More Courses →
              </Link>
              <Link
                to="/progress"
                className="block w-full mt-2 py-2.5 text-center bg-surface-container-low text-primary rounded-xl font-semibold hover:bg-secondary-container transition text-sm"
              >
                View Progress Tracker
              </Link>
            </div>

            {/* Issue certificate for completed course (helper CTA) */}
            <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant">
              <h3 className="text-sm font-semibold text-primary mb-2">Completed a course?</h3>
              <p className="text-xs text-on-surface-variant mb-3">
                If you've finished all modules, claim your certificate below.
              </p>
              <Link
                to="/courses"
                className="block w-full py-2 text-center text-xs font-bold text-secondary hover:underline"
              >
                Go to My Courses →
              </Link>
              {issueError && (
                <p className="text-xs text-error mt-2">{issueError}</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary mt-16">
        <div className="max-w-7xl mx-auto px-16 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
          <div>
            <span className="text-xl font-bold text-secondary-fixed block mb-3">SkillBridge AI</span>
            <p className="text-on-primary-fixed-variant text-sm">
              Empowering lifelong learners globally through AI-driven education.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase">Explore</h4>
            <div className="flex flex-col gap-2 text-sm text-on-primary-fixed-variant">
              <Link to="/courses" className="hover:text-secondary-fixed transition">Courses</Link>
              <Link to="/progress" className="hover:text-secondary-fixed transition">Progress</Link>
              <Link to="/mentor" className="hover:text-secondary-fixed transition">AI Mentor</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase">Support</h4>
            <div className="flex flex-col gap-2 text-sm text-on-primary-fixed-variant">
              {['Privacy Policy', 'Terms of Service', 'Contact'].map(l => (
                <a key={l} href="#" className="hover:text-secondary-fixed transition">{l}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-16 py-4 border-t border-white/10">
          <p className="text-sm text-on-primary-fixed-variant text-center">
            © 2024 SkillBridge AI. All certificates are verified and tamper-proof.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Top navigation bar ────────────────────────────────────────────────────────
function TopBar({ userName }) {
  return (
    <header className="bg-surface shadow-sm w-full sticky top-0 z-50 border-b border-outline-variant">
      <nav className="flex justify-between items-center px-8 md:px-16 max-w-7xl mx-auto w-full h-16">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold text-primary">SkillBridge</Link>
          <div className="hidden md:flex gap-5 items-center text-sm">
            <Link to="/dashboard" className="text-on-surface-variant hover:text-secondary transition-colors">Dashboard</Link>
            <Link to="/courses"   className="text-on-surface-variant hover:text-secondary transition-colors">Courses</Link>
            <Link to="/progress"  className="text-on-surface-variant hover:text-secondary transition-colors">Progress</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/notifications" className="p-2 rounded-full hover:bg-surface-container-low transition">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </Link>
          <Link to="/profile" className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </Link>
        </div>
      </nav>
    </header>
  );
}
