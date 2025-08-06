import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { auth } from '../firebase';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import ClubNavigation from '../components/ClubNavigation';
import availableTags from '../data/availableTags';
import { isClubProfileComplete } from '../utils/profileCompletion';
import { Container, Card, Button, Form, Alert, Row, Col, Badge } from 'react-bootstrap';

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
  const [profileComplete, setProfileComplete] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
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
          
          // Check profile completion on load
          const complete = await isClubProfileComplete(currentUser.uid);
          setProfileComplete(complete);
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
      setNewTag('');
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
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Recheck profile completion after saving
      const complete = await isClubProfileComplete(currentUser.uid);
      setProfileComplete(complete);
    }
  };

  return (
    <>
      <ClubNavigation />
      <Container className="py-4" style={{ marginTop: '80px' }}>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-primary text-white">
                <h2 className="mb-0 fw-bold">📘 Club Profile</h2>
              </Card.Header>
              <Card.Body className="p-4">
                {!profileComplete && (
                  <Alert variant="warning" className="mb-4">
                    <strong>⚠️ Profile Incomplete</strong><br />
                    Please complete the following information to access all features of the app:
                    <ul className="mb-0 mt-2">
                      {!clubData.name.trim() && <li>Add your club name</li>}
                      {!clubData.email.trim() && <li>Add your club email</li>}
                      {!clubData.instagram.trim() && <li>Add your club Instagram</li>}
                      {(!clubData.description || clubData.description.trim().split(/\s+/).length < 10) && 
                        <li>Add a description with at least 10 words</li>}
                      {(!clubData.imageUrls || clubData.imageUrls.length === 0) && 
                        <li>Upload at least one image</li>}
                      {(!clubData.tags || clubData.tags.length === 0) && 
                        <li>Add at least one tag</li>}
                    </ul>
                  </Alert>
                )}

                {saveSuccess && (
                  <Alert variant="success" className="mb-4">
                    Changes saved successfully!
                  </Alert>
                )}

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Club Name</Form.Label>
                    <Form.Control
                      name="name"
                      value={clubData.name}
                      onChange={handleChange}
                      placeholder="Enter club name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Upload Images</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                    <div className="d-flex gap-2 mt-3 overflow-auto">
                      {(images || []).map((url, index) => (
                        <div key={index} className="position-relative">
                          <img 
                            src={url} 
                            alt={`preview-${index}`} 
                            className="rounded"
                            style={{ height: '100px', width: '100px', objectFit: 'cover' }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0"
                            style={{ transform: 'translate(50%, -50%)' }}
                            onClick={() => {
                              const updated = images.filter((_, i) => i !== index);
                              setImages(updated);
                              setClubData({ ...clubData, imageUrls: updated });
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Club Email</Form.Label>
                        <Form.Control
                          name="email"
                          value={clubData.email}
                          onChange={handleChange}
                          placeholder="Enter club email"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Instagram</Form.Label>
                        <Form.Control
                          name="instagram"
                          value={clubData.instagram}
                          onChange={handleChange}
                          placeholder="Enter Instagram handle"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={clubData.description}
                      rows="4"
                      onChange={handleDescriptionChange}
                      placeholder="Describe your club..."
                    />
                    <Form.Text className={`text-${wordCount > maxWords ? 'danger' : 'muted'}`}>
                      {wordCount}/{maxWords} words
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Tags / Topics</Form.Label>
                    <div className="mb-3">
                      {clubData.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          bg="primary" 
                          className="me-2 mb-2"
                        >
                          {tag}
                          <Button
                            variant="link"
                            className="text-white text-decoration-none p-0 ms-2"
                            onClick={() => removeTag(tag)}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <Row>
                      <Col md={8}>
                        <Form.Select
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                        >
                          <option value="">-- Select Tag --</option>
                          {availableTags.map((tag, idx) => (
                            <option key={idx} value={tag}>{tag}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={4}>
                        <Button 
                          variant="outline-primary" 
                          onClick={addTag}
                          className="w-100"
                        >
                          + Add Tag
                        </Button>
                      </Col>
                    </Row>
                  </Form.Group>

                  <div className="text-center">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      onClick={saveChanges}
                      className="w-100"
                    >
                      Save Changes
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ClubProfilePage;