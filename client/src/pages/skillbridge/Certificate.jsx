import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Download, Share2, Copy, CheckCircle, Award, Sparkles, ShieldCheck, ChevronLeft, ChevronRight, Share } from 'lucide-react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  const [downloading, setDownloading] = useState(false);
  const [instagramModalOpen, setInstagramModalOpen] = useState(false);
  const certRef = useRef(null);

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
  const getVerificationUrl = () => {
    if (!activeCert) return '';
    return `${window.location.origin}/certificate/verify/${activeCert.verification_hash}`;
  };

  const handleCopy = () => {
    const url = getVerificationUrl();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLinkedInPost = () => {
    const url = encodeURIComponent(getVerificationUrl());
    if (!url) return;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleLinkedInAddToProfile = () => {
    if (!activeCert) return;
    const url = encodeURIComponent(getVerificationUrl());
    const name = encodeURIComponent(activeCert.course_title);
    const org = encodeURIComponent("SkillBridge Academy");
    
    // Parse issue month and year
    const dateParts = activeCert.issue_date_display ? activeCert.issue_date_display.split(' ') : [];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const issueMonth = dateParts[0] ? monthNames.indexOf(dateParts[0].replace(',', '')) + 1 : new Date().getMonth() + 1;
    const issueYear = dateParts[2] ? parseInt(dateParts[2]) : new Date().getFullYear();
    
    window.open(`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${name}&organizationName=${org}&certUrl=${url}&certId=${activeCert.certificate_number}&issueYear=${issueYear}&issueMonth=${issueMonth}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(getVerificationUrl());
    if (!url) return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    if (!activeCert) return;
    const url = getVerificationUrl();
    const text = encodeURIComponent(`I'm thrilled to share that I just earned my "${activeCert.course_title}" certification on SkillBridge! 🎓 View my verified certificate here: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareInstagram = () => {
    const url = getVerificationUrl();
    if (!url) return;
    // Copy the link to clipboard first for convenience
    navigator.clipboard.writeText(url);
    setInstagramModalOpen(true);
  };

  const handleDownloadPDF = async () => {
    if (!activeCert || !certRef.current) return;
    setDownloading(true);
    try {
      const element = certRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2.5, // Crisp high-res rendering
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const ratio = canvas.width / canvas.height;
      let width = pdfWidth;
      let height = pdfWidth / ratio;
      
      if (height > pdfHeight) {
        height = pdfHeight;
        width = pdfHeight * ratio;
      }
      
      const x = (pdfWidth - width) / 2;
      const y = (pdfHeight - height) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, width, height);
      
      const safeUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');
      const safeCourseTitle = activeCert.course_title.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`SkillBridge_Certificate_${safeUserName}_${safeCourseTitle}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
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
            {activeCert && (
              <div ref={certRef} className="print-container">
                <CertCard cert={activeCert} userName={userName} />
              </div>
            )}

            {/* Action buttons / Share Suite */}
            <div className="bg-white rounded-2xl shadow-sm border border-outline-variant p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-primary mb-1">Download & Share</h3>
                <p className="text-xs text-on-surface-variant">Export your official certificate or share it directly to your professional networks.</p>
              </div>

              {/* Main Actions: Download and Copy Link */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-75 transition shadow-sm text-sm"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Download PDF
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-outline-variant rounded-xl font-bold hover:bg-surface-container-low transition text-primary text-sm"
                >
                  {copied ? (
                    <>
                      <CheckCircle size={16} className="text-secondary" />
                      <span className="text-secondary">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy Verification Link
                    </>
                  )}
                </button>
              </div>

              {/* Social Share Grid */}
              <div className="pt-4 border-t border-outline-variant space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Share to Social Networks</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* LinkedIn Share Post */}
                  <button
                    onClick={handleLinkedInPost}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-outline-variant hover:bg-blue-50/10 hover:border-blue-300 transition text-left text-sm font-semibold text-primary"
                  >
                    <svg className="w-5 h-5 text-[#0A66C2] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    <span>LinkedIn (Share Post)</span>
                  </button>

                  {/* LinkedIn Add to Profile */}
                  <button
                    onClick={handleLinkedInAddToProfile}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-outline-variant hover:bg-emerald-50/10 hover:border-emerald-300 transition text-left text-sm font-semibold text-primary"
                  >
                    <svg className="w-5 h-5 text-[#0A66C2] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z" />
                    </svg>
                    <span>LinkedIn (Add to Profile)</span>
                  </button>

                  {/* Facebook Share */}
                  <button
                    onClick={handleShareFacebook}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-outline-variant hover:bg-blue-50/10 hover:border-blue-300 transition text-left text-sm font-semibold text-primary"
                  >
                    <svg className="w-5 h-5 text-[#1877F2] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </button>

                  {/* WhatsApp Share */}
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-outline-variant hover:bg-emerald-50/10 hover:border-emerald-300 transition text-left text-sm font-semibold text-primary"
                  >
                    <svg className="w-5 h-5 text-[#25D366] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </button>

                  {/* Instagram Share */}
                  <button
                    onClick={handleShareInstagram}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-outline-variant hover:bg-pink-50/10 hover:border-pink-300 transition text-left text-sm font-semibold text-primary"
                  >
                    <svg className="w-5 h-5 text-[#E1306C] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845a1.44 1.44 0 100-2.881 1.44 1.44 0 000 2.881z"/>
                    </svg>
                    <span>Instagram</span>
                  </button>

                </div>
              </div>

              {/* Verification Info */}
              <div className="flex items-center gap-2 bg-emerald-50/30 text-emerald-800 rounded-xl px-4 py-3 border border-emerald-100">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0 animate-pulse" />
                <p className="text-xs font-semibold">
                  This certificate has a verified status and can be checked publicly on the registry.
                </p>
              </div>
            </div>
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

      {/* Instagram Instruction Modal */}
      {instagramModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant relative space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-[#E1306C]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845a1.44 1.44 0 100-2.881 1.44 1.44 0 000 2.881z"/>
                </svg>
                <h3 className="text-lg font-bold text-primary">Share on Instagram</h3>
              </div>
              <button
                onClick={() => setInstagramModalOpen(false)}
                className="text-on-surface-variant hover:text-primary p-1.5 rounded-full hover:bg-surface-container transition flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
              <p>
                Instagram does not support direct link sharing. However, you can easily share your verified credential to your Feed or Story:
              </p>
              <div className="space-y-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                  <p>Your verification link has been **copied to your clipboard**!</p>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                  <p>Click below to download your certificate PDF.</p>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                  <p>Post the PDF/screenshot on Instagram, and paste the copied link as a **Link Sticker** in your story!</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  handleDownloadPDF();
                  setInstagramModalOpen(false);
                }}
                className="w-full py-3 bg-[#E1306C] text-white rounded-xl font-bold hover:bg-[#c1205c] transition flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <Download size={16} />
                Download PDF & Continue
              </button>
              <button
                onClick={() => setInstagramModalOpen(false)}
                className="w-full py-2.5 border border-outline-variant text-primary rounded-xl font-semibold hover:bg-surface-container-low transition text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
