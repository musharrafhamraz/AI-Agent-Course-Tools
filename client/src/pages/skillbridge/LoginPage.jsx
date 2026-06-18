import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError('');
        // The tokenResponse.access_token is the Google access token
        // We need to exchange it for user info and send the ID token to our backend
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info from Google');
        }

        // For our backend, we'll use the access_token as id_token
        // (In production, you should use the actual ID token from the authorization code flow)
        await googleLogin(tokenResponse.access_token);
        navigate('/dashboard');
      } catch (err) {
        console.error('Google login error:', err);
        setError(err.response?.data?.detail || 'Google login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setError('Google login failed. Please try again.');
    },
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <section className="hidden md:flex md:w-[40%] bg-gradient-to-br from-[#00071b] to-[#0f1f3d] relative overflow-hidden flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎓</span>
            <span className="text-2xl font-bold">SkillBridge</span>
          </div>
        </div>
        <div className="max-w-sm">
          <img className="w-full rounded-xl shadow-2xl mb-8" src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600" alt="Learning" />
          <h1 className="text-4xl font-bold mb-6 leading-tight">Your journey to mastery continues.</h1>
          <p className="text-lg opacity-90 italic">"The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."</p>
          <p className="mt-2 text-teal-400">— Brian Herbert</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-primary bg-gray-300"></div>
            <div className="w-8 h-8 rounded-full border-2 border-primary bg-gray-400"></div>
            <div className="w-8 h-8 rounded-full border-2 border-primary bg-gray-500"></div>
          </div>
          <span className="text-sm opacity-70">Joined by 10k+ professionals this month</span>
        </div>
      </section>

      {/* Right Panel */}
      <section className="flex-1 bg-surface flex items-center justify-center p-6 md:p-12 relative">
        <div className="absolute top-6 left-6 flex md:hidden items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="text-xl font-bold text-primary">SkillBridge</span>
        </div>

        <div className="w-full max-w-[440px]">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2">Welcome back</h2>
            <p className="text-on-surface-variant">Please enter your details to access your dashboard.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                placeholder="name@company.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-on-surface-variant">Password</label>
                <a className="text-sm text-secondary hover:underline" href="#">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface px-4 text-on-surface-variant">or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          <p className="mt-8 text-center text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/signup" className="text-secondary font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
