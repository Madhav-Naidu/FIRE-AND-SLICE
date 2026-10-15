import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Pizza, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { adminApi } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import Spinner from '../ui/Spinner';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await adminApi.login({ username: formData.username, password: formData.password });
      
      localStorage.setItem('adminToken', data.token);
      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } catch (error) {
      const cleanMsg = error.message?.includes('Unexpected token') || error.message?.includes('JSON')
        ? 'Admin sign in failed. Please verify credentials.'
        : (error.message || 'Login failed');
      toast.error(cleanMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAdmin = () => {
    setFormData({ username: 'admin', password: 'admin123' });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-container mb-6">
            <Pizza className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-crust-cream">Admin Login</h1>
          <p className="mt-2 text-on-surface-variant">FIRE & SLICE Administration Panel</p>
        </div>
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <Input
                label="Username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                error={errors.username}
                placeholder="Enter admin username"
                required
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  error={errors.password}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-ash-muted hover:text-on-surface-variant"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button type="submit" fullWidth loading={loading} className="mt-2">
                <Shield className="w-4 h-4 mr-2" />
                Sign In to Admin
              </Button>
            </form>
            <div className="mt-6 p-4 bg-surface-elevated rounded-xl flex items-center justify-between">
              <p className="text-xs text-on-surface-variant">
                <strong className="text-crust-cream">Demo Admin:</strong> <code className="bg-surface-container px-1 rounded">admin</code> / <code className="bg-surface-container px-1 rounded">admin123</code>
              </p>
              <button
                type="button"
                onClick={handleQuickDemoAdmin}
                className="text-xs font-mono font-semibold text-primary-container hover:text-ember-glow px-2.5 py-1 rounded bg-primary-container/15 border border-primary-container/30 cursor-pointer"
              >
                Fill Demo
              </button>
            </div>
            <p className="mt-6 text-center text-sm text-on-surface-variant">
              <a href="/" className="text-ember-glow hover:text-primary-700 font-medium">
                ← Back to Customer Site
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}