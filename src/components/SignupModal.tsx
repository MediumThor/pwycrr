import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import './SignupModal.css';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal = ({ isOpen, onClose }: SignupModalProps) => {
  const year = '2026';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    skipper: '',
    boatName: '',
    boatType: '',
    sailNo: '',
    lmphrfRating: '',
    yachtClub: '',
    phone: '',
    email: '',
    fleet: '',
    tempRatingRequest: false,
    liabilityWaiverAcknowledged: false,
  });

  const [files, setFiles] = useState({
    mwphrfCertificate: null as File | null,
    insuranceCertificate: null as File | null,
    boatPicture: null as File | null,
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsSuccess(false); // Reset success state when modal opens
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFiles(prev => ({
      ...prev,
      [name]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.liabilityWaiverAcknowledged) {
      alert('Please acknowledge the liability waiver before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let fileUrls: { [key: string]: string } = {};
      
      // Upload files to Firebase Storage
      try {
        const uploadPromises: Promise<void>[] = [];
        
        if (files.mwphrfCertificate) {
          const timestamp = Date.now();
          const fileName = `regatta-registrations/${timestamp}-mwphrf-${files.mwphrfCertificate.name}`;
          const storageRef = ref(storage, fileName);
          uploadPromises.push(
            uploadBytes(storageRef, files.mwphrfCertificate).then(async () => {
              fileUrls.mwphrfCertificateUrl = await getDownloadURL(storageRef);
            })
          );
        }
        
        if (files.insuranceCertificate) {
          const timestamp = Date.now();
          const fileName = `regatta-registrations/${timestamp}-insurance-${files.insuranceCertificate.name}`;
          const storageRef = ref(storage, fileName);
          uploadPromises.push(
            uploadBytes(storageRef, files.insuranceCertificate).then(async () => {
              fileUrls.insuranceCertificateUrl = await getDownloadURL(storageRef);
            })
          );
        }
        
        if (files.boatPicture) {
          const timestamp = Date.now();
          const fileName = `regatta-registrations/${timestamp}-boat-${files.boatPicture.name}`;
          const storageRef = ref(storage, fileName);
          uploadPromises.push(
            uploadBytes(storageRef, files.boatPicture).then(async () => {
              fileUrls.boatPictureUrl = await getDownloadURL(storageRef);
            })
          );
        }
        
        // Wait for all file uploads to complete
        await Promise.all(uploadPromises);
      } catch (storageError) {
        console.error('Error uploading files to Storage:', storageError);
        throw new Error(`Failed to upload files: ${storageError instanceof Error ? storageError.message : 'Unknown error'}`);
      }
      
      // Save registration data to Firestore
      try {
        const registrationData = {
          skipper: formData.skipper.trim(),
          boatName: formData.boatName.trim(),
          boatType: formData.boatType.trim(),
          sailNo: formData.sailNo.trim(),
          lmphrfRating: formData.lmphrfRating.trim(),
          yachtClub: formData.yachtClub.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          fleet: formData.fleet,
          tempRatingRequest: formData.tempRatingRequest,
          liabilityWaiverAcknowledged: formData.liabilityWaiverAcknowledged,
          fileUrls: fileUrls,
          status: 'new',
          createdAt: serverTimestamp(),
        };
        
        await addDoc(collection(db, 'regattaRegistrations'), registrationData);
      } catch (firestoreError) {
        console.error('Error saving to Firestore:', firestoreError);
        throw new Error(`Failed to save registration: ${firestoreError instanceof Error ? firestoreError.message : 'Unknown error'}`);
      }
      
      // Show success message
      setIsSuccess(true);
      
      // Reset form
      setFormData({
        skipper: '',
        boatName: '',
        boatType: '',
        sailNo: '',
        lmphrfRating: '',
        yachtClub: '',
        phone: '',
        email: '',
        fleet: '',
        tempRatingRequest: false,
        liabilityWaiverAcknowledged: false,
      });
      setFiles({
        mwphrfCertificate: null,
        insuranceCertificate: null,
        boatPicture: null,
      });
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="signup-modal-backdrop" onClick={handleBackdropClick}>
      <div className="signup-modal-container">
        <button className="signup-modal-close" onClick={onClose} aria-label="Close modal">
          <FaTimes />
        </button>
        
        <div className="signup-modal-content">
          {isSuccess ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2 className="success-title">Registration Received!</h2>
              <p className="success-text">
                Thank you for registering for the {year} Rendezvous Regatta!
              </p>
              <p className="success-text">
                We have received your registration and look forward to seeing you at the race.
              </p>
              <button className="success-button" onClick={onClose}>
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 className="signup-modal-title">{year} Rendezvous Regatta Registration</h2>
          <p className="signup-modal-subtitle">Port Washington Yacht Club • Port Washington, WI</p>
          <p className="signup-modal-deadline">Deadline: August 31, 2026</p>
          
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="skipper">Skipper *</label>
                <input
                  type="text"
                  id="skipper"
                  name="skipper"
                  value={formData.skipper}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="boatType">Boat Type/Length *</label>
                <input
                  type="text"
                  id="boatType"
                  name="boatType"
                  value={formData.boatType}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="boatName">Boat Name *</label>
                <input
                  type="text"
                  id="boatName"
                  name="boatName"
                  value={formData.boatName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="sailNo">Sail No. *</label>
                <input
                  type="text"
                  id="sailNo"
                  name="sailNo"
                  value={formData.sailNo}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lmphrfRating">LMPHRF Rating</label>
                <input
                  type="text"
                  id="lmphrfRating"
                  name="lmphrfRating"
                  value={formData.lmphrfRating}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="yachtClub">Yacht Club</label>
                <input
                  type="text"
                  id="yachtClub"
                  name="yachtClub"
                  value={formData.yachtClub}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fleet">Fleet *</label>
                <select
                  id="fleet"
                  name="fleet"
                  value={formData.fleet}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Fleet</option>
                  <option value="racing">Racing</option>
                  <option value="cruising">Cruising</option>
                </select>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="tempRatingRequest"
                  checked={formData.tempRatingRequest}
                  onChange={handleInputChange}
                />
                Request for Temporary Rating (Jib and Main / Cruising class only)
              </label>
            </div>

            <div className="file-uploads">
              <h3 className="file-uploads-title">Boat Picture (Optional)</h3>
              
              <div className="form-row">
                <div className="form-group file-group">
                  <label htmlFor="boatPicture">Boat Picture</label>
                  <input
                    type="file"
                    id="boatPicture"
                    name="boatPicture"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                  />
                  {files.boatPicture && (
                    <span className="file-name">{files.boatPicture.name}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="file-uploads">
              <h3 className="file-uploads-title">Required Documents</h3>
              
              <div className="form-row">
                <div className="form-group file-group">
                  <label htmlFor="mwphrfCertificate">MWPHRF Certificate</label>
                  <input
                    type="file"
                    id="mwphrfCertificate"
                    name="mwphrfCertificate"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                  {files.mwphrfCertificate && (
                    <span className="file-name">{files.mwphrfCertificate.name}</span>
                  )}
                </div>

                <div className="form-group file-group">
                  <label htmlFor="insuranceCertificate">Proof of Insurance Certificate *</label>
                  <input
                    type="file"
                    id="insuranceCertificate"
                    name="insuranceCertificate"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    required
                  />
                  {files.insuranceCertificate && (
                    <span className="file-name">{files.insuranceCertificate.name}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="waiver-download-section">
              <a 
                href="/Liability Waiver.pdf" 
                download="Liability Waiver.pdf"
                className="waiver-download-link-button"
              >
                Download Liability Waiver PDF
              </a>
            </div>

            <div className="form-group checkbox-group waiver-acknowledgement">
              <label>
                <input
                  type="checkbox"
                  name="liabilityWaiverAcknowledged"
                  checked={formData.liabilityWaiverAcknowledged}
                  onChange={handleInputChange}
                  required
                />
                <span>
                  I acknowledge that I have read and understand the{' '}
                  <a 
                    href="/Liability Waiver.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="waiver-link-inline"
                  >
                    Liability Waiver
                  </a>
                  . I understand the risks involved in participating in this regatta and agree to the terms and conditions outlined in the waiver. *
                </span>
              </label>
            </div>

            <div className="form-footer">
              <p className="form-note">
                * Required fields. Entry fee: $25 (payable during registration on August 31, 2026)
              </p>
              <div className="form-buttons">
                <button type="button" className="cancel-button" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                </button>
              </div>
            </div>
          </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupModal;

