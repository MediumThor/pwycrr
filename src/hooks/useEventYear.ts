import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useEventYear = () => {
  const [year, setYear] = useState<string>('2026');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYear = async () => {
      try {
        const docRef = doc(db, 'eventSettings', 'rendezvous');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setYear(data.year || '2026');
        } else {
          // Default to 2026 if no settings exist
          setYear('2026');
        }
      } catch (error) {
        console.error('Error fetching event year:', error);
        // Default to 2026 on error
        setYear('2026');
      } finally {
        setLoading(false);
      }
    };

    fetchYear();

    // Set up real-time listener for changes
    const docRef = doc(db, 'eventSettings', 'rendezvous');
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setYear(data.year || '2026');
        }
      },
      (error) => {
        console.error('Error listening to event settings:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  return { year, loading };
};

