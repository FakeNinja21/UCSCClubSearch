import React from 'react';
import { useNavigate } from 'react-router-dom';
import clubLogo from '../assets/club_logo.png';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f7f7fa 60%, #e5f0ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, Arial, sans-serif',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        padding: '48px 36px',
        maxWidth: 420,
        width: '100%',
        textAlign: 'center',
      }}>
        <h1 style={{ color: '#003B5C', fontWeight: 900, fontSize: 38, marginBottom: 12, letterSpacing: 0.5 }}>Welcome to UCSC Club Search</h1>
        <img src={clubLogo} alt="UCSC Club Search Logo" style={{ width: 130, height: 130, objectFit: 'contain', margin: '18px auto 28px auto', display: 'block' }} />
        <p style={{ color: '#003B5C', fontWeight: 500, fontSize: 18, marginBottom: 32, opacity: 0.85 }}>Find, join, and manage UCSC clubs and events. Please select your role to continue:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Student Section */}
          <div style={{ background: '#e5f0ff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h2 style={{ color: '#003B5C', fontWeight: 800, fontSize: 24, marginBottom: 10 }}>I am a Student</h2>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/student-signup')}
                style={{
                  background: '#003B5C',
                  color: '#FFD700',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 28px',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                Student Sign Up
              </button>
              <button
                onClick={() => navigate('/student-login')}
                style={{
                  background: '#FFD700',
                  color: '#003B5C',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 28px',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                Student Login
              </button>
            </div>
          </div>
          {/* Club Section */}
          <div style={{ background: '#fffbe5', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h2 style={{ color: '#B8860B', fontWeight: 800, fontSize: 24, marginBottom: 10 }}>I represent a Club</h2>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/club-signup')}
                style={{
                  background: '#B8860B',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 28px',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                Club Sign Up
              </button>
              <button
                onClick={() => navigate('/club-login')}
                style={{
                  background: '#fff',
                  color: '#B8860B',
                  border: '2px solid #B8860B',
                  borderRadius: 8,
                  padding: '12px 28px',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                Club Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 