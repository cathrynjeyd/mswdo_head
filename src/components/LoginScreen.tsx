import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Eye, EyeOff, ShieldAlert, LogIn, ShieldCheck } from 'lucide-react';
import { FocalPerson, UserSession } from '../types';
import { sha256 } from '../utils/security';

interface LoginScreenProps {
  focalPersons: FocalPerson[];
  onLoginSuccess: (session: UserSession) => void;
}

export default function LoginScreen({ focalPersons, onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('admin_official');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      setIsLoading(false);
      
      // 1. Check MSWDO Head official account
      if (username.toLowerCase() === 'admin_official' && password === 'password123') {
        onLoginSuccess({
          username: 'admin_official',
          role: 'head',
          name: 'Catherine Jade',
          email: 'catherinejade.original@wvsu.edu.ph',
          profilePic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
        });
        return;
      }

      // 2. Check Focal Person accounts
      const focal = focalPersons.find(
        f => f.username?.toLowerCase() === username.trim().toLowerCase()
      );

      if (focal) {
        const inputHash = sha256(password);
        if (focal.passwordHash === inputHash) {
          // Account found and password matches! Check status
          if (focal.status === 'Inactive') {
            setError('Your account is inactive. Please contact the MSWDO Head.');
            return;
          }
          
          onLoginSuccess({
            username: focal.username || username,
            role: 'focal',
            focalId: focal.id,
            name: focal.name,
            email: focal.email,
            position: focal.position,
            profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
          });
        } else {
          setError('Incorrect password. Please verify your credentials.');
        }
      } else {
        setError('Authentication failed. Account username not found.');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements with subtle ambient blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-surface-container-high rounded-full blur-[140px] opacity-70"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-secondary-fixed opacity-50 rounded-full blur-[140px]"></div>
      </div>

      <main className="w-full max-w-[440px] flex flex-col gap-8 relative z-10">
        {/* Logo/Header Section */}
        <header className="flex flex-col items-center text-center gap-2 mb-2">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border border-outline-variant overflow-hidden p-2 mb-4"
          >
            <img 
              className="w-full h-full object-contain" 
              alt="MSWDO Municipal Seal"
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-pkcNkVk7yNpApbpDvdE7MAiOMEg6_vGN8VEi1vGxAfNos4w0vlGU2hmmm7wgNZHEn6cnCyesoBxKS4Gg_3P4EYSPUNF7IFlhSeSLqkOicMATWsbU74lFFz7Q5BgOUIMtB1DtHSZ_eIPF-eK9q-90_IaNQu5V_Tm5LybasxpbhFjYr4OcLpKGRocgFDtaPwQ9eOPrDBLuZf7RuUKefdQsFolrgTdTgZl1HXXUJz9GDkQBlvKAODoeKm44y_N3KpxlO-wZTLiWIAqk" 
            />
          </motion.div>
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight font-bold">MSWDO Head Portal</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[320px] leading-relaxed">
            Secure administrative access for Municipal Social Welfare and Development Officers.
          </p>
        </header>

        {/* Login Form Card */}
        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-surface-container-lowest shadow-xl rounded-xl border border-outline-variant p-8 md:p-10"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-6" id="loginForm">
            {error && (
              <div className="bg-error/5 text-error text-xs p-3.5 rounded-lg border border-error/20 flex items-start gap-2 font-bold">
                <ShieldAlert className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {/* Username Input */}
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-primary uppercase tracking-widest px-1 font-bold" htmlFor="username">
                Username
              </label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  <User className="w-5 h-5" />
                </span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-body-md font-body-md placeholder:text-outline text-on-surface" 
                  id="username" 
                  name="username" 
                  placeholder="e.g. admin_official" 
                  required 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-primary uppercase tracking-widest px-1 font-bold" htmlFor="password">
                  Password
                </label>
                <a className="text-[11px] font-bold text-secondary hover:underline transition-all" href="#forgot">
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </span>
                <input 
                  className="w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-body-md font-body-md placeholder:text-outline text-on-surface" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none" 
                  onClick={() => setShowPassword(!showPassword)} 
                  type="button"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 px-1">
              <input 
                className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary accent-primary cursor-pointer" 
                id="remember" 
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
              />
              <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer select-none font-medium" htmlFor="remember">
                Remember this device
              </label>
            </div>

            {/* Login Button */}
            <button 
              className={`mt-2 w-full bg-primary text-on-primary font-bold py-4 rounded-lg shadow-md hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group ${
                isLoading ? 'opacity-80 cursor-not-allowed' : ''
              }`} 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-base">Secure Login</span>
                  <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Secure Stamp */}
          <div className="mt-8 pt-8 border-t border-outline-variant">
            <div className="flex flex-col gap-4 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant font-medium">
                Authorized Personnel Only
              </p>
              <div className="flex items-center justify-center gap-2 text-outline">
                <ShieldCheck className="w-5 h-5 text-secondary fill-secondary/10" />
                <span className="font-label-md text-label-md uppercase tracking-wider text-xs font-bold text-on-surface-variant">Government-Grade Security Enabled</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="flex flex-col gap-2 text-center opacity-70">
          <p className="font-label-md text-label-md text-on-surface-variant font-medium">
            © 2024 MSWDO Municipal Government. All Rights Reserved.
          </p>
          <div className="flex justify-center gap-4">
            <a className="font-label-md text-label-md text-secondary hover:underline font-bold" href="#privacy">Privacy Policy</a>
            <span className="text-outline-variant text-xs">•</span>
            <a className="font-label-md text-label-md text-secondary hover:underline font-bold" href="#support">Support Desk</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
