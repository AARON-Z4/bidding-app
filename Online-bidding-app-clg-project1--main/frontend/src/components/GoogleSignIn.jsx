import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { USER_ROLES } from '../config/constants';

const GoogleSignIn = ({ isLogin, selectedRole = USER_ROLES.BUYER }) => {
  const { loginWithGoogle, setError } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      initializeGoogleSignIn();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        {
          theme: 'filled_black',
          size: 'large',
          width: '100%',
          text: isLogin ? 'signin_with' : 'signup_with',
          shape: 'pill',
        }
      );
    }
  };

  const handleCredentialResponse = async (response) => {
    setLoading(true);
    try {
      const result = await loginWithGoogle(response.credential, selectedRole);
      
      if (result.success) {
        const user = result.user;
        if (user.role === USER_ROLES.ADMIN) {
          navigate('/admin/dashboard');
        } else if (user.role === USER_ROLES.SELLER) {
          navigate('/seller/dashboard');
        } else {
          navigate('/buyer/auctions');
        }
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex items-center justify-center p-3 bg-white/10 rounded-full">
          <i className="ri-loader-4-line animate-spin text-white text-xl"></i>
          <span className="ml-2 text-white">Signing in...</span>
        </div>
      ) : (
        <div id="googleSignInButton" className="w-full"></div>
      )}
    </div>
  );
};

export default GoogleSignIn;