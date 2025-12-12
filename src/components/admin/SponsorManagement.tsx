import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import './SponsorManagement.css';

interface Sponsor {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  createdAt: Timestamp | null;
}

const SponsorManagement = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSponsor, setNewSponsor] = useState({
    name: '',
    website: 'https://',
    description: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const sponsorsRef = collection(db, 'sponsors');
      const sponsorsQuery = query(sponsorsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(sponsorsQuery);
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Sponsor[];
      setSponsors(fetched);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSponsor.name.trim()) {
      alert('Please enter a sponsor name');
      return;
    }

    setUploading(true);
    try {
      let logoUrl = '';

      if (logoFile) {
        const timestamp = Date.now();
        const fileName = `sponsors/${timestamp}-${logoFile.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, logoFile);
        logoUrl = await getDownloadURL(storageRef);
      }

      const sponsorData: any = {
        name: newSponsor.name.trim(),
        website: (newSponsor.website.trim() === 'https://' || !newSponsor.website.trim()) ? undefined : newSponsor.website.trim(),
        description: newSponsor.description.trim() || undefined,
        createdAt: serverTimestamp(),
      };

      if (logoUrl) {
        sponsorData.logoUrl = logoUrl;
      }

      await addDoc(collection(db, 'sponsors'), sponsorData);
      
      setNewSponsor({ name: '', website: 'https://', description: '' });
      setLogoFile(null);
      setIsAdding(false);
      fetchSponsors();
      alert('Sponsor added successfully!');
    } catch (error) {
      console.error('Error adding sponsor:', error);
      alert('Failed to add sponsor');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sponsor?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'sponsors', id));
      fetchSponsors();
      alert('Sponsor deleted successfully!');
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      alert('Failed to delete sponsor');
    }
  };

  if (loading) {
    return <div className="sponsors-loading">Loading sponsors...</div>;
  }

  return (
    <div className="sponsor-management">
      <div className="sponsors-header">
        <h2>Sponsor Management</h2>
        <button
          className="btn-add-sponsor"
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? 'Cancel' : '+ Add Sponsor'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSponsor} className="sponsor-form">
          <div className="form-group">
            <label htmlFor="sponsorName">Sponsor Name *</label>
            <input
              type="text"
              id="sponsorName"
              value={newSponsor.name}
              onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
              required
              placeholder="e.g., ABC Company"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sponsorWebsite">Website URL (optional)</label>
            <input
              type="text"
              id="sponsorWebsite"
              value={newSponsor.website}
              onChange={(e) => {
                let value = e.target.value;
                // If user deletes everything, restore https://
                if (value === '') {
                  value = 'https://';
                }
                // If user types something that doesn't start with http:// or https://, add https://
                else if (!value.startsWith('https://') && !value.startsWith('http://')) {
                  // Only add if they're typing (not if they just deleted to empty)
                  if (value.length > 0) {
                    value = 'https://' + value;
                  }
                }
                setNewSponsor({ ...newSponsor, website: value });
              }}
              onBlur={(e) => {
                // On blur, ensure it starts with https:// if not empty
                let value = e.target.value;
                if (value && value !== 'https://' && !value.startsWith('https://') && !value.startsWith('http://')) {
                  setNewSponsor({ ...newSponsor, website: 'https://' + value });
                }
              }}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sponsorDescription">Description (optional)</label>
            <textarea
              id="sponsorDescription"
              value={newSponsor.description}
              onChange={(e) => setNewSponsor({ ...newSponsor, description: e.target.value })}
              rows={3}
              placeholder="Brief description of the sponsor..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="sponsorLogo">Logo Image (optional)</label>
            <input
              type="file"
              id="sponsorLogo"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            />
            {logoFile && (
              <p className="file-name">Selected: {logoFile.name}</p>
            )}
          </div>

          <button type="submit" className="btn-submit" disabled={uploading}>
            {uploading ? 'Adding...' : 'Add Sponsor'}
          </button>
        </form>
      )}

      {sponsors.length === 0 ? (
        <div className="no-sponsors">No sponsors yet. Add your first sponsor above.</div>
      ) : (
        <div className="sponsors-list-admin">
          {sponsors.map((sponsor) => (
            <div key={sponsor.id} className="sponsor-item-admin">
              <div className="sponsor-info">
                {sponsor.logoUrl && (
                  <img src={sponsor.logoUrl} alt={sponsor.name} className="sponsor-logo-preview" />
                )}
                <div className="sponsor-details">
                  <h3>{sponsor.name}</h3>
                  {sponsor.website && (
                    <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="sponsor-website-link">
                      {sponsor.website}
                    </a>
                  )}
                  {sponsor.description && (
                    <p className="sponsor-desc">{sponsor.description}</p>
                  )}
                </div>
              </div>
              <button
                className="btn-delete"
                onClick={() => handleDeleteSponsor(sponsor.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SponsorManagement;

