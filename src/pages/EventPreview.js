import React from 'react';
import ClubNavigation from '../components/ClubNavigation';

const EventPreview = ({ eventData, bannerPreview, onBack, onSubmit, loading, error }) => {
  return (
    <>
      <ClubNavigation />
      <div style={{ background: '#f7f7fa', minHeight: '100vh', paddingTop: 80 }}>
        <div style={{ maxWidth: 500, margin: '0 auto', background: eventData.bgColor || '#fff', border: '1px solid #e0e0e0', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, fontFamily: 'sans-serif' }}>
          <h2 style={{ textAlign: 'center', color: '#003B5C', marginBottom: 20 }}>{eventData.eventName}</h2>
          {bannerPreview && (
            <img src={bannerPreview} alt="Event Banner" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 20, border: '1px solid #FFD700' }} />
          )}
          <div style={{ marginBottom: 14, color: '#003B5C', fontWeight: 500 }}>
            <strong>Club:</strong> {eventData.clubName}
          </div>
          <div style={{ marginBottom: 14 }}>
            <strong style={{ color: '#003B5C' }}>Description:</strong>
            <div style={{ whiteSpace: 'pre-wrap', marginTop: 4, color: '#222' }}>{eventData.description}</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <strong style={{ color: '#003B5C' }}>Date:</strong> {eventData.date}
          </div>
          <div style={{ marginBottom: 14 }}>
            <strong style={{ color: '#003B5C' }}>Start Time:</strong> {eventData.startTime}
          </div>
          <div style={{ marginBottom: 14 }}>
            <strong style={{ color: '#003B5C' }}>End Time:</strong> {eventData.endTime}
          </div>
          <div style={{ marginBottom: 18 }}>
            <strong style={{ color: '#003B5C' }}>Location:</strong> {eventData.location}
          </div>
          <div style={{ marginBottom: 18 }}>
            <strong style={{ color: '#003B5C' }}>Who can attend:</strong> {eventData.openTo === 'everyone' ? 'Everyone' : 'Club Members Only'}
          </div>
          {eventData.zoomLink && (
            <div style={{ marginBottom: 18 }}>
              <strong style={{ color: '#003B5C' }}>Zoom Link:</strong> <a href={eventData.zoomLink} target="_blank" rel="noopener noreferrer" style={{ color: '#003B5C', textDecoration: 'underline', wordBreak: 'break-all' }}>{eventData.zoomLink}</a>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button onClick={onBack} style={{ padding: '10px 28px', background: '#fff', color: '#003B5C', border: '2px solid #003B5C', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Back</button>
            <button onClick={onSubmit} disabled={loading} style={{ padding: '10px 28px', background: '#003B5C', color: '#E6C200', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
              {loading ? 'Posting...' : 'Submit'}
            </button>
          </div>
          {error && <p style={{ color: 'red', marginTop: '16px', textAlign: 'center' }}>{error}</p>}
        </div>
      </div>
    </>
  );
};

export default EventPreview; 