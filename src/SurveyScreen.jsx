import '/src/styles/SurveyScreen.css'
import { useState } from 'react';
import { db } from '../src/lib/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {useEffect } from 'react';

function SurveyScreen() {

  useEffect(() => {
    AOS.init({
      duration: 1800,
      once: true,
      easing: 'ease-in-out'
    });
  }, []);

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        housing: '',
        allergies: '',
        alcohol: '',
        song: ''
      });

      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
          ...prevState,
          [name]: value
        }));
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
      
        // минимальная валидация перед отправкой
        if (!formData.name || !formData.location || !formData.housing || !formData.alcohol) {
          alert('Пожалуйста, заполните обязательные поля.');
          return;
        }
      
        try {
          await addDoc(collection(db, 'survey'), {
            name: formData.name,
            location: formData.location,
            housing: formData.housing,
            allergies: formData.allergies || "",
            alcohol: formData.alcohol,
            song: formData.song || "",
          });
      
          alert('Спасибо за ответ! Информация сохранена.');

          // очистка формы
          setFormData({
            name: '',
            location: '',
            housing: '',
            allergies: '',
            alcohol: '',
            song: ''
          });
        } catch (err) {
          console.error('Ошибка записи в Firestore:', err);
          alert('Ошибка при отправке. Попробуйте позже.');
        }
      };

      return (
        <div className="form-container">
          <h2 className="events-title">Опрос</h2>
          <div data-aos="fade-up" className="form-header">
            <h2>Просим вас ответить на несколько простых, но очень важных вопросов</h2>
          </div>
    
          <form data-aos="fade-up" onSubmit={handleSubmit} className="guest-form">
            <div className="form-group">
              <label htmlFor="name">Как Вас зовут</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
    
            {/* <div className="form-group">
              <label>К какой локации приедете?</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="location"
                    value="ЗАГС"
                    checked={formData.location === 'ЗАГС'}
                    onChange={handleChange}
                    required
                  />
                  <span className="radio-custom"></span>
                  ЗАГС
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="location"
                    value="Банкетный зал"
                    checked={formData.location === 'Банкетный зал'}
                    onChange={handleChange}
                  />
                  <span className="radio-custom"></span>
                  Банкетный зал
                </label>
              </div>
            </div> */}
    
            <div className="form-group">
              <label>Нужна ли помощь в организации ночлега?</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="housing"
                    value="Да"
                    checked={formData.housing === 'Да'}
                    onChange={handleChange}
                    required
                  />
                  <span className="radio-custom"></span>
                  Да
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="housing"
                    value="Нет"
                    checked={formData.housing === 'Нет'}
                    onChange={handleChange}
                  />
                  <span className="radio-custom"></span>
                  Нет
                </label>
           
          
              </div>
            </div>
    
            <div className="form-group">
              <label htmlFor="allergies">Есть ли у вас аллергии на определенные продукты? (если нет, оставьте поле пустым)</label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="Например: орехи, молоко, etc."
              />
            </div>
    
            <div className="form-group">
              <label htmlFor="alcohol">Предпочитаемый алкоголь</label>
              <select
                id="alcohol"
                name="alcohol"
                value={formData.alcohol}
                onChange={handleChange}
                required
              >
                <option value="">Выберите вариант</option>
                <option value="Вино">Вино</option>
                <option value="Шампанское">Шампанское</option>
                <option value="Коньяк">Коньяк</option>
                <option value="Водка">Водка</option>
                <option value="Виски">Виски</option>
                <option value="Пиво">Пиво</option>
                <option value="Не употребляю">Не употребляю</option>
              </select>
            </div>
    
            <div className="form-group">
              <label htmlFor="song">Если хотите услышать свою любимую песню на мероприятии, можете оставить название тут</label>
              <input
                type="text"
                id="song"
                name="song"
                value={formData.song}
                onChange={handleChange}
                placeholder="Название песни и исполнитель"
              />
            </div>
    
            <button type="submit" className="submit-btn">Отправить ответ</button>
          </form>
        </div>
      );
    }
export default SurveyScreen;