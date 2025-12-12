import { FaFacebook, FaInstagram } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-landing">
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
            <FaFacebook size="2rem" />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-link">
            <FaInstagram size="2rem" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

