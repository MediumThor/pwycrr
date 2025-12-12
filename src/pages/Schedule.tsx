import './Schedule.css';

const Schedule = () => {
  return (
    <div className="schedule-page">
      <div className="schedule-hero">
        <h1>Schedule</h1>
        <p>2026 Rendezvous Regatta Schedule</p>
      </div>

      <div className="schedule-content">
        <div className="schedule-timeline">
          <div className="timeline-item">
            <div className="timeline-time">08:00 - 09:30</div>
            <div className="timeline-content">
              <h3>Registration</h3>
              <p>Saturday, August 29th, 2026</p>
              <p>Port Washington Yacht Club</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-time">09:15</div>
            <div className="timeline-content">
              <h3>Captains Meeting</h3>
              <p>Port Washington Yacht Club</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-time">11:00</div>
            <div className="timeline-content">
              <h3>Warning Signal - First Race</h3>
              <p>Saturday, August 29th, 2026</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-time">14:00</div>
            <div className="timeline-content">
              <h3>Warning Signal - Second Race</h3>
              <p>Saturday, August 29th, 2026</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-time">18:00</div>
            <div className="timeline-content">
              <h3>Awards Banquet</h3>
              <p>Saturday, August 29th, 2026</p>
              <p>Port Washington Yacht Club</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-time">20:00</div>
            <div className="timeline-content">
              <h3>After Party</h3>
              <p>Saturday, August 29th, 2026</p>
              <p>Port Washington Yacht Club</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;

