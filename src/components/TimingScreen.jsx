import '/src/styles/TimingScreen.css'
import line from '/src/assets/line2.png'
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useState, useEffect } from 'react';

function TimingScreen() {

  useEffect(() => {
    AOS.init({
      duration: 1800,
      once: true,
      easing: 'ease-in-out'
    });
  }, []);

 const events = [{label :"Торжественная роспись",time :"15.10",place:"ЗАГС Первомайского района ул.Карбышева 1/3"},
                {label :"Фотосессия",time :"15.30",place:"Мест офотосессии"},
                {label :"Начало банкета",time :"17.00",place:"M-Hall ул.Мясникова 37/2"},
                {label :"Конец банкета",time :"00.00",place:"M-Hall ул.Мясникова 37/2"}]
  return (
    <div className="events-section">
    <h2  className="events-title">Тайминг</h2>
    
    <div className="events-column">
      {events.map((event, index) => (
        <div data-aos="fade-up" key={event.label} className="event-block">
          <div className="event-content">
            <h3 className="event-label">{event.label}</h3>
            <div className="event-time">{event.time}</div>
            <div className="event-place">{event.place}</div>
            {
              index !== 3 && (
                index % 2 === 0 ? (
                  <img src={line}  alt="even line" />
                ) : (
                  <img src={line} className='line' alt="odd line" />
                )
            )            
            }

          </div>
          
         
        </div>
      ))}
    </div>
  </div>
  );
}

export default TimingScreen;