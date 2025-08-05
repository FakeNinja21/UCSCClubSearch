import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { isStudentProfileComplete, isClubProfileComplete, getUserType } from '../utils/profileCompletion';

const ProfileCompletionGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userType = await getUserType(user.uid);
        
        if (!userType) {
          setLoading(false);
          return;
        }

        let isProfileComplete = false;
        
        if (userType === 'student') {
          isProfileComplete = await isStudentProfileComplete(user.uid);
          if (!isProfileComplete) {
            setRedirectPath('/profile');
            setShouldRedirect(true);
          }
        } else if (userType === 'club') {
          isProfileComplete = await isClubProfileComplete(user.uid);
          if (!isProfileComplete) {
            setRedirectPath('/club-profile');
            setShouldRedirect(true);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking profile completion:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (shouldRedirect && redirectPath) {
      navigate(redirectPath);
    }
  }, [shouldRedirect, redirectPath, navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return children;
};

export default ProfileCompletionGuard; 