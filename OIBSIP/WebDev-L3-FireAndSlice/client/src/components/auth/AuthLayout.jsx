import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateEmail, validatePassword } from '../../utils/helpers';

export function AuthLayout({ children, title, subtitle, footer }) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container/15 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2a211a] border border-primary-container/40 shadow-[0_0_35px_rgba(244,98,48,0.3)] mb-4">
            <span className="material-symbols-outlined text-[36px] text-primary-container">local_fire_department</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-crust-cream tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2.5 text-sm text-[#c4b5a8] font-sans">{subtitle}</p>}
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[#231d17] border border-[#483b30] p-7 sm:p-9 shadow-[0_24px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(244,98,48,0.08)] backdrop-blur-xl">
          {children}
        </div>

        {footer && (
          <p className="mt-6 text-center text-xs text-[#9d9287]">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}

export function LoginForm({ onSwitchToRegister, onSwitchToForgot }) {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      await login(data.token, data.user);
      toast.success(`Welcome back, ${data.user?.name || 'Chef'}!`);
      navigate('/menu');
    } catch (error) {
      setSubmitError(error.message || 'Sign in failed. Please check credentials.');
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setFormData({
      email: 'demo@fireandslice.com',
      password: 'password123'
    });
    setErrors({});
    setSubmitError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Quick Demo Pill */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#2e261f] border border-primary-container/40 shadow-inner">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-primary-container">bolt</span>
          <div>
            <span className="block text-xs text-crust-cream font-mono font-medium">Demo Patron Account</span>
            <span className="block text-[11px] text-[#9d9287] font-mono">demo@fireandslice.com</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleQuickDemo}
          className="text-xs font-mono font-semibold text-primary-container hover:text-ember-glow transition-colors cursor-pointer px-3 py-1.5 rounded-lg bg-primary-container/15 border border-primary-container/30 hover:bg-primary-container/25"
        >
          Fill Demo
        </button>
      </div>

      {submitError && (
        <div className="p-3.5 rounded-xl bg-error-container/25 border border-error/40 text-error text-xs flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
          <span>{submitError}</span>
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        autoComplete="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        error={errors.email}
        placeholder="e.g. patron@fireandslice.com"
        required
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        value={formData.password}
        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        error={errors.password}
        placeholder="Enter your password"
        required
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[#9d9287] hover:text-crust-cream transition-colors p-1 cursor-pointer flex items-center justify-center"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        }
      />

      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 rounded border-[#483b30] text-primary-container focus:ring-primary-container/30 bg-[#14110e]"
          />
          <span className="text-xs text-[#b8a99c]">Remember me</span>
        </label>
        <button
          type="button"
          onClick={onSwitchToForgot}
          className="text-xs text-primary-container hover:text-ember-glow font-medium transition-colors cursor-pointer"
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        fullWidth
        loading={loading}
        className="mt-4 py-3.5 font-title-md uppercase tracking-wider text-sm shadow-[0_8px_24px_-6px_rgba(244,98,48,0.5)] cursor-pointer"
      >
        Sign In
      </Button>

      <div className="pt-4 border-t border-[#3a3026] text-center text-xs text-[#b8a99c]">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-primary-container hover:text-ember-glow font-semibold transition-colors underline cursor-pointer"
        >
          Create an account
        </button>
      </div>
    </form>
  );
}

export function RegisterForm({ onSwitchToLogin }) {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!validatePassword(formData.password)) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.token) {
        await login(data.token, data.user);
        toast.success(`Welcome to FIRE & SLICE, ${data.user?.name || 'Chef'}!`);
        navigate('/menu');
      } else {
        toast.success('Registration successful! Please check your email to verify your account.');
        onSwitchToLogin();
      }
    } catch (error) {
      setSubmitError(error.message || 'Registration failed');
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {submitError && (
        <div className="p-3.5 rounded-xl bg-error-container/25 border border-error/40 text-error text-xs flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
          <span>{submitError}</span>
        </div>
      )}

      <Input
        label="Full Name"
        type="text"
        autoComplete="name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        error={errors.name}
        placeholder="e.g. Marco Bellini"
        required
      />

      <Input
        label="Email Address"
        type="email"
        autoComplete="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        error={errors.email}
        placeholder="e.g. patron@fireandslice.com"
        required
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        value={formData.password}
        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        error={errors.password}
        placeholder="Min 6 characters"
        required
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[#9d9287] hover:text-crust-cream transition-colors p-1 cursor-pointer flex items-center justify-center"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        }
      />

      <Input
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
        error={errors.confirmPassword}
        placeholder="Re-enter password"
        required
      />

      <Button
        type="submit"
        fullWidth
        loading={loading}
        className="mt-4 py-3.5 font-title-md uppercase tracking-wider text-sm shadow-[0_8px_24px_-6px_rgba(244,98,48,0.5)] cursor-pointer"
      >
        Create Account
      </Button>

      <div className="pt-4 border-t border-[#3a3026] text-center text-xs text-[#b8a99c]">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary-container hover:text-ember-glow font-semibold transition-colors underline cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </form>
  );
}

export function ForgotPasswordForm({ onBackToLogin }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email is required'); return; }
    if (!validateEmail(email)) { setError('Invalid email format'); return; }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to send reset link');

      setSent(true);
      toast.success('Password reset link generated!');
    } catch (err) {
      setError(err.message || 'Could not send reset link');
      toast.error(err.message || 'Could not send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-[32px] text-emerald-400">mark_email_read</span>
        </div>
        <h3 className="text-xl font-serif font-bold text-crust-cream">Instructions Dispatched</h3>
        <p className="text-sm text-[#c4b5a8]">
          If an account exists for <strong className="text-crust-cream">{email}</strong>, you will receive password reset instructions.
        </p>
        <Button variant="secondary" fullWidth onClick={onBackToLogin}>
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Registered Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        placeholder="Enter your registered email"
        required
      />
      <Button type="submit" fullWidth loading={loading} className="py-3.5 cursor-pointer">
        Send Reset Link
      </Button>
      <button
        type="button"
        onClick={onBackToLogin}
        className="w-full text-center text-xs text-[#9d9287] hover:text-crust-cream transition-colors pt-2 cursor-pointer"
      >
        Return to Sign In
      </button>
    </form>
  );
}

export function ResetPasswordForm({ token, onBackToLogin }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!validatePassword(formData.password)) newErrors.password = 'Must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: formData.password }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to reset password');

      setSuccess(true);
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-[32px] text-emerald-400">check_circle</span>
        </div>
        <h3 className="text-xl font-serif font-bold text-crust-cream">Password Updated</h3>
        <p className="text-sm text-[#c4b5a8]">Your password has been changed. You can now sign in.</p>
        <Button fullWidth onClick={onBackToLogin}>Go to Sign In</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="New Password"
        type="password"
        autoComplete="new-password"
        value={formData.password}
        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        error={errors.password}
        placeholder="Min 6 characters"
        required
      />
      <Input
        label="Confirm New Password"
        type="password"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
        error={errors.confirmPassword}
        placeholder="Re-enter new password"
        required
      />
      <Button type="submit" fullWidth loading={loading} className="py-3.5 cursor-pointer">
        Reset Password
      </Button>
      <button
        type="button"
        onClick={onBackToLogin}
        className="w-full text-center text-xs text-[#9d9287] hover:text-crust-cream transition-colors pt-2 cursor-pointer"
      >
        Return to Sign In
      </button>
    </form>
  );
}