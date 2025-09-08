
import './styles/App.css'
import './components/MeetingScreen'
import React, { useState,  } from 'react';

import { useMediaQuery } from 'react-responsive';
import MeetingScreen from './components/MeetingScreen';
import TimingScreen from './components/TimingScreen';
import DetailsScreen from './components/DetailsScreen';
import SurveyScreen from './SurveyScreen';
import GameScreen from './components/GameScreen';

function MainScreen() {
    const isMobile = useMediaQuery({ maxWidth: 450 });
    const [view, setView] = useState('home'); // 'home' | 'game'
  
    // Открыть игру
    const openGame = () => {
      setView('game');
    };
  
    // Колбэк для выхода из игры — передаём в GameScreen
    const handleExitGame = () => {
      setView('home');
    };
  
    // Если мы в режиме игры — показываем компонент GameScreen (полноэкранно на мобиле)
    if (view === 'game') {
      return (
        <div className="main-background" style={{ height: '100vh' }}>
          <GameScreen onExit={handleExitGame} />
        </div>
      );
    }
  
    // HOME / MAIN SCREEN
    return (
      <div className="main-background">
        {isMobile ? (
          <div className="secondary-background" style={{ position: 'relative' }}>
            {/* Остальная ваша мобильная разметка */}
            <MeetingScreen />
            <TimingScreen />
            <DetailsScreen />
            <SurveyScreen />
            
            

            {/* Кнопка запуска игры — фиксированная внизу (или поместите её где удобно) */}
            <div style={{ padding: 16 }}>
            <h2 className="events-title">Игра</h2 >

            <div className="form-header">
            <h2>                А сейчас у вас есть возможность сыграть в мини игру, и тот кто наберет больше всего очков , на мероприятии получит приз!
            </h2>
          </div>
          

            <button
              onClick={openGame}
              aria-label="Play Dino"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: 'none',
                background: '#7D5642',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                boxShadow: '0 6px 18px rgba(0,0,0,0.25)'
              }}
            >
              Играть
            </button>
            </div>
              </div>
            ) : (
              <div>Десктоп версия</div>
        )}
      </div>
    );
  }
  
  export default MainScreen;