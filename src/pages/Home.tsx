import { useEffect, useState } from 'react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import DownloadModal from '../components/DownloadModal';
import SignupModal from '../components/SignupModal';
import './Home.css';

const Home = () => {
  const [heroImage] = useState<string>('/sailing.jpg');
  const [openModal, setOpenModal] = useState<string | null>(null);
  const year = '2026';

  useEffect(() => {
    // You can fetch hero image from Firebase here if needed
    // For now, using default image
  }, []);

  const closeModal = () => setOpenModal(null);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-image-container">
          <img src={heroImage} alt="Sailboat" className="hero-image" />
        </div>
        <div className="hero-content-overlay">
          <div className="hero-left">
            <h1 className="hero-title">{year} PWYC RENDEZVOUS REGATTA</h1>
            <button 
              className="sign-up-button"
              onClick={() => setOpenModal('signup')}
            >
              SIGN UP
            </button>
            <div className="hero-buttons">
              <button 
                className="hero-button-secondary"
                onClick={() => setOpenModal('nor')}
              >
                NOR
              </button>
              <button 
                className="hero-button-secondary"
                onClick={() => setOpenModal('waiver')}
              >
                Liability Waiver
              </button>
              <button 
                className="hero-button-secondary"
                onClick={() => setOpenModal('entry')}
              >
                Entry Form
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="content-section">
        <div className="content-wrapper">
          <h2 className="content-title">18th Annual PWYC Rendezvous Regatta</h2>
          <img src="/Logo.png" alt="PWYC Logo" className="content-logo" />
          <div className="content-text-box">
            <p className="content-text">
              The Port Washington Yacht Club proudly invites sailors to the 18th Annual Rendezvous Regatta, a long-standing tradition that brings together competitive racing, good seamanship, and the camaraderie that defines our sailing community.
            </p>
            <p className="content-text">
              This yearly regatta features two races, with the potential for a third race depending on conditions and time. Courses are designed as windward–leeward races, providing fair, engaging competition for a wide range of boats and skill levels while emphasizing tactical sailing, clean starts, and strong boat-handling.
            </p>
            <p className="content-text">
              All sailboats wishing to race are welcome. Whether you are a seasoned racer or looking to test your boat and crew in a friendly but well-run event, the Rendezvous Regatta offers a professional race environment with an approachable, fun atmosphere.
            </p>
            <p className="content-text">
              Join us on the water for a full day of sailing, followed by shoreside fellowship at PWYC as we celebrate another year of racing on Lake Michigan.
            </p>
            <p className="content-text">
              Fair winds, good racing, and we look forward to seeing you on the starting line.
            </p>
          </div>
          
          {/* Image Grid */}
          <div className="image-grid">
            <div className="grid-item">
              <img src="/bottom1.JPG" alt="Rendezvous Regatta" />
            </div>
            <div className="grid-item">
              <img src="/bottom2.JPG" alt="Rendezvous Regatta" />
            </div>
            <div className="grid-item">
              <img src="/bottom3.JPEG" alt="Rendezvous Regatta" />
            </div>
          </div>
          
          <div className="submit-photos-container">
            <a 
              href="mailto:racedirector@pwycwi.com?subject=Photo Submission for Rendezvous Regatta"
              className="submit-photos-button"
            >
              Submit Photos
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content-landing">
          <a 
            href="https://www.google.com/maps/place/Port+Washington+Yacht+Club/@43.3918745,-87.8681159,17z/data=!3m1!4b1!4m6!3m5!1s0x8804ea1cbd453539:0x7d30452aaee626c4!8m2!3d43.3918706!4d-87.865541!16s%2Fg%2F1tfpq7zy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="maps-button"
          >
            <img src="/pwycmap.png" alt="Port Washington Yacht Club Location" className="footer-map-image" />
          </a>

          <div className="footer-copyright">
            <p>© 2026 PWYC RENDEZVOUS REGATTA</p>
          </div>

          <div className="footer-social-links">
            <a href="https://www.facebook.com/PWYCWI" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-link">
              <FaFacebook size="2.4rem" />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-link">
              <FaInstagram size="2.4rem" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DownloadModal
        isOpen={openModal === 'nor'}
        onClose={closeModal}
        title="NOR"
        pdfPath="/PWYC NOR and SI's 2026.pdf"
        downloadFileName="PWYC NOR and SI's 2026.pdf"
        showNORContent={true}
      />
      <DownloadModal
        isOpen={openModal === 'waiver'}
        onClose={closeModal}
        title="Liability Waiver"
        pdfPath="/Liability Waiver.pdf"
        downloadFileName="Liability Waiver.pdf"
        showWaiverContent={true}
      />
      <DownloadModal
        isOpen={openModal === 'entry'}
        onClose={closeModal}
        title="Entry Form"
        pdfPath="/entry-form.pdf"
        downloadFileName="Entry-Form.pdf"
      />
      <SignupModal
        isOpen={openModal === 'signup'}
        onClose={closeModal}
      />
    </div>
  );
};

export default Home;
