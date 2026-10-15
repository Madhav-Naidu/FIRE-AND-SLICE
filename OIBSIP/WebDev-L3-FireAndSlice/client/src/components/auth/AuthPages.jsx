import { useState, useEffect } from 'react';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import {
  AuthLayout,
  RegisterForm,
  LoginForm,
  ForgotPasswordForm,
  ResetPasswordForm,
} from './AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../services/api';
import Spinner from '../ui/Spinner';

export function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState('register');

  if (isAuthenticated) return <Navigate to="/menu" replace />;

  return (
    <AuthLayout
      title={mode === 'register' ? 'Join FIRE & SLICE' : mode === 'login' ? 'Welcome Back' : 'Forgot Password'}
      subtitle={
        mode === 'register'
          ? 'Crafted authentic wood-fired pizzas, tailored just for you'
          : mode === 'login'
          ? 'Sign in to access your saved crust recipes and orders'
          : 'Enter your registered email to reset your access'
      }
      footer={
        mode === 'register'
          ? 'By creating an account, you agree to our Terms of Culinary Excellence & Privacy Policy'
          : null
      }
    >
      {mode === 'register' && (
        <RegisterForm onSwitchToLogin={() => setMode('login')} />
      )}
      {mode === 'login' && (
        <LoginForm
          onSwitchToRegister={() => setMode('register')}
          onSwitchToForgot={() => setMode('forgot')}
        />
      )}
      {mode === 'forgot' && (
        <ForgotPasswordForm onBackToLogin={() => setMode('login')} />
      )}
    </AuthLayout>
  );
}

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState('login');

  if (isAuthenticated) return <Navigate to="/menu" replace />;

  return (
    <AuthLayout
      title={mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join FIRE & SLICE' : 'Forgot Password'}
      subtitle={
        mode === 'login'
          ? 'Sign in to your FIRE & SLICE patron account'
          : mode === 'register'
          ? 'Experience artisanal wood-fired craft delivery'
          : 'We will dispatch password recovery instructions'
      }
      footer={
        mode === 'login' ? (
          <span className="text-ash-muted">
            Need staff or kitchen access?{' '}
            <Link to="/admin" className="text-primary-container hover:underline font-mono">
              Admin Portal
            </Link>
          </span>
        ) : null
      }
    >
      {mode === 'login' && (
        <LoginForm
          onSwitchToRegister={() => setMode('register')}
          onSwitchToForgot={() => setMode('forgot')}
        />
      )}
      {mode === 'register' && (
        <RegisterForm onSwitchToLogin={() => setMode('login')} />
      )}
      {mode === 'forgot' && (
        <ForgotPasswordForm onBackToLogin={() => setMode('login')} />
      )}
    </AuthLayout>
  );
}

export function ForgotPasswordPage() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/menu" replace />;

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email address and we'll dispatch a secure recovery link"
    >
      <ForgotPasswordForm onBackToLogin={() => window.location.href = '/login'} />
    </AuthLayout>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <AuthLayout title="Invalid Link" subtitle="This password reset link is invalid or expired">
        <div className="text-center space-y-4">
          <p className="text-sm text-on-surface-variant">Please request a fresh reset link.</p>
          <Link
            to="/forgot-password"
            className="inline-block px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-semibold text-sm hover:bg-ember-glow transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password below"
    >
      <ResetPasswordForm token={token} onBackToLogin={() => window.location.href = '/login'} />
    </AuthLayout>
  );
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <AuthLayout title="Invalid Link" subtitle="This verification link is invalid or missing">
        <div className="text-center space-y-4">
          <p className="text-sm text-on-surface-variant">Please register or request a new verification link.</p>
          <Link
            to="/register"
            className="inline-block px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-semibold text-sm hover:bg-ember-glow transition-colors"
          >
            Register Again
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Account Verification" subtitle="Confirming your email credentials">
      <VerifyEmailContent token={token} />
    </AuthLayout>
  );
}

function VerifyEmailContent({ token }) {
  const { toast } = useToast();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      try {
        await authApi.verifyEmail(token);

        if (mounted) {
          setStatus('success');
          toast.success('Email verified successfully!');
        }
      } catch (error) {
        if (mounted) {
          setStatus('error');
          const cleanMsg = error.message?.includes('Unexpected token') || error.message?.includes('JSON')
            ? 'Verification service unavailable. Please try again.'
            : (error.message || 'Verification failed');
          toast.error(cleanMsg);
        }
      }
    };
    verify();
    return () => { mounted = false; };
  }, [token, toast]);

  if (status === 'verifying') {
    return (
      <div className="text-center py-6">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-on-surface-variant">Verifying your email token...</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4 py-4">
      <div
        className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
          status === 'success'
            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
            : 'bg-error-container/30 border border-error/40 text-error'
        }`}
      >
        <span className="material-symbols-outlined text-[32px]">
          {status === 'success' ? 'verified' : 'cancel'}
        </span>
      </div>
      <h2 className="text-2xl font-serif font-bold text-crust-cream">
        {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
      </h2>
      <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
        {status === 'success'
          ? 'Your patron account is active. You can now sign in to begin ordering handcrafted pizzas.'
          : 'The verification link has expired or is invalid. Please request a new one.'}
      </p>
      <Link
        to="/login"
        className="inline-block px-6 py-3 rounded-xl bg-primary-container text-on-primary font-semibold text-sm hover:bg-ember-glow transition-colors"
      >
        Proceed to Sign In
      </Link>
    </div>
  );
}