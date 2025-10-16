import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../config/constants';
import { isValidEmail } from '../../utils/helpers';
import GoogleSignIn from '../../components/GoogleSignIn';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, error: authError, setError } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: USER_ROLES.BUYER,
  });
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (authError) {
      setError(null);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        result = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
        });
      }

      if (result.success) {
        // Redirect based on role
        const user = result.user;
        if (user.role === USER_ROLES.ADMIN) {
          navigate('/admin/dashboard');
        } else if (user.role === USER_ROLES.SELLER) {
          navigate('/seller/dashboard');
        } else {
          navigate('/buyer/auctions');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login and register
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setError(null);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: '',
      role: USER_ROLES.BUYER,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('src/assets/bg.svg')] bg-cover px-4 py-8">
      <div className="relative diagonal-border backdrop-blur-2xl bg-white/10 text-white w-full max-w-md p-8 rounded-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">
            NextGen <span className="text-[#24CFA6]">Marketplace</span>
          </h1>
          <p className="text-white/70 mt-2">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* Error Message */}
        {authError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-300">{authError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full p-3 rounded-lg bg-white/10 border ${
                  errors.name ? 'border-red-500' : 'border-white/30'
                } text-white placeholder:text-white/50 focus:outline-none focus:border-[#24CFA6] focus:ring-2 focus:ring-[#24CFA6]/50`}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full p-3 rounded-lg bg-white/10 border ${
                errors.email ? 'border-red-500' : 'border-white/30'
              } text-white placeholder:text-white/50 focus:outline-none focus:border-[#24CFA6] focus:ring-2 focus:ring-[#24CFA6]/50`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="1234567890"
                className={`w-full p-3 rounded-lg bg-white/10 border ${
                  errors.phone ? 'border-red-500' : 'border-white/30'
                } text-white placeholder:text-white/50 focus:outline-none focus:border-[#24CFA6] focus:ring-2 focus:ring-[#24CFA6]/50`}
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
          )}

          {/* Role (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: USER_ROLES.BUYER }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.role === USER_ROLES.BUYER
                      ? 'border-[#24CFA6] bg-[#24CFA6]/20'
                      : 'border-white/30 bg-white/5'
                  }`}
                >
                  <i className="ri-shopping-cart-line text-2xl mb-1"></i>
                  <p className="text-sm font-medium">Buy Items</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: USER_ROLES.SELLER }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.role === USER_ROLES.SELLER
                      ? 'border-[#24CFA6] bg-[#24CFA6]/20'
                      : 'border-white/30 bg-white/5'
                  }`}
                >
                  <i className="ri-store-line text-2xl mb-1"></i>
                  <p className="text-sm font-medium">Sell Items</p>
                </button>
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full p-3 rounded-lg bg-white/10 border ${
                errors.password ? 'border-red-500' : 'border-white/30'
              } text-white placeholder:text-white/50 focus:outline-none focus:border-[#24CFA6] focus:ring-2 focus:ring-[#24CFA6]/50`}
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full p-3 rounded-lg bg-white/10 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-white/30'
                } text-white placeholder:text-white/50 focus:outline-none focus:border-[#24CFA6] focus:ring-2 focus:ring-[#24CFA6]/50`}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#24CFA6] hover:bg-[#24cfa7c9] transition-all rounded-full py-3 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-white/30"></div>
          <span className="px-4 text-white/60 text-sm">OR</span>
          <div className="flex-1 border-t border-white/30"></div>
        </div>

        {/* Google Sign-In */}
        <GoogleSignIn isLogin={isLogin} selectedRole={formData.role} />

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-sm text-white/80">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={toggleMode}
                className="text-[#24CFA6] font-semibold hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={toggleMode}
                className="text-[#24CFA6] font-semibold hover:underline"
              >
                Sign In
              </button>
            </>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            <i className="ri-arrow-left-line mr-1"></i>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;