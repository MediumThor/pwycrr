import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import LoadingSpinner from '../components/LoadingSpinner';
import './Fleet.css';

declare global {
  interface Window {
    __fleetIndexWarningShown?: boolean;
  }
}

interface FleetMember {
  id: string;
  skipper: string;
  boatName: string;
  boatType: string;
  sailNo: string;
  lmphrfRating: string;
  yachtClub: string;
  fleet: string;
  createdAt: Timestamp | null;
  fileUrls?: {
    boatPictureUrl?: string;
  };
}

const Fleet = () => {
  const [fleetMembers, setFleetMembers] = useState<FleetMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'racing' | 'cruising'>('all');
  const loadingStartTimeRef = useRef<number>(Date.now());

  const stopLoadingWithDelay = () => {
    const elapsed = Date.now() - loadingStartTimeRef.current;
    const minDuration = 500; // 0.5 seconds
    const remainingTime = Math.max(0, minDuration - elapsed);
    
    setTimeout(() => {
      setLoading(false);
    }, remainingTime);
  };

  useEffect(() => {
    loadingStartTimeRef.current = Date.now();
    setLoading(true);
    // Set up real-time listener for approved registrations
    const registrationsRef = collection(db, 'regattaRegistrations');
    
    // Try to set up a real-time query with where + orderBy
    let q = query(
      registrationsRef,
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    
    let unsubscribe: (() => void) | null = null;
    
    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FleetMember[];

        let filtered = fetched;
        if (filter === 'racing') {
          filtered = fetched.filter(member => member.fleet === 'racing');
        } else if (filter === 'cruising') {
          filtered = fetched.filter(member => member.fleet === 'cruising');
        }

        setFleetMembers(filtered);
        stopLoadingWithDelay();
      },
      (error) => {
        // If composite index error, fall back to query without orderBy
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
          // Only log once, not repeatedly
          if (!window.__fleetIndexWarningShown) {
            console.warn('Composite index required. Using fallback query. Create index at:', error.message?.match(/https:\/\/[^\s]+/)?.[0] || 'Firebase Console > Firestore > Indexes');
            window.__fleetIndexWarningShown = true;
          }
          const fallbackQuery = query(registrationsRef, where('status', '==', 'approved'));
          unsubscribe = onSnapshot(
            fallbackQuery,
            (snapshot) => {
              const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              })) as FleetMember[];

              // Sort by createdAt descending in memory
              fetched.sort((a, b) => {
                const aTime = a.createdAt?.toMillis() || 0;
                const bTime = b.createdAt?.toMillis() || 0;
                return bTime - aTime;
              });

              let filtered = fetched;
              if (filter === 'racing') {
                filtered = fetched.filter(member => member.fleet === 'racing');
              } else if (filter === 'cruising') {
                filtered = fetched.filter(member => member.fleet === 'cruising');
              }

              setFleetMembers(filtered);
              setLoading(false);
            },
            (fallbackError) => {
              console.error('Error in fallback listener:', fallbackError);
              // Final fallback: fetch all and filter
              fetchFleet();
            }
          );
        } else {
          console.error('Error setting up fleet listener:', error);
          // Fallback to regular fetch
          fetchFleet();
        }
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [filter]);

  const fetchFleet = async () => {
    loadingStartTimeRef.current = Date.now();
    setLoading(true);
    try {
      const registrationsRef = collection(db, 'regattaRegistrations');
      let q = query(
        registrationsRef,
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q).catch(async (error) => {
        // If composite index error, fetch all approved and sort in memory
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
          // Only log once
          if (!window.__fleetIndexWarningShown) {
            const indexUrl = error.message?.match(/https:\/\/[^\s]+/)?.[0];
            console.warn('Composite index required. Using fallback query. Create index at:', indexUrl || 'Firebase Console > Firestore > Indexes');
            window.__fleetIndexWarningShown = true;
          }
          const simpleQuery = query(
            registrationsRef,
            where('status', '==', 'approved')
          );
          const simpleSnapshot = await getDocs(simpleQuery);
          const sorted = simpleSnapshot.docs.sort((a, b) => {
            const aTime = a.data().createdAt?.toMillis() || 0;
            const bTime = b.data().createdAt?.toMillis() || 0;
            return bTime - aTime; // Descending
          });
          return { docs: sorted };
        }
        throw error;
      });
      
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FleetMember[];

      let filtered = fetched;
      if (filter === 'racing') {
        filtered = fetched.filter(member => member.fleet === 'racing');
      } else if (filter === 'cruising') {
        filtered = fetched.filter(member => member.fleet === 'cruising');
      }

      setFleetMembers(filtered);
    } catch (error) {
      console.error('Error fetching fleet:', error);
      // If query fails, try fetching all and filtering in memory
      try {
        const registrationsRef = collection(db, 'regattaRegistrations');
        const allSnapshot = await getDocs(registrationsRef);
        const allFetched = allSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((member: any) => member.status === 'approved') as FleetMember[];
        
        // Sort by createdAt descending
        allFetched.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0;
          const bTime = b.createdAt?.toMillis() || 0;
          return bTime - aTime;
        });

        let filtered = allFetched;
        if (filter === 'racing') {
          filtered = allFetched.filter(member => member.fleet === 'racing');
        } else if (filter === 'cruising') {
          filtered = allFetched.filter(member => member.fleet === 'cruising');
        }

        setFleetMembers(filtered);
      } catch (fallbackError) {
        console.error('Error in fallback fetch:', fallbackError);
      }
    } finally {
      stopLoadingWithDelay();
    }
  };

  if (loading) {
    return (
      <div className="fleet-page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="fleet-page">
      <div className="fleet-hero">
        <h1>2026 Rendezvous Regatta Fleet</h1>
        <p>Registered and approved participants</p>
      </div>

      <div className="fleet-content">
        <div className="fleet-filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({fleetMembers.length})
          </button>
          <button
            className={filter === 'racing' ? 'active' : ''}
            onClick={() => setFilter('racing')}
          >
            Racing ({fleetMembers.filter(m => m.fleet === 'racing').length})
          </button>
          <button
            className={filter === 'cruising' ? 'active' : ''}
            onClick={() => setFilter('cruising')}
          >
            Cruising ({fleetMembers.filter(m => m.fleet === 'cruising').length})
          </button>
        </div>

        {fleetMembers.length === 0 ? (
          <div className="fleet-empty">
            <p>No approved fleet members yet. Check back soon!</p>
          </div>
        ) : (
          <div className="fleet-grid">
            {fleetMembers.map((member) => (
              <div key={member.id} className="fleet-card">
                {member.fileUrls?.boatPictureUrl && (
                  <div className="fleet-card-image">
                    <img 
                      src={member.fileUrls.boatPictureUrl} 
                      alt={member.boatName}
                      className="fleet-boat-image"
                    />
                  </div>
                )}
                <div className="fleet-card-header">
                  <h3>{member.boatName}</h3>
                  <span className={`fleet-badge ${member.fleet}`}>
                    {member.fleet === 'racing' ? 'Racing' : 'Cruising'}
                  </span>
                </div>
                <div className="fleet-card-details">
                  <div className="fleet-detail">
                    <strong>Skipper:</strong> {member.skipper}
                  </div>
                  <div className="fleet-detail">
                    <strong>Boat Type:</strong> {member.boatType}
                  </div>
                  <div className="fleet-detail">
                    <strong>Sail No:</strong> {member.sailNo}
                  </div>
                  {member.lmphrfRating && (
                    <div className="fleet-detail">
                      <strong>LMPHRF Rating:</strong> {member.lmphrfRating}
                    </div>
                  )}
                  {member.yachtClub && (
                    <div className="fleet-detail">
                      <strong>Yacht Club:</strong> {member.yachtClub}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Fleet;

