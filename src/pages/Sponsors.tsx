import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import LoadingSpinner from '../components/LoadingSpinner';
import './Sponsors.css';

interface Sponsor {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  createdAt: Timestamp | null;
}

const Sponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    fetchSponsors();
  }, []);

  const stopLoadingWithDelay = () => {
    const elapsed = Date.now() - loadingStartTimeRef.current;
    const minDuration = 500; // 0.5 seconds
    const remainingTime = Math.max(0, minDuration - elapsed);
    
    setTimeout(() => {
      setLoading(false);
    }, remainingTime);
  };

  const fetchSponsors = async () => {
    loadingStartTimeRef.current = Date.now();
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
      stopLoadingWithDelay();
    }
  };

  if (loading) {
    return (
      <div className="sponsors-page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="sponsors-page">
      <div className="sponsors-hero">
        <h1>Our Sponsors</h1>
        <p>Thank you to our generous sponsors who make this regatta possible!</p>
      </div>

      <div className="sponsors-content">
        {sponsors.length === 0 ? (
          <div className="sponsors-empty">
            <p>Sponsor information coming soon!</p>
          </div>
        ) : (
          <>
            <div className="sponsors-grid">
              {sponsors.filter(s => s.logoUrl).map((sponsor) => (
                <div key={sponsor.id} className="sponsor-card">
                  {sponsor.website ? (
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sponsor-link"
                    >
                      <img
                        src={sponsor.logoUrl}
                        alt={sponsor.name}
                        className="sponsor-logo"
                      />
                    </a>
                  ) : (
                    <img
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      className="sponsor-logo"
                    />
                  )}
                  <h3 className="sponsor-name">{sponsor.name}</h3>
                  {sponsor.website && (
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sponsor-website"
                    >
                      {sponsor.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                    </a>
                  )}
                  {sponsor.description && (
                    <p className="sponsor-description">{sponsor.description}</p>
                  )}
                </div>
              ))}
            </div>

            {sponsors.filter(s => !s.logoUrl).length > 0 && (
              <div className="sponsors-list-section">
                <h2>Additional Sponsors</h2>
                <ul className="sponsors-list">
                  {sponsors.filter(s => !s.logoUrl).map((sponsor) => (
                    <li key={sponsor.id} className="sponsor-list-item">
                      {sponsor.website ? (
                        <a
                          href={sponsor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sponsor-list-link"
                        >
                          {sponsor.name}
                        </a>
                      ) : (
                        <span>{sponsor.name}</span>
                      )}
                      {sponsor.description && (
                        <span className="sponsor-list-description"> - {sponsor.description}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sponsors;

