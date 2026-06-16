import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Award, Sparkles, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import axios from 'axios';

// ── Simple Public Top Navigation Bar ──────────────────────────────────────────
function PublicTopBar() {
  return (
    <header className="bg-surface shadow-sm w-full sticky top-0 z-50 border-b border-outline-variant">
      <nav className="flex justify-between items-center px-8 md:px-16 max-w-7xl mx-auto w-full h-16">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold text-primary">SkillBridge</Link>
          <span className="text-xs px-2.5 py-1 bg-secondary-container text-on-secondary-container rounded-full font-bold uppercase tracking-wider hidden sm:inline-block">
            Verification Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-primary hover:text-secondary transition">
            Sign In
          </Link>
          <Link to="/signup" className="bg-secondary text-on-secondary text-xs md:text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition">
            Start Learning
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default function CertificateVerification() {
  const { hash } = useParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`/api/certificates/verify/${hash}`);
        if (res.data && res.data.valid) {
          setVerified(true);
          setCertData(res.data.certificate);
        } else {
          setVerified(false);
        }
      } catch (err) {
        console.error('Error verifying certificate:', err);
        setError('Unable to reach the verification server. Please try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, [hash]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <PublicTopBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-secondary mx-auto" />
            <p className="text-on-surface-variant text-sm font-medium">Verifying credential against registry...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !verified) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <PublicTopBar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-outline-variant p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-error-container rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="text-error" size={42} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-primary">Verification Failed</h2>
              <p className="text-on-surface-variant text-sm">
                {error || 'This certificate record could not be found or has been revoked. Please check the URL and try again.'}
              </p>
            </div>
            <div className="pt-4 border-t border-outline-variant flex flex-col gap-3">
              <Link to="/" className="w-full py-2.5 bg-secondary text-on-secondary rounded-xl font-semibold hover:opacity-95 transition text-sm">
                Go to SkillBridge Homepage
              </Link>
              <Link to="/login" className="w-full py-2.5 border border-outline-variant text-primary rounded-xl font-semibold hover:bg-surface-container-low transition text-sm">
                Login to Your Account
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <PublicTopBar />

      <main className="max-w-7xl mx-auto px-6 md:px-16 py-12 flex-1 w-full">
        {/* Verification Alert Banner */}
        <div className="mb-10 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="text-emerald-600" size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-950">Verified Certificate</h2>
              <p className="text-emerald-700 text-xs font-medium">
                This digital credential is valid and has been officially issued by SkillBridge Academy.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs bg-emerald-500/10 text-emerald-800 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
              Status: Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Certificate Card Preview */}
          <div className="lg:col-span-8">
            <div className="relative bg-white rounded-2xl shadow-2xl border-t-4 border-emerald-500 overflow-hidden">
              <div className="p-8 md:p-14 border-[10px] border-double border-outline-variant m-4 relative">
                {/* Corner accents */}
                {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2',
                  'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((cls, i) => (
                  <div key={i} className={`absolute w-8 h-8 border-emerald-500 ${cls}`} />
                ))}

                <div className="flex flex-col items-center text-center space-y-4">
                  <span className="text-lg font-bold text-primary tracking-widest opacity-50 uppercase">
                    SkillBridge Academy
                  </span>

                  <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center ring-4 ring-emerald-500/20">
                    <Award className="text-emerald-600" size={36} />
                  </div>

                  <h2 className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
                    Certificate of Achievement
                  </h2>

                  <div className="space-y-1">
                    <p className="text-on-surface-variant italic text-xs">This is to certify that</p>
                    <p className="text-3xl md:text-4xl font-bold text-primary">{certData.holder_name}</p>
                  </div>

                  <p className="text-on-surface-variant text-xs max-w-md">
                    has successfully completed the comprehensive professional development programme
                  </p>

                  <p className="text-xl font-bold text-emerald-700">{certData.course_title}</p>

                  {certData.tools_mastered?.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 pt-1">
                      {certData.tools_mastered.map(tool => (
                        <span
                          key={tool}
                          className="flex items-center gap-1 px-2.5 py-1 bg-surface-container rounded-lg border border-outline-variant text-xs font-medium"
                        >
                          <ShieldCheck size={11} className="text-emerald-600" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 w-full pt-8 border-t border-outline-variant mt-4 gap-4">
                    <div className="text-left">
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-wider mb-0.5">Completion Date</p>
                      <p className="font-bold text-xs text-primary">{certData.issue_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-wider mb-0.5">Verification ID</p>
                      <p className="text-xs font-bold text-emerald-700 font-mono">{certData.certificate_number}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Audit Trail & CTA */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-outline-variant p-6">
              <h3 className="text-base font-semibold text-primary mb-4">Verification Audit</h3>
              <div className="space-y-4">
                {[
                  { label: 'Recipient Holder', value: certData.holder_name },
                  { label: 'Credential Name', value: certData.course_title },
                  { label: 'Certificate ID', value: certData.certificate_number, mono: true },
                  { label: 'Completion Date', value: certData.issue_date },
                  { label: 'Skills/Tools Mastered', value: certData.tools_mastered?.join(', ') || 'N/A' },
                  { label: 'Registry Status', value: 'Active & Validated', highlight: true }
                ].map(({ label, value, mono, highlight }) => (
                  <div key={label} className="border-b border-outline-variant pb-3 last:border-0 last:pb-0">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-0.5">{label}</p>
                    <p className={`text-sm font-semibold ${highlight ? 'text-emerald-700' : 'text-primary'} truncate ${mono ? 'font-mono text-xs' : ''}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Public Promo CTA */}
            <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              {/* background decorative element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={12} className="text-secondary-fixed" />
                  Upskill with AI
                </div>
                <h3 className="text-lg font-bold">Earn industry-recognised certifications</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Join thousands of professionals masterminding AI tools, automating workflows, and advancing their careers.
                </p>
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-secondary text-on-secondary rounded-xl font-bold hover:opacity-90 transition text-sm"
                >
                  Create Free Account
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Small Public Footer */}
      <footer className="bg-primary border-t border-white/10 mt-16 py-6">
        <div className="max-w-7xl mx-auto px-8 md:px-16 flex flex-col md:flex-row justify-between items-center gap-4 text-white/60 text-xs">
          <p>© 2024 SkillBridge Academy. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link to="/courses" className="hover:text-white transition">Browse Courses</Link>
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
