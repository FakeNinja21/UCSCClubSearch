import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import ClubNavigation from '../components/ClubNavigation';
import availableTags from '../data/availableTags';

const ClubProfilePage = () => {
  const db = getFirestore();
  const [clubData, setClubData] = useState({
    name: '',
    email: '',
    description: '',
    tags: [],
    imageUrls: [],
  });
  const [newTag, setNewTag] = useState('');
  const [images, setImages] = useState([]);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        const docRef = doc(db, 'clubs', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setClubData({
            ...data,
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
    setClubData({
      ...clubData,
      tags: clubData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...urls]);
    setClubData({ ...clubData, imageUrls: [...images, ...urls] });
  };

  const saveChanges = async () => {
    if (currentUser) {
      const docRef = doc(db, 'clubs', currentUser.uid);
      await setDoc(docRef, {
        ...clubData,
        ownerEmail: currentUser.email,
      });
      alert('Changes saved!');
    }
  };

  return (
    <>
      <ClubNavigation />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
        <h2>📘 Club Profile</h2>

        <label>Club Name</label>
        <input
          name="name"
          value={clubData.name}
          onChange={handleChange}
          style={inputStyle}
        />

        <label>Upload Images</label>
        <input type="file" multiple onChange={handleImageUpload} />
        <div style={imageContainerStyle}>
          {images.map((url, index) => (
            <img key={index} src={url} alt={`preview-${index}`} style={imageStyle} />
          ))}
        </div>

        <label>Club Email</label>
        <input
          name="email"
          value={clubData.email}
          onChange={handleChange}
          style={inputStyle}
        />

        <label>Description</label>
        <textarea
          name="description"
          value={clubData.description}
          onChange={handleChange}
          rows="4"
          style={inputStyle}
        />

        <label>Tags / Topics</label>
        <div style={tagContainerStyle}>
          {clubData.tags.map((tag, index) => (
            <div key={index} style={tagStyle}>
              {tag}
              <button onClick={() => removeTag(tag)} style={tagButtonStyle}>×</button>
            </div>
          ))}
        </div>
        <select value={newTag} onChange={(e) => setNewTag(e.target.value)} style={inputStyle}>
          <option value="">-- Select Tag --</option>
          {availableTags.map((tag, idx) => (
            <option key={idx} value={tag}>{tag}</option>
          ))}
        </select>
        <button onClick={addTag}>+ Add Tag</button>

        <button onClick={saveChanges} style={{ marginTop: '1rem' }}>Save Changes</button>
      </div>
    </>
  );
};

const inputStyle = {
  width: '100%',
  marginBottom: '1rem',
  padding: '0.5rem',
  fontSize: '1rem',
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
