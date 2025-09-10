// src/components/GameScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import { delay, motion } from 'framer-motion';
import useSound from 'use-sound';
import { db } from '../lib/firebase'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';
// ассеты — положите свои файлы в /src/assets/ или поправьте пути
import jumpSound from '/src/assets/soound.mp3';
import hitSound  from '/src/assets/soound.mp3';

// варианты игрока
import dinoImg    from '/src/assets/player.png';
import player1    from '/src/assets/player2.png';


// монстры
import enemy1 from '/src/assets/enemy.png';
import enemy2 from '/src/assets/enemy2.png';
import enemy3 from '/src/assets/enemy3.png';

import '/src/styles/GameScreen.css';
/* === BackgroundEffects: облака + кусты + камни (без внешних пакетов) === */
/* Вставлять после импортов в GameScreen.jsx */

function CloudSVG({ width = 140, height = 80 }) {
  return (
    <svg viewBox="0 0 64 40" width={width} height={height} preserveAspectRatio="xMidYMid meet">
      <g fill="#ffffff" opacity="0.97" stroke="rgba(0,0,0,0.05)">
        <ellipse cx="20" cy="20" rx="18" ry="12" />
        <ellipse cx="34" cy="16" rx="14" ry="10" />
        <ellipse cx="10" cy="18" rx="9" ry="7" />
      </g>
    </svg>
  );
}

function RockSVG({ width = 44, height = 22 }) {
  return (
    <svg viewBox="0 0 48 28" width={width} height={height} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="gRockA" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a9b0b6" />
          <stop offset="100%" stopColor="#6b6f73" />
        </linearGradient>
      </defs>
      <g>
        <path d="M6 22 C2 18, 4 12, 10 9 C16 6, 30 6, 38 9 C44 12, 46 18, 40 22 C34 26, 18 26, 6 22 Z" fill="url(#gRockA)" />
        <path d="M18 12 C20 13, 24 13, 28 14" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" fill="none" />
        <ellipse cx="24" cy="23" rx="18" ry="2" fill="rgba(0,0,0,0.08)" />
      </g>
    </svg>
  );
}

function BushSVG({ width = 80, height = 40, color = "#4CAF50" }) {
  return (
    <svg
      viewBox="0 0 80 40"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Основная форма куста */}
      <path
        d="
          M10 35
          Q15 15 30 25
          Q35 10 50 20
          Q60 5 70 25
          Q75 15 78 35
          Z
        "
        fill={color}
      />
      {/* Передний слой для объёма */}
      <path
        d="
          M20 35
          Q25 20 35 28
          Q40 18 55 28
          Q60 25 70 35
          Z
        "
        fill="#388E3C"
      />
    </svg>
  );
}

/* BackgroundEffects — основной компонент */
function BackgroundEffects({ isStarted, isGameOver }) {
  const [decors, setDecors] = React.useState([]); // { id, type, ... }
  const mountedRef = React.useRef(true);

  React.useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  React.useEffect(() => {
    if (!isStarted || isGameOver) return;

    let cloudTimer = null;
    let groundTimer = null;
    const randId = () => `${Date.now()}-${Math.floor(Math.random()*1000000)}`;
    const schedule = (fn, min, max) => setTimeout(fn, min + Math.random() * (max - min));

    const spawnCloud = () => {
      if (!mountedRef.current) return;
      const id = randId();
      const size = 0.6 + Math.random() * 1.2;
      const topPct = 4 + Math.random() * 28;
      const duration = 14 + Math.random() * 16;
      // console.log('[BG] cloud', id);
      setDecors(prev => [...prev, { id, type: 'cloud', topPct, size, duration }]);
      cloudTimer = schedule(spawnCloud, 2500, 8000);
    };

    const spawnGround = () => {
      if (!mountedRef.current) return;
      const id = randId();
      const kind = Math.random() < 0.78 ? 'bush' : 'rock';
      const size = 0.8 + Math.random() * 1.0;
      const duration = 6 + Math.random() * 6;
      const variant = Math.floor(Math.random() * 3);
      // console.log('[BG] ground', id, kind, variant);
      setDecors(prev => [...prev, { id, type: 'ground', kind, size, duration, variant }]);
      groundTimer = schedule(spawnGround, 1600, 5200);
    };

    cloudTimer = schedule(spawnCloud, 800, 1600);
    groundTimer = schedule(spawnGround, 900, 2200);

    return () => {
      clearTimeout(cloudTimer);
      clearTimeout(groundTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStarted, isGameOver]);

  const removeDecor = (id) => setDecors(prev => prev.filter(d => d.id !== id));

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
      {decors.map(d => {
        if (d.type === 'cloud') {
          const style = { position: 'absolute', top: `${d.topPct}%`, left: '100%', width: `${140 * d.size}px`, zIndex: 3 };
          return (
            <motion.div
              key={d.id}
              style={style}
              initial={{ x: 0, y: 0 }}
              animate={{ x: -(window.innerWidth + 220), y: [0, -6, 0] }}
              transition={{ x: { duration: d.duration, ease: 'linear' }, y: { duration: 4, yoyo: Infinity } }}
              onAnimationComplete={() => removeDecor(d.id)}
            >
              <CloudSVG width={140 * d.size} height={80 * d.size} />
            </motion.div>
          );
        }

        if (d.type === 'ground') {
          const style = {
            position: 'absolute',
            bottom: '6%',          // НИЖЕ игрока и врагов (они на ~22%)
            left: '100%',
            width: `${44 * d.size}px`,
            zIndex: 1,             // ниже спрайтов (player zIndex ~5, enemies ~4)
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            pointerEvents: 'none',
          };

          if (d.kind === 'bush') {
            return (
              <motion.div
                key={d.id}
                style={style}
                initial={{ x: 0, y: 6, opacity: 0.98 }}
                animate={{ x: -(window.innerWidth + 220), y: [6, 0, 6] }}
                transition={{ x: { duration: d.duration, ease: 'linear' }, y: { duration: 3 + Math.random() * 2, yoyo: Infinity } }}
                onAnimationComplete={() => removeDecor(d.id)}
              >
                <div style={{ width: '100%', height: `${28 * d.size}px`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <BushSVG width={44 * d.size} height={28 * d.size} variant={d.variant || 0} />
                </div>
              </motion.div>
            );
          }

          // rock
          return (
            <motion.div
              key={d.id}
              style={style}
              initial={{ x: 0, y: 2, opacity: 0.98 }}
              animate={{ x: -(window.innerWidth + 160), y: [2, 0, 2] }}
              transition={{ x: { duration: d.duration, ease: 'linear' }, y: { duration: 4 + Math.random() * 2, yoyo: Infinity } }}
              onAnimationComplete={() => removeDecor(d.id)}
            >
              <div style={{ width: '100%', height: `${22 * d.size}px` }}>
                <RockSVG width={44 * d.size} height={22 * d.size} />
              </div>
            </motion.div>
          );
        }

        return null;
      })}
    </div>
  );
}


export default function GameScreen({
  onExit = () => {},
  initialDuration = 2.6,
  scorePerMilestone = 100,
  decreasePerMilestone = 0.25,
  minDuration = 1.0,

  // batch timing
  initialSpawnInterval = 1600,
  spawnIntervalDecrease = 150,
  minSpawnInterval = 600,
  spawnIntervalJitter = 350,

  // spawn count / growth
  initialSpawnMax = 1,
  spawnMaxIncrease = 1,
  maxSpawnMax = 3,
  spawnSpacingMs = 100
} = {}) {
  // -----------------------
  // state / refs
  // -----------------------
  const [playerName, setPlayerName] = useState('');
  const [showStartScreen, setShowStartScreen] = useState(true);

  const [score, setScore] = useState(0);
  const scoreRef = useRef(0); // синхронный реф для точного финального значения

  const [duration, setDuration] = useState(initialDuration);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [obstacles, setObstacles] = useState([]);

  // modal for game over
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // preload state
  const [assetsReady, setAssetsReady] = useState(false);

  // sounds
  const [playJump] = useSound(jumpSound, { volume: 0.6 });
  const [playHit]  = useSound(hitSound,  { volume: 0.6 });

  // jump physics (deterministic)
  const [y, setY] = useState(0);
  const rafRef = useRef(null);

  // dino ref for collisions
  const dinoRef = useRef(null);

  // timers / refs
  const spawnTimeoutRef = useRef(null);
  const firstSpawnTimeoutRef = useRef(null);
  const scoreTickRef = useRef(null);

  // mutable refs for dynamic params
  const spawnIntervalMsRef = useRef(initialSpawnInterval); // среднее between batches (ms)
  const spawnMaxRef = useRef(initialSpawnMax);

  // milestone tracking
  const nextMilestoneRef = useRef(scorePerMilestone);
  const decreaseRef = useRef(decreasePerMilestone);
  const minDurationRef = useRef(minDuration);
  const minSpawnIntervalRef = useRef(minSpawnInterval);

  const COLLISION_PADDING = 6;
  const SCORE_TICK_MS = 120;

  // -----------------------
  // sprites
  // -----------------------
  const playerTypes = [
    { src: dinoImg, width: 64, height: 64 },
    { src: player1, width: 64, height: 64 },

  ];
  const [playerIndex, setPlayerIndex] = useState(0);

  const monsterTypes = [
    { src: enemy1, width: 56, height: 64, hitboxPadding: 6 },
    { src: enemy2, width: 56, height: 64, hitboxPadding: 6 },
    { src: enemy3, width: 56, height: 64, hitboxPadding: 6 },
  ];

  // jump params (apex model)
  const jumpParamsRef = useRef({
    jumpHeight: 200, // px
    tUp: 220,        // ms
    tApex: 240,      // ms
    tDown: 260       // ms
  });

  // -----------------------
  // utilities
  // -----------------------
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInCubic = (t) => t * t * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // -----------------------
  // preload assets (images)
  // -----------------------
  const allSpriteSrcs = [
    ...playerTypes.map(p => p.src),
    ...monsterTypes.map(m => m.src),
  ];

  const preloadImages = () => {
    if (assetsReady) return Promise.resolve();

    const loaders = allSpriteSrcs.map(src => {
      return new Promise(resolve => {
        if (!src) return resolve();
        const img = new Image();
        img.src = src;
        if (img.decode) {
          img.decode().then(() => resolve()).catch(() => resolve());
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      });
    });

    return Promise.all(loaders).then(() => {
      setAssetsReady(true);
    });
  };

  useEffect(() => {
    // fire-and-forget preload on mount
    preloadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------
  // spawn helpers
  // -----------------------
  const clearSpawnTimers = () => {
    if (firstSpawnTimeoutRef.current) {
      clearTimeout(firstSpawnTimeoutRef.current);
      firstSpawnTimeoutRef.current = null;
    }
    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current);
      spawnTimeoutRef.current = null;
    }
  };

  // spawn single obstacle (optionally delayed and with optional forced type)
  const spawnObstacleOnce = (delay = 0, forcedTypeIndex = null) => {
    const spawn = () => {
      const id = Date.now() + Math.random();
      const chosen = forcedTypeIndex == null
        ? Math.floor(Math.random() * monsterTypes.length)
        : clamp(Math.floor(forcedTypeIndex), 0, monsterTypes.length - 1);
      setObstacles(prev => [...prev, { id, typeIndex: chosen }]);
    };

    if (delay <= 0) spawn();
    else setTimeout(spawn, delay);
  };

  // spawn a batch: randomly 1..spawnMaxRef.current, with fixed spacing inside batch
  const spawnBatch = () => {
    const max = Math.max(1, Math.floor(spawnMaxRef.current));
    const count = Math.floor(Math.random() * max) + 1; // 1..max
    for (let i = 0; i < count; i++) {
      spawnObstacleOnce(i * spawnSpacingMs);
    }
  };

  // schedule next batch with jitter around average (recursive setTimeout)
  const scheduleNextBatch = (avgMs = spawnIntervalMsRef.current) => {
    const jitter = Math.max(0, spawnIntervalJitter || 0);
    const minDelay = Math.max(minSpawnIntervalRef.current, avgMs - jitter);
    const maxDelay = Math.max(minSpawnIntervalRef.current, avgMs + jitter);
    const delay = Math.floor(minDelay + Math.random() * (maxDelay - minDelay + 1));

    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current);
      spawnTimeoutRef.current = null;
    }

    spawnTimeoutRef.current = setTimeout(() => {
      spawnBatch();
      // plan next batch using the (possibly updated) avg
      scheduleNextBatch(spawnIntervalMsRef.current);
    }, delay);
  };

  // initial scheduling: small startup delay, then recursive scheduling
  const scheduleSpawning = () => {
    clearSpawnTimers();
    const initial = Math.max(200, Math.floor(initialSpawnInterval / 2));
    firstSpawnTimeoutRef.current = setTimeout(() => {
      spawnBatch();
      scheduleNextBatch(spawnIntervalMsRef.current);
    }, initial);
  };

  // -----------------------
  // jump (deterministic apex)
  // -----------------------
  const doJump = () => {
    if (rafRef.current) return; // already jumping
    const { jumpHeight, tUp, tApex, tDown } = jumpParamsRef.current;
    const total = tUp + tApex + tDown;
    const start = performance.now();
    playJump();

    const loop = (now) => {
      const elapsed = now - start;

      if (elapsed < tUp) {
        const t = Math.max(0, Math.min(1, elapsed / tUp));
        const p = easeOutCubic(t);
        setY(-jumpHeight * p);
      } else if (elapsed < tUp + tApex) {
        setY(-jumpHeight); // apex hold
      } else if (elapsed < total) {
        const t = Math.max(0, Math.min(1, (elapsed - tUp - tApex) / tDown));
        const p = easeInCubic(t);
        setY(-jumpHeight * (1 - p));
      } else {
        setY(0);
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  };

  const cancelRAF = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // -----------------------
  // collisions & score tick (reads actual DOM .obstacle elements)
  // -----------------------
  const shrinkRect = (r, pad) => ({
    left: r.left + pad,
    right: r.right - pad,
    top: r.top + pad,
    bottom: r.bottom - pad,
    width: Math.max(0, r.width - 2 * pad),
    height: Math.max(0, r.height - 2 * pad),
  });
  const rectsIntersect = (a, b) => !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);

  const startScoreTick = () => {
    if (scoreTickRef.current) return;
    scoreTickRef.current = setInterval(() => {
      const dinoRectRaw = dinoRef.current?.getBoundingClientRect();
      if (!dinoRectRaw) return;
      const dinoRect = shrinkRect(dinoRectRaw, COLLISION_PADDING);

      const elems = Array.from(document.querySelectorAll('.obstacle'));
      for (const el of elems) {
        const obsRectRaw = el.getBoundingClientRect();
        if (obsRectRaw.right < 0 || obsRectRaw.left > (typeof window !== 'undefined' ? window.innerWidth : 1000)) continue;
        const obsRect = shrinkRect(obsRectRaw, COLLISION_PADDING);
        if (rectsIntersect(dinoRect, obsRect)) {
          // collision -> end game and show modal
          playHit();
          endGame();
          return;
        }
      }

      // +1 очко и milestone logic
      setScore(s => {
        const next = s + 1;
        // синхронно обновляем scoreRef чтобы endGame мог достоверно прочитать текущее значение
        scoreRef.current = next;

        if (next >= nextMilestoneRef.current) {
          // 1) speed (duration)
          setDuration(curr => Math.max(minDurationRef.current, +(curr - decreaseRef.current).toFixed(3)));

          // 2) decrease average spawn interval
          spawnIntervalMsRef.current = Math.max(minSpawnIntervalRef.current, spawnIntervalMsRef.current - spawnIntervalDecrease);

          // if a batch timeout is pending, reschedule quickly with new average
          if (spawnTimeoutRef.current) {
            clearTimeout(spawnTimeoutRef.current);
            spawnTimeoutRef.current = null;
            scheduleNextBatch(spawnIntervalMsRef.current);
          }

          // 3) increase spawnMax (max number that can appear in a batch)
          spawnMaxRef.current = Math.min(maxSpawnMax, spawnMaxRef.current + spawnMaxIncrease);

          // next milestone
          nextMilestoneRef.current += scorePerMilestone;
        }

        return next;
      });
    }, SCORE_TICK_MS);
  };

  const stopScoreTick = () => {
    if (scoreTickRef.current) {
      clearInterval(scoreTickRef.current);
      scoreTickRef.current = null;
    }
  };

  // -----------------------
  // start / end game
  // -----------------------
  const startGame = async () => {
    // ensure assets are ready before starting (avoid late-appearing sprites)
    if (!assetsReady) {
      await preloadImages();
    }

    // choose random player at start
    const randomPlayerIndex = Math.floor(Math.random() * playerTypes.length);
    setPlayerIndex(randomPlayerIndex);

    cancelRAF();
    clearSpawnTimers();
    stopScoreTick();

    setIsStarted(true);
    setIsGameOver(false);
    setShowGameOverModal(false);
    setScore(0);
    scoreRef.current = 0;
    setDuration(initialDuration);
    nextMilestoneRef.current = scorePerMilestone;
    decreaseRef.current = decreasePerMilestone;
    minDurationRef.current = minDuration;
    spawnIntervalMsRef.current = initialSpawnInterval;
    spawnMaxRef.current = initialSpawnMax;
    minSpawnIntervalRef.current = minSpawnInterval;

    setObstacles([]);
    setY(0);

    scheduleSpawning();
    startScoreTick();
  };

  const endGame = () => {
    setIsGameOver(true);
    cancelRAF();
    clearSpawnTimers();
    stopScoreTick();
  
    const finalScoreValue = scoreRef.current;
    setFinalScore(finalScoreValue);
    saveScoreToFirestore(playerName, finalScoreValue); // Используем scoreRef.current
    
    setShowGameOverModal(true);
  };
  // -----------------------
  // pointer handlers
  // -----------------------
  const handlePointerDown = async (ev) => {
    // если стартовый экран открыт — не мешаем вводу (не вызываем preventDefault)
    if (showStartScreen) return;

    // если показана модалка game over — не реагируем на тапы по полю
    if (showGameOverModal) return;

    // Prevent default only when game area is active (to avoid e.g. dbltap zoom on mobile)
    ev?.preventDefault?.();

    // ensure assets loaded
    if (!assetsReady) {
      await preloadImages();
    }

    if (isGameOver) {
      // ignored: use modal button to restart
      return;
    }
    if (!isStarted) {
      await startGame();
    }

    if (y === 0 && !rafRef.current) {
      doJump();
    }
  };

  const handleStartButton = async () => {
    if (!playerName || playerName.trim().length === 0) return;
    saveScoreToFirestore(playerName, 0); 
    setShowStartScreen(false);
    await startGame();
  };

  const handleRestart = async () => {
    setShowGameOverModal(false);
    setShowStartScreen(false); // keep name input hidden; restart with same name
    await startGame();
  };

  const handlePlayAgainWithNewName = () => {
    // show start screen again to allow new name
    setShowGameOverModal(false);
    setShowStartScreen(true);
    setIsStarted(false);
  };
  const handleBackToMenu = () => {
    // аккуратно очищаем всё перед выходом
    cancelRAF();
    clearSpawnTimers();
    stopScoreTick();

    // скрываем модалку (необязательно — родитель может размонтировать компонент)
    setShowGameOverModal(false);

    // вызываем колбэк родителя: он должен показать главный экран/скрыть GameScreen
    try {
      onExit();
    } catch (e) {
      // ignore errors from parent callback
      console.error(e);
    }
  };

  const saveScoreToFirestore = async (playerName, currentScore) => {
    console.log("Saving score:", currentScore);
    if (!playerName || currentScore == null) return;
  
    try {
      const playerRef = doc(db, "game", playerName);
      const playerSnap = await getDoc(playerRef);
  
      if (playerSnap.exists()) {
        const existingScore = playerSnap.data().score;
        
        // Сравниваем с текущим рекордом
        if (currentScore > existingScore) {
          await setDoc(playerRef, { score: currentScore }, { merge: true });
          console.log(`🔥 Новый рекорд для ${playerName}: ${currentScore}`);
        } else {
          console.log(`⚡ Текущий счет ${currentScore} меньше рекорда ${existingScore}`);
        }
      } else {
        // Если игрок не существует, создаем запись
        await setDoc(playerRef, { score: currentScore });
        console.log(`🆕 Новый игрок добавлен: ${playerName} с результатом ${currentScore}`);
      }
    } catch (error) {
      console.error("Ошибка сохранения результата в Firestore:", error);
    }
  };
  // -----------------------
  // lifecycle cleanup and sync
  // -----------------------
  useEffect(() => {
    return () => {
      cancelRAF();
      clearSpawnTimers();
      stopScoreTick();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // sync props -> refs if changed externally
    setDuration(initialDuration);
    spawnIntervalMsRef.current = initialSpawnInterval;
    spawnMaxRef.current = initialSpawnMax;
    nextMilestoneRef.current = scorePerMilestone;
    decreaseRef.current = decreasePerMilestone;
    minDurationRef.current = minDuration;
    minSpawnIntervalRef.current = minSpawnInterval;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDuration, initialSpawnInterval, initialSpawnMax, scorePerMilestone, decreasePerMilestone, minDuration, minSpawnInterval]);

  // -----------------------
  // render
  // -----------------------
  const currentPlayer = playerTypes[Math.max(0, Math.min(playerTypes.length - 1, playerIndex || 0))];

  return (
    <div
      className="game-area"
      onTouchStart={handlePointerDown}
      onTouchEnd={() => {}}
      onMouseDown={handlePointerDown}
      onMouseUp={() => {}}
      onContextMenu={(e) => e.preventDefault()}
      role="button"
      tabIndex={0}
      style={{ position: 'relative' }}
    >
     <BackgroundEffects isStarted={isStarted} isGameOver={isGameOver} />

      <div className="ground" />

      {/* top HUD: name + score */}
      <div style={{ position: 'absolute', fontSize: '30px',fontFamily: "Inter", fontWeight: 200,color:'#F3EBDD',top: 10, left: 12, zIndex: 50, color: 'white', textShadow: '1px 1px 2px #000' }}>
        {playerName ? <div style={{ fontWeight: 600 }}>{playerName}</div> : null}
      </div>

      <div className="score" style={{ zIndex: 50 ,fontSize: '30px',fontFamily: "Inter", fontWeight: 200,color:'#F3EBDD'}}>
        {isGameOver ? '' : `Счет: ${score}`}
      </div>

      {/* динозавр */}
      <img
        src={currentPlayer.src}
        alt="player"
        ref={dinoRef}
        className="dino"
        style={{
          transform: `translateY(${y}px)`,
          willChange: 'transform',
          zIndex: 5,
          width: `${currentPlayer.width}px`,
          height: `${currentPlayer.height}px`,
        }}
      />

      {/* препятствия */}
      {obstacles.map(obs => {
        const type = monsterTypes[Math.max(0, Math.min(monsterTypes.length - 1, obs.typeIndex || 0))];
        return (
          <motion.img
            key={obs.id}
            id={`obstacle-${obs.id}`}
            className="obstacle"
            src={type.src}
            initial={{ x: (typeof window !== 'undefined' ? window.innerWidth + 80 : 800) }}
            animate={{ x: -80 }}
            transition={{ duration: duration, ease: 'linear' }}
            onAnimationComplete={() => {
              setObstacles(prev => prev.filter(o => o.id !== obs.id));
            }}
            style={{
              zIndex: 4,
              width: `${type.width}px`,
              height: `${type.height}px`,
              bottom: '22%',
            }}
            alt="obstacle"
          />
        );
      })}

      {/* START SCREEN OVERLAY */}
      {showStartScreen && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.55))'
        }}>
          <div style={{
            width: '90%', maxWidth: 420, backgroundColor:'#7D5642', borderRadius: 12, padding: 18, boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'
          }}>
            <h2 style={{ margin: 0 , fontFamily: "Inter", fontWeight: 200,color:'#F3EBDD'}}>Как вас зовут?</h2>
            
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ввести..."
              style={{ width: '100%', padding: '10px 12px', fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <div style={{ width: '100%', display: 'flex', gap: 8 }}>
              <button
                onClick={handleStartButton}
                disabled={!playerName || playerName.trim().length === 0}
                style={{fontFamily: "Inter", fontWeight: 200,color:'#F3EBDD',fontSize:'20px',
                  flex: 1, padding: '10px 12px', borderRadius: 8, border: 'none',
                  background: (!playerName || playerName.trim().length === 0) ? '#bbb' : '#28a745', color: 'white', fontWeight: 700
                }}
              >
                Начать
              </button>
             
            </div>
            <div style={{ fontSize: 13, fontFamily: "Inter", fontWeight: 200,color:'#F3EBDD',textAlign:'center', fontSize:'15px', marginTop: 4 }}>Нажимайте на экран чтобы перепрыгнуть монстров и остатьсяв живых.</div>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL */}
      {showGameOverModal && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)'
        }}>
          <div style={{
            width: '90%', maxWidth: 420,  backgroundColor:'#7D5642', borderRadius: 12, padding: 18, boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'
          }}>
            <h2 style={{ margin: 0 ,fontFamily: "Inter", fontWeight: 200,color:'#F3EBDD'}}>Игра окончена</h2>
            <div style={{ fontSize: 16,fontFamily: "Inter", fontWeight: 200,color:'#F3EBDD' }}>{playerName ? `${playerName},` : ''} Ваш счет: <strong>{finalScore}</strong></div>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button
                onClick={handleRestart}
                style={{ fontFamily: "Inter", fontWeight: 200,color:'#F3EBDD',flex: 1, padding: '10px 12px', background: '#28a745', color: '#fff', borderRadius: 8, border: 'none', fontWeight: 700 }}
              >
                Заново
              </button>
              <button
                onClick={handleBackToMenu}
                style={{ fontFamily: "Inter", fontWeight: 200,color:'#F3EBDD',flex: 1, padding: '10px 12px', background: '#007bff', color: '#fff', borderRadius: 8, border: 'none', fontWeight: 700 }}
              >
                Назад
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

