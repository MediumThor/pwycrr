import { useEffect, useRef } from 'react';
import './Fleet.css';

const Fleet = () => {
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  // Initialize SailDash Race Teams widget
  useEffect(() => {
    const checkAndInitWidget = () => {
      const widgetElement = document.querySelector('[data-saildash-race-teams]');
      if (widgetElement) {
        console.log('SailDash Race Teams widget element found:', widgetElement);
        
        // Check if script is loaded
        const scriptLoaded = document.querySelector('script[src*="saildash-widgets.js"]');
        if (scriptLoaded) {
          console.log('SailDash script tag found');
        } else {
          console.warn('SailDash script tag not found - script may still be loading');
        }
        
        // The widget script uses MutationObserver, so it should auto-initialize
        setTimeout(() => {
          const widgetContent = widgetElement.innerHTML.trim();
          if (!widgetContent) {
            console.warn('SailDash Race Teams widget has not initialized yet. This may be normal if the script is still loading.');
          }
        }, 2000);
      }
    };
    
    // Check immediately and after a short delay
    checkAndInitWidget();
    const timeoutId = setTimeout(checkAndInitWidget, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);


  return (
    <div className="fleet-page">
      <div className="fleet-hero">
        <h1>2026 Rendezvous Regatta Fleet</h1>
        <p>Registered and approved participants</p>
      </div>

      <div className="fleet-content">
        <div className="race-teams-widget-container" ref={widgetContainerRef}>
          <div 
            id="saildash-race-teams-bfMuyZXkruEgTumgYOTI" 
            data-saildash-race-teams 
            data-race="d1a8a66eCU9S4BpXg45B" 
            data-theme="light"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Fleet;

