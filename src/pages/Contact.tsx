import ContactForm from '../components/ContactForm';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>Contact Us</h1>
        <p>Have questions about the regatta? We'd love to hear from you!</p>
      </div>
      <div className="contact-content">
        <ContactForm />
        <div className="contact-info">
          <h2>Race Director</h2>
          <p>
            For questions about the regatta, please contact:
          </p>
          <a href="mailto:racedirector@pwycwi.com" className="email-link">
            racedirector@pwycwi.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;

