import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { auth } from '../firebase';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import ClubNavigation from '../components/ClubNavigation';
import availableTags from '../data/availableTags';

const ClubProfilePage = () => {
  const db = getFirestore();
  const [clubData, setClubData] = useState({
    name: '',
    email: '',
    instagram: '',
    description: '',
    tags: [],
    imageUrls: [],
  });
  const [newTag, setNewTag] = useState('');
  const [images, setImages] = useState([]);
  const currentUser = auth.currentUser;
  const maxWords = 150;
  const wordCount = clubData.description.trim() === '' ? 0 : clubData.description.trim().split(/\s+/).length;

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        const docRef = doc(db, 'clubs', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setClubData({
            name: data.name || '',
            email: data.email || '',
            instagram: data.instagram || '',
            description: data.description || '',
            tags: data.tags || [],
            imageUrls: data.imageUrls || [],
          });
          setImages(data.imageUrls || []);
        }
      }
    };
    fetchData();
  }, [currentUser, db]);

  const handleChange = (e) => {
    setClubData({ ...clubData, [e.target.name]: e.target.value });
  };

  const addTag = () => {
    if (newTag && !clubData.tags.includes(newTag)) {
      setClubData({ ...clubData, tags: [...clubData.tags, newTag] });
    }
  };

  const removeTag = (tagToRemove) => {
    setClubData({ ...clubData, tags: clubData.tags.filter(tag => tag !== tagToRemove) });
  };

  // Cloudinary upload helper
  const uploadToCloudinary = async (file) => {
    const url = 'https://api.cloudinary.com/v1_1/dwo1u3dhn/image/upload';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ucsc_club_upload');
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Cloudinary upload failed');
    const data = await response.json();
    return data.secure_url;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    // Upload all files to Cloudinary
    const uploadPromises = files.map(file => uploadToCloudinary(file));
    const urls = await Promise.all(uploadPromises);
    const updatedImages = [...images, ...urls];
    setImages(updatedImages);
    setClubData({ ...clubData, imageUrls: updatedImages });
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/);
    if (value.trim() === '' || words.length <= maxWords) {
      setClubData({ ...clubData, description: value });
    } else {
      setClubData({ ...clubData, description: words.slice(0, maxWords).join(' ') });
    }
  };

  const saveChanges = async () => {
    if (currentUser) {
      const docRef = doc(db, 'clubs', currentUser.uid);
      await setDoc(docRef, {
        ...clubData,
        imageUrls: images, // ensure we save the Cloudinary URLs
      });
      alert('Changes saved!');
    }
  };

  return (
    <>
      <ClubNavigation />
      <div style={{ background: '#f7f7fa', minHeight: '100vh', paddingTop: 80 }}>
        <div style={{ maxWidth: 500, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 40, fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#003B5C', marginBottom: 24, textAlign: 'center' }}>📘 Club Profile</h2>
          <label style={labelStyle}>Club Name</label>
          <input name="name" value={clubData.name} onChange={handleChange} style={inputStyle} />
          <label style={labelStyle}>Upload Images</label>
          <input type="file" multiple onChange={handleImageUpload} style={{ marginBottom: 18 }} />
          <div style={imageContainerStyle}>
            {(images || []).map((url, index) => (
              <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                <img src={url} alt={`preview-${index}`} style={imageStyle} />
                <button
                  type="button"
                  onClick={() => {
                    const updated = images.filter((_, i) => i !== index);
                    setImages(updated);
                    setClubData({ ...clubData, imageUrls: updated });
                  }}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 22,
                    height: 22,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    zIndex: 2,
                  }}
                  className="image-remove-btn"
                  aria-label="Remove image"
                >×</button>
              </div>
            ))}
          </div>
          <label style={labelStyle}>Club Email</label>
          <input name="email" value={clubData.email} onChange={handleChange} style={inputStyle} />
          <label style={labelStyle}>Instagram</label>
          <input name="instagram" value={clubData.instagram} onChange={handleChange} style={inputStyle} />
          <label style={labelStyle}>Description</label>
          <textarea name="description" value={clubData.description} rows="4" style={{ ...inputStyle, resize: 'vertical' }} onChange={handleDescriptionChange} maxLength={1000} />
          <div style={{ textAlign: 'right', color: wordCount > maxWords ? 'red' : '#003B5C', fontSize: 13, marginTop: 4, marginBottom: 8 }}>
            {wordCount}/{maxWords} words
          </div>
          <label style={labelStyle}>Tags / Topics</label>
          <div style={tagContainerStyle}>
            {(clubData.tags || []).map((tag, index) => (
              <div key={index} style={{ ...tagStyle, position: 'relative' }}>
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  style={{
                    marginLeft: 6,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    color: '#003B5C',
                    fontSize: 15,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  }}
                  className="tag-remove-btn"
                  aria-label={`Remove tag ${tag}`}
                >×</button>
              </div>
            ))}
          </div>
          <select value={newTag} onChange={(e) => setNewTag(e.target.value)} style={inputStyle}>
            <option value="">-- Select Tag --</option>
            {availableTags.map((tag, idx) => <option key={idx} value={tag}>{tag}</option>)}
          </select>
          <button onClick={addTag} style={secondaryButtonStyle}>+ Add Tag</button>
          <div style={{ marginTop: '2rem', display: 'flex', gap: 12 }}>
            <button onClick={saveChanges} style={primaryButtonStyle}>Save Changes</button>
          </div>
        </div>
      </div>
    </>
  );
};

// ... (your style objects at the bottom of the file)
const labelStyle = {
  fontWeight: 500,
  color: '#003B5C',
  marginBottom: 6,
  marginTop: 8,
  display: 'block',
};
const inputStyle = {
  width: '100%',
  marginBottom: '1rem',
  padding: '12px',
  fontSize: '1rem',
  borderRadius: 8,
  border: '1px solid #ccc',
  boxSizing: 'border-box',
};
const primaryButtonStyle = {
  width: '100%',
  background: '#003B5C',
  color: '#E6C200',
  border: 'none',
  borderRadius: 8,
  padding: '14px 0',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  marginBottom: 0,
};
const secondaryButtonStyle = {
  width: '100%',
  background: '#fff',
  color: '#003B5C',
  border: '2px solid #003B5C',
  borderRadius: 8,
  padding: '10px 0',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  marginBottom: '1rem',
  marginTop: 0,
};
const tagContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  marginBottom: '1rem',
};
const tagStyle = {
  backgroundColor: '#e0e0e0',
  padding: '5px 10px',
  borderRadius: '20px',
  margin: '4px',
  display: 'flex',
  alignItems: 'center',
};
const tagButtonStyle = {
  marginLeft: '6px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 'bold',
};
const imageContainerStyle = {
  display: 'flex',
  gap: '10px',
  marginTop: '10px',
  overflowX: 'auto',
};
const imageStyle = {
  height: '100px',
  borderRadius: '10px',
  objectFit: 'cover',
};

export default ClubProfilePage;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .image-remove-btn:hover, .image-remove-btn:focus {
      opacity: 1 !important;
    }
    .image-remove-btn {
      opacity: 0;
      pointer-events: auto;
    }
    div[style*='relative'][style*='inline-block']:hover .image-remove-btn {
      opacity: 1 !important;
    }
    .tag-remove-btn:hover, .tag-remove-btn:focus {
      opacity: 1 !important;
    }
    .tag-remove-btn {
      opacity: 0;
      pointer-events: auto;
    }
    div[style*='relative']:hover .tag-remove-btn {
      opacity: 1 !important;
    }
  `;
  document.head.appendChild(style);
}