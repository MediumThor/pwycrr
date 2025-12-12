import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import ImageCropper from './ImageCropper';
import './ImageLibrary.css';

interface SlideshowImage {
  id: string;
  url: string;
  name: string;
  createdAt: any;
}

interface InventoryImage {
  url: string;
  name?: string;
  updatedAt?: any;
}

// interface ProcessImage {
//   id: string;
//   url: string;
//   name: string;
//   processStep: string;
//   uploadedAt: any;
// }

const ImageLibrary = () => {
  const { currentUser } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);


  // Home page slideshow images
  const [homeSlides, setHomeSlides] = useState<SlideshowImage[]>([]);
  const [loadingHomeSlides, setLoadingHomeSlides] = useState(true);
  const [newHomeSlideUrl, setNewHomeSlideUrl] = useState('');
  const [newHomeSlideName, setNewHomeSlideName] = useState('');
  const [newHomeSlideFile, setNewHomeSlideFile] = useState<File | null>(null);
  const [uploadingHomeSlide, setUploadingHomeSlide] = useState(false);


  // Homepage image (single hero image)
  const [homepageImage, setHomepageImage] = useState<InventoryImage | null>(null);
  const [homepageImageUrl, setHomepageImageUrl] = useState('');
  const [homepageImageName, setHomepageImageName] = useState('');
  const [homepageImageFile, setHomepageImageFile] = useState<File | null>(null);
  const [loadingHomepageImage, setLoadingHomepageImage] = useState(true);
  const [savingHomepageImage, setSavingHomepageImage] = useState(false);

  // Dropdown state for section navigation
  const [selectedSection] = useState<string>('homepage-slideshow');

  // Image cropper state
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [cropperCallback, setCropperCallback] = useState<((file: File) => void) | null>(null);
  const [cropperAspectRatio, setCropperAspectRatio] = useState<number | undefined>(undefined);

  // Helper function to handle file selection with cropper
  const handleFileSelect = (file: File | null, callback: (file: File) => void, aspectRatio?: number) => {
    if (file) {
      setCropperFile(file);
      setCropperCallback(() => callback);
      setCropperAspectRatio(aspectRatio);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    if (cropperCallback) {
      cropperCallback(croppedFile);
    }
    setCropperFile(null);
    setCropperCallback(null);
    setCropperAspectRatio(undefined);
  };

  const handleCropCancel = () => {
    setCropperFile(null);
    setCropperCallback(null);
    setCropperAspectRatio(undefined);
  };

  useEffect(() => {
    fetchHomeSlideshowImages();
    fetchHomepageImage();
  }, []);

  // Scroll to section when dropdown changes
  useEffect(() => {
    if (selectedSection) {
      const element = document.getElementById(`section-${selectedSection}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedSection]);


  const fetchHomeSlideshowImages = async () => {
    setLoadingHomeSlides(true);
    try {
      const slidesRef = collection(db, 'homeSlideshowImages');
      const slidesQuery = query(slidesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(slidesQuery);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      })) as SlideshowImage[];
      setHomeSlides(items);
    } catch (error) {
      console.error('Error fetching home slideshow images:', error);
    } finally {
      setLoadingHomeSlides(false);
    }
  };



  const fetchHomepageImage = async () => {
    try {
      const homepageDoc = await getDocs(collection(db, 'homepageImage'));
      if (!homepageDoc.empty) {
        const docSnap = homepageDoc.docs[0];
        const data = docSnap.data() as InventoryImage;
        setHomepageImage(data);
        setHomepageImageUrl(data.url || '');
        setHomepageImageName(data.name || '');
      } else {
        setHomepageImage(null);
        setHomepageImageUrl('');
        setHomepageImageName('');
      }
    } catch (error) {
      console.error('Error fetching homepage image:', error);
    } finally {
      setLoadingHomepageImage(false);
    }
  };

  // Helper function to upload file to Firebase Storage
  const uploadFileToStorage = async (file: File, folder: string): Promise<string> => {
    if (!currentUser) {
      throw new Error('You must be logged in to upload files');
    }
    
    const timestamp = Date.now();
    // Sanitize filename - remove spaces and special characters
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${folder}/${timestamp}-${sanitizedName}`;
    const storageRef = ref(storage, fileName);
    
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error: any) {
      console.error('Upload error details:', error);
      if (error.code === 'storage/unauthorized') {
        throw new Error('You are not authorized to upload files. Please make sure you are logged in.');
      } else if (error.code === 'storage/unknown') {
        throw new Error('Upload failed. Please check that CORS is configured in Firebase Storage and try again.');
      }
      throw error;
    }
  };


  const handleHomeSlideUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newHomeSlideName.trim()) {
      alert('Please provide a name for the home slideshow image.');
      return;
    }

    if (!newHomeSlideUrl.trim() && !newHomeSlideFile) {
      alert('Please provide either an image URL or upload a file');
      return;
    }

    setUploadingHomeSlide(true);
    try {
      let imageUrl = newHomeSlideUrl.trim();
      
      // If file is provided, upload it first
      if (newHomeSlideFile) {
        imageUrl = await uploadFileToStorage(newHomeSlideFile, 'home-slideshow');
      }

      const docRef = await addDoc(collection(db, 'homeSlideshowImages'), {
        url: imageUrl,
        name: newHomeSlideName.trim(),
        createdAt: serverTimestamp(),
      });

      setHomeSlides([
        {
          id: docRef.id,
          url: imageUrl,
          name: newHomeSlideName.trim(),
          createdAt: new Date(),
        },
        ...homeSlides,
      ]);

      setNewHomeSlideUrl('');
      setNewHomeSlideName('');
      setNewHomeSlideFile(null);
      // Reset file input
      const fileInput = document.getElementById('home-slide-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error uploading home slideshow image:', error);
      alert('Failed to upload home slideshow image');
    } finally {
      setUploadingHomeSlide(false);
    }
  };

  const handleDeleteHomeSlide = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this image from the home page slideshow?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'homeSlideshowImages', id));
      setHomeSlides(homeSlides.filter(img => img.id !== id));
    } catch (error) {
      console.error('Error deleting home slideshow image:', error);
      alert('Failed to delete home slideshow image');
    }
  };


  const handleSaveHomepageImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!homepageImageUrl.trim() && !homepageImageFile) {
      alert('Please provide an image URL or upload a file');
      return;
    }

    setSavingHomepageImage(true);
    try {
      let imageUrl = homepageImageUrl.trim();
      
      // If file is provided, upload it first
      if (homepageImageFile) {
        imageUrl = await uploadFileToStorage(homepageImageFile, 'homepage');
      }

      // Get existing homepage image docs
      const homepageDocs = await getDocs(collection(db, 'homepageImage'));
      
      if (!homepageDocs.empty) {
        // Update existing doc
        const docId = homepageDocs.docs[0].id;
        await setDoc(doc(db, 'homepageImage', docId), {
          url: imageUrl,
          name: homepageImageName.trim() || 'Homepage Image',
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new doc
        await addDoc(collection(db, 'homepageImage'), {
          url: imageUrl,
          name: homepageImageName.trim() || 'Homepage Image',
          updatedAt: serverTimestamp()
        });
      }

      setHomepageImage({
        url: imageUrl,
        name: homepageImageName.trim() || 'Homepage Image',
        updatedAt: new Date()
      });
      
      setHomepageImageUrl(imageUrl);
      setHomepageImageFile(null);
      // Reset file input
      const fileInput = document.getElementById('homepage-image-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      alert('Homepage image saved successfully!');
    } catch (error) {
      console.error('Error saving homepage image:', error);
      alert('Failed to save homepage image');
    } finally {
      setSavingHomepageImage(false);
    }
  };

  const handleClearHomepageImage = async () => {
    if (!window.confirm('Are you sure you want to remove the homepage image?')) {
      return;
    }

    try {
      const homepageDocs = await getDocs(collection(db, 'homepageImage'));
      if (!homepageDocs.empty) {
        await deleteDoc(doc(db, 'homepageImage', homepageDocs.docs[0].id));
      }
      setHomepageImage(null);
      setHomepageImageUrl('');
      setHomepageImageName('');
      alert('Homepage image removed successfully!');
    } catch (error) {
      console.error('Error removing homepage image:', error);
      alert('Failed to remove homepage image');
    }
  };

  // const handleClearInventoryImage = async () => {
  //   if (!window.confirm('Are you sure you want to remove the inventory image?')) {
  //     return;
  //   }

  //   try {
  //     const inventoryDocs = await getDocs(collection(db, 'inventoryImage'));
  //     if (!inventoryDocs.empty) {
  //       await deleteDoc(doc(db, 'inventoryImage', inventoryDocs.docs[0].id));
  //     }
  //     setInventoryImage(null);
  //     setInventoryImageUrl('');
  //     setInventoryImageName('');
  //     alert('Inventory image removed successfully!');
  //   } catch (error) {
  //     console.error('Error removing inventory image:', error);
  //     alert('Failed to remove inventory image');
  //   }
  // };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="image-library">
      <div className="section-header">
        <h2>Image Library</h2>
        <p className="section-description">
          Add and manage images for your website. Copy URLs to use in blog posts or page content.
        </p>
      </div>

      <div id="section-homepage-slideshow" className="section-header" style={{ marginTop: '3rem' }}>
        <h2>Home Page Slideshow Images</h2>
        <p className="section-description">
          Manage the images used in the Home page slideshow gallery. These are separate from the Charters gallery.
        </p>
      </div>

      <form onSubmit={handleHomeSlideUpload} className="upload-form">
        <div className="form-group">
          <label htmlFor="homeSlideName">Home Slideshow Image Name</label>
          <input
            type="text"
            id="homeSlideName"
            value={newHomeSlideName}
            onChange={(e) => setNewHomeSlideName(e.target.value)}
            placeholder="e.g., Morning Harbor"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="homeSlideUrl">Home Slideshow Image URL (or upload file below)</label>
          <input
            type="url"
            id="homeSlideUrl"
            value={newHomeSlideUrl}
            onChange={(e) => setNewHomeSlideUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="home-slide-file">Or Upload Image File</label>
          <input
            type="file"
            id="home-slide-file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                handleFileSelect(file, (croppedFile) => {
                  setNewHomeSlideFile(croppedFile);
                  setNewHomeSlideUrl('');
                });
              }
            }}
          />
          {newHomeSlideFile && <p style={{ fontSize: '0.85rem', color: '#EADAB6', marginTop: '0.25rem' }}>Selected: {newHomeSlideFile.name}</p>}
        </div>
        <button type="submit" className="btn-upload" disabled={uploadingHomeSlide}>
          {uploadingHomeSlide ? 'Adding...' : '+ Add Home Slideshow Image'}
        </button>
      </form>

      {loadingHomeSlides ? (
        <div className="loading">Loading home slideshow images...</div>
      ) : homeSlides.length === 0 ? (
        <div className="empty-state">
          <p>No home slideshow images yet. Add your first home slideshow image!</p>
        </div>
      ) : (
        <div className="images-grid">
          {homeSlides.map(image => (
            <div key={image.id} className="image-card">
              <div className="image-preview">
                <img src={image.url} alt={image.name} />
              </div>
              <div className="image-info">
                <h3>{image.name}</h3>
                <div className="image-url">
                  <input 
                    type="text" 
                    value={image.url} 
                    readOnly 
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button 
                    onClick={() => copyToClipboard(image.url, image.id)}
                    className="btn-copy"
                  >
                    {copiedId === image.id ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <button 
                  onClick={() => handleDeleteHomeSlide(image.id)}
                  className="btn-delete-img"
                >
                  Remove from Home Slideshow
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div id="section-homepage-image" className="section-header" style={{ marginTop: '3rem' }}>
        <h2>Homepage Image</h2>
        <p className="section-description">
          Set the main hero image for the homepage. This is a single image displayed prominently on the home page.
        </p>
      </div>

      <form onSubmit={handleSaveHomepageImage} className="upload-form">
        <div className="form-group">
          <label htmlFor="homepageImageName">Image Name</label>
          <input
            type="text"
            id="homepageImageName"
            value={homepageImageName}
            onChange={(e) => setHomepageImageName(e.target.value)}
            placeholder="e.g., Homepage Hero Image"
          />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="homepageImageUrl">Image URL (or upload file below)</label>
          <input
            type="url"
            id="homepageImageUrl"
            value={homepageImageUrl}
            onChange={(e) => setHomepageImageUrl(e.target.value)}
            placeholder="https://example.com/homepage-hero.jpg"
          />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="homepage-image-file">Or Upload Image File</label>
          <input
            type="file"
            id="homepage-image-file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                handleFileSelect(file, (croppedFile) => {
                  setHomepageImageFile(croppedFile);
                  setHomepageImageUrl('');
                });
              }
            }}
          />
          {homepageImageFile && <p style={{ fontSize: '0.85rem', color: '#EADAB6', marginTop: '0.25rem' }}>Selected: {homepageImageFile.name}</p>}
        </div>
        <button type="submit" className="btn-upload" disabled={savingHomepageImage}>
          {savingHomepageImage ? 'Saving...' : 'Save Homepage Image'}
        </button>
      </form>

      {loadingHomepageImage ? (
        <div className="loading">Loading homepage image...</div>
      ) : !homepageImage || !homepageImage.url ? (
        <div className="empty-state">
          <p>No homepage image set yet. Add a homepage image above.</p>
        </div>
      ) : (
        <div className="images-grid">
          <div className="image-card">
              <div className="image-preview">
              <img src={homepageImage.url} alt={homepageImage.name || 'Homepage Image'} />
              </div>
              <div className="image-info">
              <h3>{homepageImage.name || 'Homepage Image'}</h3>
                <div className="image-url">
                  <input 
                    type="text" 
                  value={homepageImage.url} 
                    readOnly 
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button 
                  onClick={() => copyToClipboard(homepageImage.url, 'homepage')}
                    className="btn-copy"
                  >
                  {copiedId === 'homepage' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <button 
                onClick={handleClearHomepageImage}
                  className="btn-delete-img"
                >
                Remove Homepage Image
                </button>
              </div>
            </div>
        </div>
      )}

      {cropperFile && (
        <ImageCropper
          imageFile={cropperFile}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={cropperAspectRatio}
        />
      )}
    </div>
  );
};

export default ImageLibrary;


