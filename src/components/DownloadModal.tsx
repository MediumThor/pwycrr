import { useEffect, useState } from 'react';
import { FaTimes, FaDownload } from 'react-icons/fa';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import './DownloadModal.css';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfPath: string;
  downloadFileName: string;
  showNORContent?: boolean;
  showWaiverContent?: boolean;
}

const DownloadModal = ({ isOpen, onClose, title, pdfPath, downloadFileName, showNORContent, showWaiverContent }: DownloadModalProps) => {
  const [waiverFormData, setWaiverFormData] = useState({
    boatName: '',
    signature: '',
    date: ''
  });
  const [isSubmittingWaiver, setIsSubmittingWaiver] = useState(false);
  const [waiverSuccess, setWaiverSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setWaiverSuccess(false);
      setWaiverFormData({ boatName: '', signature: '', date: '' });
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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleWaiverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingWaiver(true);

    try {
      await addDoc(collection(db, 'liabilityWaivers'), {
        boatName: waiverFormData.boatName,
        signature: waiverFormData.signature,
        date: waiverFormData.date,
        submittedAt: serverTimestamp(),
      });

      setWaiverSuccess(true);
      setWaiverFormData({ boatName: '', signature: '', date: '' });
      
      setTimeout(() => {
        setWaiverSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting waiver:', error);
      alert('Error submitting waiver. Please try again.');
    } finally {
      setIsSubmittingWaiver(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal-container ${showNORContent ? 'nor-modal' : ''} ${showWaiverContent ? 'waiver-modal' : ''}`}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <FaTimes />
        </button>
        
        <div className="modal-content">
          {showNORContent ? (
            <div className="nor-content">
              <img src="/Logo.png" alt="PWYC Logo" className="nor-logo" />
              <h2 className="nor-header">2026 Rendezvous Regatta</h2>
              <p className="nor-subheader">Port Washington Yacht Club</p>
              <p className="nor-subheader">Port Washington, Wisconsin</p>
              <h3 className="nor-title">Notice of Race</h3>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <button className="nor-download-button" onClick={handleDownload}>
                  <FaDownload />
                  <span>Download NOR</span>
                </button>
              </div>
              <p className="nor-date">August 29th, 2026</p>
              
              <div className="nor-body">
                <p><strong>1. RULES</strong> The regatta will be governed by the rules as defined in the Racing Rules of Sailing including RRS Appendix V.</p>
                
                <p><strong>2. ADVERTISING</strong> May be required to display advertising chosen and supplied by the organizing authority.</p>
                
                <p><strong>3. ELIGIBILITY, ENTRY and FEES</strong></p>
                <p>3.1 The regatta is open to all boats that have a valid MWPHRF certificate.</p>
                <p>3.2 Jib and Main (Cruising Class) only, a MWPHRF certificate is optional, if one is not provided, a PHRF handicap will be assigned but is not to be considered accurate and is not grounds for redress.</p>
                <p>3.3 Eligible boats may enter by completing the entry form and sending it and the liability waiver to Dan Garcia at RaceDirector@pwycwi.com by August 28th, 2026. All online applicants must turn in their liability waiver and PHRF certificate to the registration table at the PWYC on Saturday, August 29th, 2026, from 0800 to 0930 OR email to Dan Garcia at RaceDirector@pwycwi.com by 23:59 August 28th, 2026. Thanks to the generous support of sponsors there is no entry fee.</p>
                
                <p><strong>4. SCHEDULE</strong></p>
                <p>4.1 Registration: Saturday, August 29th, 2026 from 0800 to 0930.</p>
                <p>4.2 Competitors' briefing: 09:15 at Port Washington Yacht Club</p>
                <p>4.3 The scheduled time of the warning signal for the first race is 1100 Saturday, August 29th, 2026.</p>
                
                <p><strong>5. MEASUREMENTS</strong></p>
                <p>Each boat shall produce a valid MWPHRF certificate.</p>
                
                <p><strong>6. SAILING INSTRUCTIONS</strong></p>
                <p>The sailing instructions will consist of the instructions in RRS Appendix S, Standard Sailing Instructions, and supplementary sailing instructions will be available at registration. Oral changes to the Sailing Instructions may be communicated over VHF radio prior to the first warning signal of each race.</p>
                
                <p><strong>7. VENUE and RACING AREA</strong></p>
                <p>The venue will be Port Washington Yacht Club and Port Washington Marina. The racing area will be Lake Michigan approximately ½ mile east of the Port Washington harbor.</p>
                
                <p><strong>8. THE COURSES</strong></p>
                <p>The courses to be sailed will be windward-leeward courses.</p>
                
                <p><strong>9. PENALTY SYSTEM</strong></p>
                <p>9.1 RRS Appendix V will apply</p>
                
                <p><strong>10. SCORING</strong></p>
                <p>10.1 Races will be scored per MWPHRF TOD.</p>
                <p>10.2 One race is required to be completed to constitute a series.</p>
                <p>10.3 (a) Two races are scheduled.</p>
                <p>(b) All races will be scored. This changes RRS Appendix A2.</p>
                
                <p><strong>11. RADIO COMMUNICATION</strong></p>
                <p>Except in an emergency, a boat shall neither make radio transmissions while racing nor receive radio communications not available to all boats. This restriction also applies to mobile telephones. The Race Committee intends to make courtesy broadcasts over VHF 72.</p>
                
                <p><strong>12. PRIZES</strong></p>
                <p>There may be some!</p>
                
                <p><strong>13. DISCLAIMER OF LIABILITY</strong></p>
                <p>Competitors participate in the regatta entirely at their own risk. See rule 3, Decision to Race. The organizing authority will not accept any liability for material damage or personal injury or death sustained in conjunction with or prior to, during, or after the regatta.</p>
                
                <p><strong>14. INSURANCE</strong></p>
                <p>Each participating boat shall be insured with valid third-party liability insurance.</p>
                
                <p><strong>15. FURTHER INFORMATION</strong></p>
                <p>For further information please contact RaceDirector@pwycwi.com</p>
                
                <p className="nor-reminder"><strong>REMINDER</strong><br />
                Please call the Port Washington Marina at 262-284-6606 to reserve a dock space in advance.</p>
              </div>
            </div>
          ) : showWaiverContent ? (
            <div className="waiver-content">
              <img src="/Logo.png" alt="PWYC Logo" className="waiver-logo" />
              <h2 className="waiver-header">SAILBOAT REGATTA RELEASE AND WAIVER OF LIABILITY</h2>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <button className="waiver-download-button" onClick={handleDownload}>
                  <FaDownload />
                  <span>Download Liability Waiver</span>
                </button>
              </div>
              
              <div className="waiver-body">
                <p>In consideration of being permitted to participate in the Port Washington Yacht Club (PWYC) sailboat racing I, the undersigned hereby:</p>
                
                <p><strong>1.</strong> Waive and release any and all claims, including claims for negligence or equivalent conduct (but not intentional conduct), which I may have against the Club, respective members, trustees, directors, officers, employees, volunteers, measurers, judges, independent contractors, sponsors, designees, successors, assigns, insurers and affiliates (hereinafter collectively "releases") resulting from my participating in the Race and all activities related to the Race. I understand that such negligence could include but is not limited to a failure to use reasonable care in deciding whether or not to start or continue the Race and any other decisions arising out of race management; operating power boats, cranes, or other equipment; maintaining launch ramps, cranes, piers, docks, marks, buoys, and other property; in training or supervising employees or volunteers; in providing instructions or services; or in providing any first aid or emergency medical treatment.</p>
                
                <p><strong>2.</strong> Agree not to sue any of the releases for any damages, costs, losses, expenses, demands, claims, or causes of action arising out of the Race.</p>
                
                <p><strong>3.</strong> Acknowledge that serious accidents may occur during the Race and that I may sustain death, disability, serious personal injury, and/or property damage, and acknowledge my responsibilities in participating in the Race, for my decisions to start or continue to race in the Race and to ensure that my boat, equipment, and crew are seaworthy for the conditions which may be encountered during my participation.</p>
                
                <p><strong>4.</strong> Agree that the decision to participate in a race or to continue racing is mine alone.</p>
                
                <p><strong>5.</strong> Agree that this Release and Waiver of Liability is intended to be as broad and inclusive as permitted by the laws of the State of Wisconsin and that in the event that any provision is held to be prohibited or invalid, the remainder of this Release and Waiver of Liability shall continue in full legal force and effect, and that this Release and Waiver of Liability supersedes all prior negotiations, representations or agreements between myself and anyone or more of the releases.</p>
                
                <p>By signing below, I acknowledge that I have read this agreement, understand its terms, have had the opportunity to review, discuss and negotiate its terms and conditions and understand that by signing, I am giving up substantial rights.</p>
                
                <p>I have read the foregoing entry, including its release provisions, and I hereby accept its terms and conditions. I agree to be bound by The Racing Rules of Sailing and by all other rules of PWYC racing.</p>
                
                <form className="waiver-form" onSubmit={handleWaiverSubmit}>
                  <div className="waiver-form-field">
                    <label>Boat name:</label>
                    <input 
                      type="text" 
                      value={waiverFormData.boatName}
                      onChange={(e) => setWaiverFormData({ ...waiverFormData, boatName: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="waiver-form-field">
                    <label>Owner/Person in Charge signature:</label>
                    <input 
                      type="text" 
                      value={waiverFormData.signature}
                      onChange={(e) => setWaiverFormData({ ...waiverFormData, signature: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="waiver-form-field">
                    <label>Date:</label>
                    <input 
                      type="text" 
                      value={waiverFormData.date}
                      onChange={(e) => setWaiverFormData({ ...waiverFormData, date: e.target.value })}
                      required
                    />
                  </div>

                  {waiverSuccess && (
                    <div className="waiver-success-message">
                      Waiver submitted successfully!
                    </div>
                  )}

                  <button type="submit" className="waiver-submit-button" disabled={isSubmittingWaiver}>
                    {isSubmittingWaiver ? 'Submitting...' : 'Submit Waiver'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <>
              <h2 className="modal-title">{title}</h2>
              <p className="modal-description">
                Click the button below to download the {title.toLowerCase()}.
              </p>
              
              <button className="modal-download-button" onClick={handleDownload}>
                <FaDownload />
                <span>Download {title}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;

