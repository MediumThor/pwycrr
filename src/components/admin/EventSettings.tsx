import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './EventSettings.css';

interface EventSettings {
  year: string;
}

const EventSettings = () => {
  const [settings, setSettings] = useState<EventSettings>({ year: '2026' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'eventSettings', 'rendezvous');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings(docSnap.data() as EventSettings);
      } else {
        // Default to 2026 if no settings exist
        setSettings({ year: '2026' });
      }
    } catch (error) {
      console.error('Error fetching event settings:', error);
      // Default to 2026 on error
      setSettings({ year: '2026' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'eventSettings', 'rendezvous');
      await setDoc(docRef, settings);
      alert('Event settings saved successfully!');
    } catch (error) {
      console.error('Error saving event settings:', error);
      alert('Failed to save event settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof EventSettings, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return <div className="event-settings-loading">Loading event settings...</div>;
  }

  return (
    <div className="event-settings">
      <div className="event-settings-header">
        <h2>Event Settings</h2>
        <p className="event-settings-description">
          Update the event year. This will automatically update the header and hero page title.
        </p>
      </div>

      <div className="event-settings-form">
        <div className="form-group">
          <label htmlFor="year">Event Year *</label>
          <input
            type="text"
            id="year"
            value={settings.year}
            onChange={(e) => handleChange('year', e.target.value)}
            placeholder="e.g., 2026"
            pattern="[0-9]{4}"
            maxLength={4}
            required
          />
          <small className="form-hint">Enter the 4-digit year (e.g., 2026, 2027)</small>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleSave} 
            className="save-button"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div className="settings-preview">
          <h3>Preview</h3>
          <div className="preview-item">
            <strong>Header:</strong> {settings.year} Rendezvous Regatta
          </div>
          <div className="preview-item">
            <strong>Hero Title:</strong> {settings.year} Rendezvous Regatta
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSettings;

