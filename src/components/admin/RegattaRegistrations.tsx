import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './RegattaRegistrations.css';

interface RegattaRegistration {
  id: string;
  skipper: string;
  boatName: string;
  boatType: string;
  sailNo: string;
  lmphrfRating: string;
  yachtClub: string;
  phone: string;
  email: string;
  fleet: string;
  tempRatingRequest: boolean;
  liabilityWaiverAcknowledged: boolean;
  fileUrls: {
    mwphrfCertificateUrl?: string;
    insuranceCertificateUrl?: string;
    signedWaiverUrl?: string;
    boatPictureUrl?: string;
  };
  status: string;
  createdAt: Timestamp | null;
}

const RegattaRegistrations = () => {
  const [registrations, setRegistrations] = useState<RegattaRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'approved'>('all');

  useEffect(() => {
    fetchRegistrations();
  }, [filter]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const registrationsRef = collection(db, 'regattaRegistrations');
      let q = query(registrationsRef, orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as RegattaRegistration[];

      let filtered = fetched;
      if (filter === 'new') {
        filtered = fetched.filter(reg => reg.status === 'new');
      } else if (filter === 'reviewed') {
        filtered = fetched.filter(reg => reg.status === 'reviewed');
      } else if (filter === 'approved') {
        filtered = fetched.filter(reg => reg.status === 'approved');
      }

      setRegistrations(filtered);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const docRef = doc(db, 'regattaRegistrations', id);
      await updateDoc(docRef, { status: newStatus });
      // Don't set loading to true during refetch to avoid showing "no registrations"
      // Just refetch in the background
      const registrationsRef = collection(db, 'regattaRegistrations');
      let q = query(registrationsRef, orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as RegattaRegistration[];

      let filtered = fetched;
      if (filter === 'new') {
        filtered = fetched.filter(reg => reg.status === 'new');
      } else if (filter === 'reviewed') {
        filtered = fetched.filter(reg => reg.status === 'reviewed');
      } else if (filter === 'approved') {
        filtered = fetched.filter(reg => reg.status === 'approved');
      }

      setRegistrations(filtered);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string, boatName: string) => {
    if (!window.confirm(`Are you sure you want to delete the registration for "${boatName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const docRef = doc(db, 'regattaRegistrations', id);
      await deleteDoc(docRef);
      
      // Remove from local state immediately
      setRegistrations(prev => prev.filter(reg => reg.id !== id));
      
      // Optionally refetch to ensure consistency
      fetchRegistrations();
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Failed to delete registration');
    }
  };

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.toMillis()).toLocaleString();
  };

  if (loading) {
    return <div className="registrations-loading">Loading registrations...</div>;
  }

  return (
    <div className="regatta-registrations">
      <div className="registrations-header">
        <h2>Regatta Registrations</h2>
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({registrations.length})
          </button>
          <button
            className={filter === 'new' ? 'active' : ''}
            onClick={() => setFilter('new')}
          >
            New ({registrations.filter(r => r.status === 'new').length})
          </button>
          <button
            className={filter === 'reviewed' ? 'active' : ''}
            onClick={() => setFilter('reviewed')}
          >
            Reviewed ({registrations.filter(r => r.status === 'reviewed').length})
          </button>
          <button
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            Approved ({registrations.filter(r => r.status === 'approved').length})
          </button>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="no-registrations">No registrations found.</div>
      ) : (
        <div className="registrations-list">
          {registrations.map((registration) => (
            <div key={registration.id} className={`registration-card ${registration.status === 'new' ? 'new' : ''}`}>
              <div className="registration-header">
                <div className="registration-title">
                  <h3>{registration.boatName}</h3>
                  <span className="registration-status">{registration.status}</span>
                </div>
                <div className="registration-actions">
                  {registration.status === 'new' && (
                    <>
                      <button
                        className="btn-mark-reviewed"
                        onClick={() => updateStatus(registration.id, 'reviewed')}
                      >
                        Mark as Reviewed
                      </button>
                      <button
                        className="btn-approve"
                        onClick={() => updateStatus(registration.id, 'approved')}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#22c55e',
                          color: '#1a1a1a',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          transition: 'all 0.2s ease',
                          marginLeft: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#16a34a';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#22c55e';
                        }}
                      >
                        Approve for Fleet
                      </button>
                    </>
                  )}
                  {registration.status === 'reviewed' && (
                    <>
                      <button
                        className="btn-mark-new"
                        onClick={() => updateStatus(registration.id, 'new')}
                      >
                        Mark as New
                      </button>
                      <button
                        className="btn-approve"
                        onClick={() => updateStatus(registration.id, 'approved')}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#22c55e',
                          color: '#1a1a1a',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          transition: 'all 0.2s ease',
                          marginLeft: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#16a34a';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#22c55e';
                        }}
                      >
                        Approve for Fleet
                      </button>
                    </>
                  )}
                  {registration.status === 'approved' && (
                    <button
                      className="btn-mark-new"
                      onClick={() => updateStatus(registration.id, 'reviewed')}
                    >
                      Unapprove
                    </button>
                  )}
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(registration.id, registration.boatName)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {registration.fileUrls?.boatPictureUrl && (
                <div className="registration-boat-picture">
                  <img 
                    src={registration.fileUrls.boatPictureUrl} 
                    alt={`${registration.boatName}`}
                    className="boat-picture-preview"
                  />
                </div>
              )}

              <div className="registration-details">
                <div className="detail-row">
                  <strong>Skipper:</strong> {registration.skipper}
                </div>
                <div className="detail-row">
                  <strong>Boat Type/Length:</strong> {registration.boatType}
                </div>
                <div className="detail-row">
                  <strong>Sail No:</strong> {registration.sailNo}
                </div>
                <div className="detail-row">
                  <strong>LMPHRF Rating:</strong> {registration.lmphrfRating || 'N/A'}
                </div>
                <div className="detail-row">
                  <strong>Yacht Club:</strong> {registration.yachtClub || 'N/A'}
                </div>
                <div className="detail-row">
                  <strong>Fleet:</strong> {registration.fleet}
                </div>
                <div className="detail-row">
                  <strong>Phone:</strong> {registration.phone}
                </div>
                <div className="detail-row">
                  <strong>Email:</strong> {registration.email}
                </div>
                <div className="detail-row">
                  <strong>Temporary Rating Request:</strong> {registration.tempRatingRequest ? 'Yes' : 'No'}
                </div>
                <div className="detail-row">
                  <strong>Liability Waiver Acknowledged:</strong> {registration.liabilityWaiverAcknowledged ? 'Yes' : 'No'}
                </div>
                <div className="detail-row">
                  <strong>Submitted:</strong> {formatDate(registration.createdAt)}
                </div>
              </div>

              {registration.fileUrls && (
                <div className="registration-files">
                  <h4>Uploaded Documents:</h4>
                  <div className="file-links">
                    {registration.fileUrls.mwphrfCertificateUrl && (
                      <a
                        href={registration.fileUrls.mwphrfCertificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        MWPHRF Certificate
                      </a>
                    )}
                    {registration.fileUrls.insuranceCertificateUrl && (
                      <a
                        href={registration.fileUrls.insuranceCertificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        Insurance Certificate
                      </a>
                    )}
                    {registration.fileUrls.signedWaiverUrl && (
                      <a
                        href={registration.fileUrls.signedWaiverUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        Signed Waiver
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegattaRegistrations;

