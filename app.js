const tg = window.Telegram?.WebApp;

if (tg) {
    tg.expand();
    tg.ready();
    tg.enableClosingConfirmation();
    
    if (tg.themeParams) {
        const root = document.documentElement;
        if (tg.themeParams.bg_color) root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
        if (tg.themeParams.text_color) root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
        if (tg.themeParams.hint_color) root.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color);
        if (tg.themeParams.button_color) root.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color);
        if (tg.themeParams.button_text_color) root.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color);
        if (tg.themeParams.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color);
    }
    
    if (tg.colorScheme === 'dark') {
        document.body.classList.add('dark');
    }
}

let wakeLock = null;

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {}
    }
}

async function releaseWakeLock() {
    if (wakeLock) {
        try {
            await wakeLock.release();
            wakeLock = null;
        } catch (err) {}
    }
}

const translations = {
    ru: {
        title: "Дыхание Вима Хофа",
        description: "Испытайте силу контролируемого дыхания по методу Вима Хофа",
        sound: "Звук",
        darkMode: "Темная тема",
        start: "Начать",
        settings: "Настройки",
        nextRound: "Начало следующего раунда...",
        getReady: "Приготовьтесь",
        breatheIn: "Сделать вдох",
        pause: "Пауза",
        resume: "Продолжить",
        complete: "Практика завершена!",
        share: "Поделиться",
        restart: "Повторить",
        joinGroup: "Вступить в группу",
        roundsCount: "Количество раундов",
        holdTime: "Время задержки (сек)",
        breathDuration: "Длительность вдоха",
        save: "Сохранить",
        roundOf: "Раунд {current} из {total}",
        inhale: "Вдох",
        exhale: "Выдох",
        hold: "Задержка",
        deepInhale: "Глубокий вдох",
        deepExhale: "Глубокий выдох",
        results: "Время задержки: {time} сек",
        shareText: "Я завершил практику дыхания Вима Хофа и задержал дыхание на {time} секунд!",
        nextRoundNum: "Раунд {num}",
        exerciseSettings: "Параметры упражнения",
        community: "Сообщество",
        developer: "Разработчик",
        channelDescription: "Рассказываем, как дыхание меняет химию крови, отключает стресс и включает «режим берсерка»",
        developerDescription: "Разработчик этого приложения",
        breathingTips: [
            "Метод Вима Хоффа повышает уровень кислорода в крови и укрепляет иммунную систему",
            "Регулярная практика улучшает концентрацию и снижает уровень стресса",
            "Задержка дыхания активирует парасимпатическую нервную систему",
            "Эта техника помогает контролировать реакцию организма на стресс",
            "Практика увеличивает выработку адреналина и снижает воспалительные процессы",
            "Метод Вима Хоффа улучшает качество сна и повышает энергию",
            "Глубокое дыхание насыщает клетки кислородом и выводит токсины",
            "Регулярные тренировки повышают устойчивость к холоду и болезням"
        ]
    },
    en: {
        title: "Wim Hof Breathing",
        description: "Experience the power of controlled breathing through the Wim Hof Method",
        sound: "Sound",
        darkMode: "Dark Mode",
        start: "Start",
        settings: "Settings",
        nextRound: "Starting next round...",
        getReady: "Get Ready",
        breatheIn: "Take a Breath",
        pause: "Pause",
        resume: "Resume",
        complete: "Practice Complete!",
        share: "Share",
        restart: "Do Again",
        joinGroup: "Join Group",
        roundsCount: "Number of Rounds",
        holdTime: "Hold Time (sec)",
        breathDuration: "Breath Duration",
        save: "Save",
        roundOf: "Round {current} of {total}",
        inhale: "Inhale",
        exhale: "Exhale",
        hold: "Hold",
        deepInhale: "Deep Inhale",
        deepExhale: "Deep Exhale",
        results: "Hold time: {time} sec",
        shareText: "I completed Wim Hof Breathing and held my breath for {time} seconds!",
        nextRoundNum: "Round {num}",
        exerciseSettings: "Exercise Settings",
        community: "Community",
        developer: "Developer",
        channelDescription: "Learn how breathing changes blood chemistry, reduces stress and activates 'berserker mode'",
        developerDescription: "Developer of this application",
        breathingTips: [
            "The Wim Hof Method increases oxygen levels in blood and strengthens the immune system",
            "Regular practice improves concentration and reduces stress levels",
            "Breath retention activates the parasympathetic nervous system",
            "This technique helps control the body's stress response",
            "Practice increases adrenaline production and reduces inflammation",
            "The Wim Hof Method improves sleep quality and boosts energy",
            "Deep breathing oxygenates cells and removes toxins",
            "Regular training increases resistance to cold and illness"
        ]
    }
};

document.addEventListener('DOMContentLoaded', function() {
    let state = {
        rounds: 3,
        initialHoldTime: 30,
        breathDuration: 2,
        currentRound: 1,
        breathCount: 0,
        isBreathing: false,
        isHolding: false,
        shouldStopAnimation: false,
        soundEnabled: false,
        soundsLoaded: false,
        currentPhase: 'Get Ready',
        lastHoldTime: 0,
        isPaused: false,
        language: localStorage.getItem('lang') || 'ru',
        currentTipIndex: 0,
        tipInterval: null
    };

    const screens = {
        home: document.getElementById('homeScreen'),
        exercise: document.getElementById('exerciseScreen'),
        completion: document.getElementById('completionScreen')
    };

    const elements = {
        startButton: document.getElementById('startButton'),
        settingsButton: document.getElementById('settingsButton'),
        saveSettings: document.getElementById('saveSettings'),
        restartButton: document.getElementById('restartButton'),
        roundsInput: document.getElementById('rounds'),
        holdTimeInput: document.getElementById('holdTime'),
        breathDurationInput: document.getElementById('breathDuration'),
        roundsValue: document.getElementById('roundsValue'),
        holdTimeValue: document.getElementById('holdTimeValue'),
        breathDurationValue: document.getElementById('breathDurationValue'),
        progressRing: document.querySelector('.progress-ring__circle'),
        phase: document.getElementById('phase'),
        round: document.getElementById('round'),
        counter: document.getElementById('counter'),
        settingsModal: document.querySelector('.settings-modal'),
        modalOverlay: document.querySelector('.modal-overlay'),
        breatheInButton: document.getElementById('breatheInButton'),
        pauseButton: document.getElementById('pauseButton'),
        soundToggle: document.getElementById('soundToggle'),
        bottomControls: document.querySelector('.bottom-controls'),
        themeToggle: document.getElementById('themeToggle'),
        langToggle: document.getElementById('langToggle'),
        nextRoundMessage: document.getElementById('nextRoundMessage'),
        results: document.getElementById('results'),
        shareButton: document.getElementById('shareButton'),
        breathingCircle: document.getElementById('breathingCircle'),
        breathParticles: document.getElementById('breathParticles'),
        pulseRing: null,
        waterWave: document.querySelector('.water-wave'),
        breathingTip: document.getElementById('breathingTip')
    };

    const sounds = {
        countdown: document.getElementById('countdownSound'),
        backgroundBreathing: document.getElementById('backgroundBreathing'),
        backgroundHold: document.getElementById('backgroundHold'),
        inhale: document.getElementById('inhaleSound'),
        exhale: document.getElementById('exhaleSound')
    };

    const radius = 130;
    const circumference = radius * 2 * Math.PI;
    
    if (elements.progressRing) {
        elements.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
        elements.progressRing.style.strokeDashoffset = circumference;
    }

    function setProgress(percent) {
        if (!elements.progressRing) return;
        const offset = circumference - (percent / 100 * circumference);
        elements.progressRing.style.strokeDashoffset = offset;
    }

    function createParticles(type, duration = 1500) {
        if (!elements.breathParticles) return;
        elements.breathParticles.innerHTML = '';
        
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = `particle ${type}`;
            particle.style.setProperty('--breath-time', `${duration}ms`);
            
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 120 + Math.random() * 40;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.setProperty('--start-x', `${x}px`);
            particle.style.setProperty('--start-y', `${y}px`);
            particle.style.setProperty('--end-x', `${x}px`);
            particle.style.setProperty('--end-y', `${y}px`);
            particle.style.animationDelay = `${Math.random() * 0.3}s`;
            
            elements.breathParticles.appendChild(particle);
        }
    }

    function triggerWaterWave(duration) {
        if (!elements.waterWave) return;
        elements.waterWave.classList.remove('wave-active');
        void elements.waterWave.offsetWidth;
        elements.waterWave.style.setProperty('--wave-duration', `${duration}ms`);
        elements.waterWave.classList.add('wave-active');
    }
    
    function stopWaterWave() {
        if (!elements.waterWave) return;
        elements.waterWave.classList.remove('wave-active');
    }

    function animateCounter() {
        if (!elements.counter) return;
        elements.counter.classList.remove('tick');
        void elements.counter.offsetWidth;
        elements.counter.classList.add('tick');
    }

    function animatePhaseChange() {
        if (!elements.phase) return;
        elements.phase.classList.remove('changing');
        void elements.phase.offsetWidth;
        elements.phase.classList.add('changing');
    }

    function setBreathingAnimation(type, duration = 1500) {
        if (!elements.breathingCircle) return;
        if (type) {
            elements.breathingCircle.style.setProperty('--breath-time', `${duration}ms`);
            elements.breathingCircle.classList.remove('inhale', 'exhale', 'hold-pulse');
            void elements.breathingCircle.offsetWidth;
            elements.breathingCircle.classList.add(type);
            createParticles(type, duration);
            triggerWaterWave(duration);
        } else {
            elements.breathingCircle.classList.remove('inhale', 'exhale', 'hold-pulse');
            stopWaterWave();
        }
    }

    function startHoldPulse() {
        if (!elements.breathingCircle) return;
        elements.breathingCircle.classList.add('hold-pulse');
    }

    function stopHoldPulse() {
        if (!elements.breathingCircle) return;
        elements.breathingCircle.classList.remove('hold-pulse');
    }

    function showBreathingTip() {
        if (!elements.breathingTip) return;
        const tips = translations[state.language].breathingTips;
        if (!tips || tips.length === 0) return;
        
        elements.breathingTip.textContent = tips[state.currentTipIndex];
        elements.breathingTip.classList.add('active');
    }

    function hideBreathingTip() {
        if (!elements.breathingTip) return;
        elements.breathingTip.classList.remove('active');
    }

    function updateBreathingTip() {
        if (!elements.breathingTip) return;
        const tips = translations[state.language].breathingTips;
        if (!tips || tips.length === 0) return;
        
        elements.breathingTip.classList.add('changing');
        
        setTimeout(() => {
            state.currentTipIndex = (state.currentTipIndex + 1) % tips.length;
            elements.breathingTip.textContent = tips[state.currentTipIndex];
            elements.breathingTip.classList.remove('changing');
        }, 300);
    }

    function startTipRotation(intervalSeconds = 8) {
        stopTipRotation();
        showBreathingTip();
        state.tipInterval = setInterval(() => {
            if (!state.isPaused && state.isHolding) {
                updateBreathingTip();
            }
        }, intervalSeconds * 1000);
    }

    function stopTipRotation() {
        if (state.tipInterval) {
            clearInterval(state.tipInterval);
            state.tipInterval = null;
        }
        hideBreathingTip();
    }

    function updateLanguage() {
        const lang = state.language;
        const t = translations[lang];
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                const btnText = el.querySelector('.btn-text');
                if (btnText) {
                    btnText.textContent = t[key];
                } else if (el.tagName === 'TITLE') {
                    document.title = t[key];
                } else {
                    el.textContent = t[key];
                }
            }
        });

        if (elements.langToggle) {
            elements.langToggle.checked = lang === 'en';
        }

        if (screens.exercise.classList.contains('active')) {
            updateExerciseTexts();
        }
        
        if (screens.completion.classList.contains('active')) {
            updateCompletionTexts();
        }

        localStorage.setItem('lang', lang);
    }

    function updateExerciseTexts() {
        const t = translations[state.language];
        elements.round.textContent = t.roundOf.replace('{current}', state.currentRound).replace('{total}', state.rounds);
        
        let displayPhase = t[state.currentPhase.toLowerCase().replace(' ', '')] || state.currentPhase;
        if (state.currentPhase === 'Get Ready') displayPhase = t.getReady;
        if (state.currentPhase === 'Deep Inhale') displayPhase = t.deepInhale;
        if (state.currentPhase === 'Deep Exhale') displayPhase = t.deepExhale;
        
        elements.phase.textContent = displayPhase;
        
        const pauseBtnText = elements.pauseButton.querySelector('.btn-text');
        if (pauseBtnText) {
            pauseBtnText.textContent = state.isPaused ? t.resume : t.pause;
        }
    }

    function updateCompletionTexts() {
        const t = translations[state.language];
        elements.results.textContent = t.results.replace('{time}', state.lastHoldTime);
        const shareText = encodeURIComponent(t.shareText.replace('{time}', state.lastHoldTime));
        elements.shareButton.href = `https://t.me/share/url?url=https://t.me/breathingapp_bot&text=${shareText}`;
    }

    const isDark = localStorage.getItem('dark') === 'true' || (tg && tg.colorScheme === 'dark');
    document.body.classList.toggle('dark', isDark);
    if (elements.themeToggle) elements.themeToggle.checked = isDark;

    updateLanguage();

    elements.startButton?.addEventListener('click', startExercise);
    elements.settingsButton?.addEventListener('click', showSettings);
    elements.saveSettings?.addEventListener('click', saveSettings);
    elements.restartButton?.addEventListener('click', resetAndShowHome);
    elements.modalOverlay?.addEventListener('click', hideSettings);
    document.getElementById('closeSettings')?.addEventListener('click', hideSettings);
    elements.soundToggle?.addEventListener('change', toggleSound);
    
    elements.langToggle?.addEventListener('change', () => {
        state.language = elements.langToggle.checked ? 'en' : 'ru';
        updateLanguage();
    });
    
    elements.breatheInButton?.addEventListener('click', () => {
        state.isHolding = false;
        state.shouldStopAnimation = true;
        stopHoldPulse();
        stopTipRotation();
        hideBreatheInButton();
        if (state.soundEnabled) {
            sounds.backgroundHold.pause();
            playSound(sounds.backgroundBreathing);
        }
        state.currentPhase = 'Deep Inhale';
        animatePhaseChange();
        updateExerciseTexts();
    });
    
    elements.pauseButton?.addEventListener('click', togglePause);
    
    elements.themeToggle?.addEventListener('change', () => {
        const checked = elements.themeToggle.checked;
        document.body.classList.toggle('dark', checked);
        localStorage.setItem('dark', checked);
    });

    // Initialize glass sliders
    function initSliders() {
        const sliders = document.querySelectorAll('.slider-container');
        
        sliders.forEach(sliderEl => {
            const progress = sliderEl.querySelector('.slider-progress');
            const thumb = sliderEl.querySelector('.slider-thumb-glass');
            const sliderName = sliderEl.dataset.slider;
            const min = parseFloat(sliderEl.dataset.min);
            const max = parseFloat(sliderEl.dataset.max);
            const step = parseFloat(sliderEl.dataset.step) || 1;
            let value = parseFloat(sliderEl.dataset.value);
            
            let isDragging = false;
            let sliderRect = sliderEl.getBoundingClientRect();
            
            const updateThumbAndProgress = (percent) => {
                percent = Math.max(0, Math.min(100, percent));
                const px = (percent / 100) * sliderRect.width;
                progress.style.width = `${percent}%`;
                thumb.style.left = `${px}px`;
            };
            
            const getPercentFromClientX = (clientX) => {
                const offsetX = clientX - sliderRect.left;
                return (offsetX / sliderRect.width) * 100;
            };
            
            const percentToValue = (percent) => {
                const rawValue = min + (percent / 100) * (max - min);
                return Math.round(rawValue / step) * step;
            };
            
            const valueToPercent = (val) => {
                return ((val - min) / (max - min)) * 100;
            };
            
            const onMove = (clientX) => {
                const percent = getPercentFromClientX(clientX);
                value = percentToValue(percent);
                updateThumbAndProgress(valueToPercent(value));
                
                // Update display value
                const valueEl = document.getElementById(`${sliderName}Value`);
                if (valueEl) {
                    valueEl.textContent = value;
                    valueEl.classList.remove('changed');
                    void valueEl.offsetWidth;
                    valueEl.classList.add('changed');
                }
                
                // Update state
                if (sliderName === 'rounds') state.rounds = value;
                if (sliderName === 'holdTime') state.initialHoldTime = value;
                if (sliderName === 'breathDuration') state.breathDuration = value;
            };
            
            const onMouseDown = (e) => {
                isDragging = true;
                sliderRect = sliderEl.getBoundingClientRect();
                onMove(e.clientX);
                thumb.classList.add('active');
            };
            
            const onTouchStart = (e) => {
                isDragging = true;
                sliderRect = sliderEl.getBoundingClientRect();
                onMove(e.touches[0].clientX);
                thumb.classList.add('active');
            };
            
            const onMouseMove = (e) => {
                if (isDragging) onMove(e.clientX);
            };
            
            const onTouchMove = (e) => {
                if (isDragging) onMove(e.touches[0].clientX);
            };
            
            const stopDrag = () => {
                isDragging = false;
                thumb.classList.remove('active');
            };
            
            // Events
            thumb.addEventListener('mousedown', onMouseDown);
            thumb.addEventListener('touchstart', onTouchStart, { passive: true });
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', stopDrag);
            
            sliderEl.addEventListener('mousedown', (e) => {
                if (e.target === sliderEl || e.target === progress) {
                    sliderRect = sliderEl.getBoundingClientRect();
                    onMove(e.clientX);
                }
            });
            
            sliderEl.addEventListener('touchstart', (e) => {
                if (e.target === sliderEl || e.target === progress) {
                    sliderRect = sliderEl.getBoundingClientRect();
                    onMove(e.touches[0].clientX);
                }
            }, { passive: true });
            
            // Initialize
            sliderRect = sliderEl.getBoundingClientRect();
            updateThumbAndProgress(valueToPercent(value));
        });
    }
    
    async function preloadSounds() {
        if (state.soundsLoaded) return;
        
        const loadPromises = Object.values(sounds).map(sound => {
            if (!sound) return Promise.resolve();
            return new Promise((resolve) => {
                sound.load();
                sound.volume = 0;
                sound.play().then(() => {
                    sound.pause();
                    sound.currentTime = 0;
                    sound.volume = 1;
                    resolve();
                }).catch(() => {
                    sound.volume = 1;
                    resolve();
                });
            });
        });
        
        await Promise.all(loadPromises);
        state.soundsLoaded = true;
    }

    async function toggleSound() {
        state.soundEnabled = elements.soundToggle.checked;
        
        if (state.soundEnabled) {
            await preloadSounds();
            playSoundForCurrentPhase();
        } else {
            stopAllSounds();
        }
    }

    function playSound(sound) {
        if (state.soundEnabled && sound) {
            sound.currentTime = 0;
            sound.play().catch(() => {});
        }
    }

    function stopAllSounds() {
        Object.values(sounds).forEach(sound => {
            if (sound) {
                sound.pause();
                sound.currentTime = 0;
            }
        });
    }

    function playSoundForCurrentPhase() {
        if (!state.soundEnabled) return;

        switch (state.currentPhase) {
            case 'Get Ready':
                playSound(sounds.countdown);
                break;
            case 'Inhale':
                playSound(sounds.inhale);
                playSound(sounds.backgroundBreathing);
                break;
            case 'Exhale':
                playSound(sounds.exhale);
                playSound(sounds.backgroundBreathing);
                break;
            case 'Hold':
                playSound(sounds.backgroundHold);
                break;
            case 'Deep Inhale':
                playSound(sounds.inhale);
                break;
            case 'Deep Exhale':
                playSound(sounds.exhale);
                playSound(sounds.backgroundBreathing);
                break;
        }
    }

    function togglePause() {
        state.isPaused = !state.isPaused;
        elements.pauseButton?.classList.toggle('paused', state.isPaused);
    }

    function showScreen(screenId) {
        Object.values(screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        if (screens[screenId]) screens[screenId].classList.add('active');

        if (screenId === 'exercise') {
            elements.bottomControls?.classList.add('active');
        } else {
            elements.bottomControls?.classList.remove('active');
            if (screenId === 'completion') {
                updateCompletionTexts();
            }
        }
    }

    function showSettings() {
        // Update display values
        if (elements.roundsValue) elements.roundsValue.textContent = state.rounds;
        if (elements.holdTimeValue) elements.holdTimeValue.textContent = state.initialHoldTime;
        if (elements.breathDurationValue) elements.breathDurationValue.textContent = state.breathDuration;
        
        // Update slider data attributes
        const roundsSlider = document.querySelector('[data-slider="rounds"]');
        const holdTimeSlider = document.querySelector('[data-slider="holdTime"]');
        const breathDurationSlider = document.querySelector('[data-slider="breathDuration"]');
        
        if (roundsSlider) roundsSlider.dataset.value = state.rounds;
        if (holdTimeSlider) holdTimeSlider.dataset.value = state.initialHoldTime;
        if (breathDurationSlider) breathDurationSlider.dataset.value = state.breathDuration;
        
        elements.settingsModal?.classList.add('active');
        elements.modalOverlay?.classList.add('active');
        
        // Initialize sliders after modal is visible
        setTimeout(() => initSliders(), 50);
    }

    function hideSettings() {
        elements.settingsModal?.classList.remove('active');
        elements.modalOverlay?.classList.remove('active');
    }

    function saveSettings() {
        if (elements.roundsInput && elements.holdTimeInput && elements.breathDurationInput) {
            state.rounds = parseInt(elements.roundsInput.value) || 3;
            state.initialHoldTime = parseInt(elements.holdTimeInput.value) || 90;
            state.breathDuration = parseFloat(elements.breathDurationInput.value) || 1.5;
            hideSettings();
        }
    }

    function resetAndShowHome() {
        state.currentRound = 1;
        state.breathCount = 0;
        state.isBreathing = false;
        setProgress(0);
        stopAllSounds();
        stopTipRotation();
        releaseWakeLock();
        setBreathingAnimation(null);
        showScreen('home');
        state.currentPhase = 'Get Ready';
    }

    function showBreatheInButton() {
        elements.breatheInButton?.classList.add('active');
    }

    function hideBreatheInButton() {
        elements.breatheInButton?.classList.remove('active');
    }

    function showPauseButton() {
    }

    function hidePauseButton() {
        elements.pauseButton?.classList.remove('paused');
    }

    async function startExercise() {
        await requestWakeLock();
        stopAllSounds();
        showScreen('exercise');
        await startRound();
    }

    function getCurrentHoldTime() {
        return Math.round(state.initialHoldTime * Math.pow(1.5, state.currentRound - 1));
    }

    async function countdown(seconds) {
        state.currentPhase = 'Get Ready';
        animatePhaseChange();
        updateExerciseTexts();
        elements.counter.textContent = seconds;
        
        if (state.soundEnabled) {
            playSound(sounds.countdown);
        }
        
        await Promise.all([
            animateProgress(seconds * 1000, false, false),
            updateCounterDuringHold(seconds)
        ]);
        
        setProgress(0);
        if (state.soundEnabled) {
            sounds.countdown.pause();
        }
    }

    function easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    async function animateProgress(duration, isIncreasing = true, pauseAtEnds = true, reverse = false) {
        return new Promise(resolve => {
            state.shouldStopAnimation = false;
            let startTime = performance.now();
            let pausedTime = 0;
            let pauseStart = 0;
            const fiveSecondsBeforeEnd = duration - 5000;
            let hasPlayedCountdown = false;

            function animate(currentTime) {
                if (state.shouldStopAnimation) {
                    resolve();
                    return;
                }

                if (state.isPaused) {
                    if (!pauseStart) pauseStart = performance.now();
                    requestAnimationFrame(animate);
                    return;
                } else if (pauseStart) {
                    pausedTime += performance.now() - pauseStart;
                    pauseStart = 0;
                }

                const elapsed = currentTime - startTime - pausedTime;
                let linearFraction = Math.min(elapsed / duration, 1);
                let easedFraction = easeInOutSine(linearFraction);
                
                let progress;
                if (reverse) {
                    progress = (1 - easedFraction) * 100;
                } else {
                    progress = isIncreasing
                        ? easedFraction * 100
                        : (1 - easedFraction) * 100;
                }

                setProgress(progress);

                if (state.currentPhase === 'Hold' && elapsed >= fiveSecondsBeforeEnd && !hasPlayedCountdown) {
                    if (state.soundEnabled) {
                        playSound(sounds.countdown);
                    }
                    hasPlayedCountdown = true;
                }

                if (linearFraction < 1) {
                    requestAnimationFrame(animate);
                } else {
                    if (pauseAtEnds) {
                        setTimeout(resolve, 300);
                    } else {
                        resolve();
                    }
                }
            }

            requestAnimationFrame(animate);
        });
    }

    async function updateCounterDuringHold(duration) {
        if (!elements.counter) return;
        
        let current = duration;
        elements.counter.textContent = current;
        animateCounter();
        
        while (current > 0) {
            await sleep(1000);
            current--;
            elements.counter.textContent = current;
            animateCounter();
        }
    }

    async function startRound() {
        await countdown(5);
        
        state.breathCount = 0;
        if (state.soundEnabled) {
            playSound(sounds.backgroundBreathing);
        }
        
        const totalBreaths = 30;
        for (let i = 0; i < totalBreaths; i++) {
            state.breathCount = i + 1;
            
            state.currentPhase = 'Inhale';
            animatePhaseChange();
            updateExerciseTexts();
            elements.counter.textContent = state.breathCount;
            animateCounter();
            
            const breathTime = i === totalBreaths - 1 ? state.breathDuration * 2 * 1000 : state.breathDuration * 1000;
            setBreathingAnimation('inhale', breathTime);
            
            if (state.soundEnabled) {
                playSound(sounds.inhale);
            }
            
            await animateProgress(breathTime, true, false);
            
            state.currentPhase = 'Exhale';
            animatePhaseChange();
            updateExerciseTexts();
            
            setBreathingAnimation('exhale', breathTime);
            
            if (state.soundEnabled) {
                playSound(sounds.exhale);
            }
            await animateProgress(breathTime, false, false);
        }

        setBreathingAnimation(null);

        const holdTime = getCurrentHoldTime();
        state.currentPhase = 'Hold';
        animatePhaseChange();
        updateExerciseTexts();
        
        startHoldPulse();
        
        if (state.soundEnabled) {
            sounds.backgroundBreathing.pause();
            playSound(sounds.backgroundHold);
        }

        state.isHolding = true;
        state.isPaused = false;
        updateExerciseTexts();
        
        startTipRotation(8);
        
        setTimeout(() => {
            if (state.isHolding) showBreatheInButton();
        }, 10000);

        const holdStart = performance.now();
        let pausedTime = 0;
        let pauseStart = 0;
        let hasPlayedCountdown = false;
        let lastSecond = holdTime;

        const animateHold = new Promise(resolve => {
            const totalDuration = holdTime * 1000;

            const animate = (time) => {
                if (state.shouldStopAnimation) {
                    resolve();
                    return;
                }

                if (state.isPaused) {
                    if (!pauseStart) pauseStart = performance.now();
                    requestAnimationFrame(animate);
                    return;
                } else if (pauseStart) {
                    pausedTime += performance.now() - pauseStart;
                    pauseStart = 0;
                }

                const elapsed = time - holdStart - pausedTime;
                const fraction = Math.min(elapsed / totalDuration, 1);
                setProgress(fraction * 100);

                const currentSecond = Math.ceil((totalDuration - elapsed) / 1000);
                if (currentSecond !== lastSecond && currentSecond >= 0) {
                    lastSecond = currentSecond;
                    elements.counter.textContent = currentSecond;
                    animateCounter();
                }

                if (elapsed >= totalDuration - 5000 && !hasPlayedCountdown) {
                    if (state.soundEnabled) playSound(sounds.countdown);
                    hasPlayedCountdown = true;
                }

                if (fraction < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });

        elements.counter.textContent = holdTime;

        await animateHold;

        stopHoldPulse();
        stopTipRotation();
        const actualHold = Math.round((performance.now() - holdStart - pausedTime) / 1000);
        state.lastHoldTime = actualHold;

        if (state.isHolding) hideBreatheInButton();

        state.isHolding = false;
        state.shouldStopAnimation = false;

        state.currentPhase = 'Deep Inhale';
        animatePhaseChange();
        updateExerciseTexts();
        elements.counter.textContent = '';
        
        const deepInhaleTime = state.breathDuration * 2 * 1000;
        setBreathingAnimation('inhale', deepInhaleTime);
        
        if (state.soundEnabled) {
            playSound(sounds.inhale);
            sounds.backgroundHold.pause();
        }
        await animateProgress(deepInhaleTime, true, false, true);
        await sleep(300);

        setBreathingAnimation(null);

        state.currentPhase = 'Hold';
        animatePhaseChange();
        updateExerciseTexts();
        elements.counter.textContent = '15';
        
        startHoldPulse();
        
        if (state.soundEnabled) {
            sounds.backgroundBreathing.pause();
            playSound(sounds.backgroundHold);
        }
        
        await Promise.all([
            animateProgress(15000, true, false),
            updateCounterDuringHold(15)
        ]);

        stopHoldPulse();

        state.currentPhase = 'Deep Exhale';
        animatePhaseChange();
        updateExerciseTexts();
        elements.counter.textContent = '';
        
        const deepExhaleTime = state.breathDuration * 2 * 1000;
        setBreathingAnimation('exhale', deepExhaleTime);
        
        if (state.soundEnabled) {
            playSound(sounds.exhale);
            sounds.backgroundHold.pause();
            playSound(sounds.backgroundBreathing);
        }
        await animateProgress(deepExhaleTime, false, false);
        await sleep(300);

        setBreathingAnimation(null);

        if (state.currentRound < state.rounds) {
            const t = translations[state.language];
            elements.nextRoundMessage.textContent = t.nextRoundNum.replace('{num}', state.currentRound + 1);
            elements.nextRoundMessage.style.display = 'block';
            elements.breathingCircle.classList.add('hidden');
            await sleep(3000);
            elements.nextRoundMessage.style.display = 'none';
            elements.breathingCircle.classList.remove('hidden');
            state.currentRound++;
            await startRound();
        } else {
            stopAllSounds();
            showScreen('completion');
            state.currentPhase = 'Get Ready';
        }
    }

    function sleep(ms) {
        return new Promise(resolve => {
            let remaining = ms;
            let lastTime = performance.now();
            
            function check() {
                if (state.isPaused) {
                    lastTime = performance.now();
                    requestAnimationFrame(check);
                    return;
                }
                
                const now = performance.now();
                remaining -= (now - lastTime);
                lastTime = now;
                
                if (remaining <= 0) {
                    resolve();
                } else {
                    requestAnimationFrame(check);
                }
            }
            
            requestAnimationFrame(check);
        });
    }
});
