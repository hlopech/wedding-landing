import childPhoto from '/src/assets/childhood.png'
import '/src/styles/MeetingScreen.css'
import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import title_view from '/src/assets/title.png';

function MeetingScreen() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    // Установи свою дату свадьбы!
    const weddingDate = new Date('2025-10-10T15:10:00'); // 10 октября 2025, 15:00
    const now = new Date();
    const difference = weddingDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

 

  useEffect(() => {
    AOS.init({
      duration: 1800,
      once: true,
      easing: 'ease-in-out'
    });
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { days, hours, minutes, seconds } = timeLeft;
  return (
    <div className="meeting-container">
    <div className="center-section">
      <div data-aos="fade-up" className='root'>
        <img src={title_view} className='title-view' alt="Наше детство" />
        <img src={childPhoto} className='childhood' alt="Наше детство" />
        <div data-aos="fade-up" className='timer'>
          <h2 className='date'>10.10.2025</h2>

          {days === 0 && hours === 0 && minutes === 0 && seconds === 0 ? (
            <h2 className='countdown'>🎉 Сегодня наш день! 🎉</h2>
          ) : (
            <div className='countdown-container'>
              <div className='time-block'>
                <span className='time-number'>{days}</span>
                <span className='time-label'>дней</span>
              </div>
              <div className='time-block'>
                <span className='time-number'>{hours.toString().padStart(2, '0')}</span>
                <span className='time-label'>часов</span>
              </div>
              <div className='time-block'>
                <span className='time-number'>{minutes.toString().padStart(2, '0')}</span>
                <span className='time-label'>минут</span>
              </div>
              <div className='time-block'>
                <span className='time-number'>{seconds.toString().padStart(2, '0')}</span>
                <span className='time-label'>секунд</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    <div data-aos="fade-up" className="content-section">
      <p>Уважаемые гости! С огромной радостью и любовью в сердце мы, Никита и Маргарита, хотим разделить с вами наш самый важный день — день нашего бракосочетания. </p>
     
    </div>
  </div>
  );
}

export default MeetingScreen;