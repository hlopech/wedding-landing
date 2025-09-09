import '/src/styles/DetailsScreen.css'
import line from '/src/assets/line2.png'
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useState, useEffect } from 'react';

function DetailsScreen() {
  useEffect(() => {
    AOS.init({
      duration: 1800,
      once: true,
      easing: 'ease-in-out'
    });
  }, []);
 const details = [{label :"Мы очень любим ваших детей!Однако хотим предупредить, что наше торжество будет исключительно для взрослых. Заранее благодарим за понимание и с нетерпением ждем встречи с вами!"},
                {label :"Нам будет приятно,если вы поддержите цветовую палитру нашего дня, выбрав наряды в пастельных, нежных тонах. Пожалуйста, воздержитесь от одежды белого и кричаще- ярких цветов. Ваш вкус безупречен, и мы уверены, что вы сделаете идеальный выбор!"},
                {label :"Ваше присутствие на нашем празднике — уже самый главный подарок для нас. Если же вы хотите сделать нам еще один знак внимания, наиболее практичным подарком для нас станет конверт на исполнение нашей общей мечты."},
                {label :" Наша свадьба начинается с торжественной росписи в ЗАГСе Первомайского района. После этого мы будем рады встретить вас на банкете. Мы беспокоимся о вашем удобстве, и обеспечим трансфер от ЗАГСа к банкетному залу."}]
  return (
    <div className="events-section">
    <h2  className="events-title">Детали</h2>
    
    <div className="events-column">
      {details.map((event,index) => (
        <div data-aos="fade-up" key={event.label} className="event-block">
          {/* <div className="event-content"> */}
            <h2 className="event-label">{event.label}</h2>
          {/* </div> */}
          {
            index!=3?  <img src={line} className='line2'  alt="line" />:<></>
          }     
            
         
        </div>
      ))}
    </div>
  </div>
  );
}

export default DetailsScreen;