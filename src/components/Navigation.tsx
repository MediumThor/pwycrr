import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const year = '2026';

  const navItems = [
    { path: '/', label: 'HOME' },
    { path: '/fleet', label: 'VIEW FLEET' },
    { path: '/schedule', label: 'SCHEDULE' },
    { path: '/sponsors', label: 'SPONSORS' },
    { path: '/contact', label: 'CONTACT' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`navigation ${scrolled ? 'navigation-scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="logo" onClick={closeMenu}>
            <img src="/Logo.png" alt="PWYC Rendezvous Regatta Logo" className="logo-img" />
            <span className="logo-title">{year} Rendezvous Regatta</span>
          </Link>
          <button 
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={(location.pathname === item.path || (item.path === '/' && location.pathname === '/')) ? 'active' : ''}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
                    <Link
                to="/admin/login"
                className="nav-sign-in"
                      onClick={closeMenu}
                    >
                Sign In
                    </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navigation;

