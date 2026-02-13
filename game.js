class MathGame {
    constructor() {
        this.score = 0;
        this.currentQuestion = 0;
        this.totalQuestions = 20;
        this.questions = [];
        this.currentCorrectAnswer = 0;
        this.roundAnswers = []; // Store all answers from current round
        this.streak = 0; // Track consecutive correct answers
        this.answersSinceLastAnimation = 0; // Track answers for random animations
        this.nextAnimationTrigger = this.getRandomAnimationTrigger(); // When to show next animation
        this.statsOpenedFromGame = false; // Track where stats was opened from
        this.coinsEarnedThisRound = 0; // Track coins earned in current round
        this.isSuperScoreMode = false; // Track if Super Score Mode is active
        this.numberPadInput = ''; // Store current number pad input
        
        // Button text constants
        this.STATS_BTN_GAME_TEXT = 'Back to Game 🎮';
        this.STATS_BTN_RESULTS_TEXT = 'Back to Results';
        
        // DOM elements
        this.scoreElement = document.getElementById('score');
        this.progressElement = document.getElementById('progress');
        this.questionElement = document.getElementById('question');
        this.answerCircles = document.querySelectorAll('.answer-circle');
        this.resultsScreen = document.getElementById('results-screen');
        this.finalScoreElement = document.getElementById('final-score');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.feedbackOverlay = document.getElementById('feedback-overlay');
        this.reviewBtn = document.getElementById('review-btn');
        this.statsBtn = document.getElementById('stats-btn');
        this.reviewScreen = document.getElementById('review-screen');
        this.statsScreen = document.getElementById('stats-screen');
        this.backFromReviewBtn = document.getElementById('back-from-review-btn');
        this.backFromStatsBtn = document.getElementById('back-from-stats-btn');
        this.clearStatsBtn = document.getElementById('clear-stats-btn');
        this.headerStatsBtn = document.getElementById('header-stats-btn');
        this.heatingMeterFill = document.getElementById('heating-meter-fill');
        this.heatingMeterFire = document.getElementById('heating-meter-fire');
        this.heatingMeterCount = document.getElementById('heating-meter-count');
        this.titleBalloons = document.getElementById('title-balloons');
        this.walletAmountEl = document.getElementById('wallet-amount');
        this.headerStoreBtn = document.getElementById('header-store-btn');
        this.headerCollectionBtn = document.getElementById('header-collection-btn');
        this.headerCollectionCount = document.getElementById('header-collection-count');
        this.storeScreen = document.getElementById('store-screen');
        this.storeGrid = document.getElementById('store-grid');
        this.storeWalletAmount = document.getElementById('store-wallet-amount');
        this.backFromStoreBtn = document.getElementById('back-from-store-btn');
        this.collectionScreen = document.getElementById('collection-screen');
        this.collectionGrid = document.getElementById('collection-grid');
        this.collectionProgress = document.getElementById('collection-progress');
        this.backFromCollectionBtn = document.getElementById('back-from-collection-btn');
        this.resultsStoreBtn = document.getElementById('results-store-btn');
        this.resultsCollectionBtn = document.getElementById('results-collection-btn');
        this.resultsCoinsEarned = document.getElementById('results-coins-earned');
        this.resultsWalletBalance = document.getElementById('results-wallet-balance');
        this.headerWhiteboardBtn = document.getElementById('header-whiteboard-btn');
        this.headerMenuBtn = document.getElementById('header-menu-btn');
        this.headerMenuPopup = document.getElementById('header-menu-popup');
        this.whiteboardOverlay = document.getElementById('whiteboard-overlay');
        this.whiteboardCanvas = document.getElementById('whiteboard-canvas');
        this.whiteboardCloseBtn = document.getElementById('whiteboard-close-btn');
        this.whiteboardEraserBtn = document.getElementById('whiteboard-eraser-btn');
        this.whiteboardQuestion = document.getElementById('whiteboard-question');
        this.whiteboardAnswers = document.getElementById('whiteboard-answers');
        this.modeToggleBtn = document.getElementById('mode-toggle-btn');
        this.numberPadContainer = document.getElementById('number-pad-container');
        this.numberPadDisplay = document.getElementById('number-pad-display');
        this.answersContainer = document.querySelector('.answers-container');
        
        // Initialize statistics manager
        this.statsManager = new StatisticsManager();
        
        // Initialize wallet and store managers
        this.walletManager = new WalletManager();
        this.storeManager = new StoreManager();
        this.featureToggles = new FeatureTogglesManager();
        
        // Initialize audio context for sound effects
        this.audioContext = null;
        
        // Whiteboard state
        this.whiteboardCtx = null;
        this.isDrawing = false;
        this.whiteboardStates = {}; // Store whiteboard state for each question
        
        this.init();
    }
    
    init() {
        // Generate all questions for this round
        this.generateQuestions();
        
        // Set up event listeners
        this.answerCircles.forEach((circle, index) => {
            circle.addEventListener('click', () => this.checkAnswer(index));
        });
        
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        this.reviewBtn.addEventListener('click', () => this.showReview());
        this.statsBtn.addEventListener('click', () => this.showStats());
        this.backFromReviewBtn.addEventListener('click', () => this.hideReview());
        this.backFromStatsBtn.addEventListener('click', () => this.hideStats());
        this.clearStatsBtn.addEventListener('click', () => this.clearStats());
        this.headerStatsBtn.addEventListener('click', () => this.showStatsFromGame());
        this.headerStoreBtn.addEventListener('click', () => this.showStore());
        this.headerCollectionBtn.addEventListener('click', () => this.showCollection());
        this.backFromStoreBtn.addEventListener('click', () => this.hideStore());
        this.backFromCollectionBtn.addEventListener('click', () => this.hideCollection());
        this.resultsStoreBtn.addEventListener('click', () => this.showStore());
        this.resultsCollectionBtn.addEventListener('click', () => this.showCollection());
        this.headerWhiteboardBtn.addEventListener('click', () => this.showWhiteboard());
        this.whiteboardCloseBtn.addEventListener('click', () => this.hideWhiteboard());
        this.whiteboardEraserBtn.addEventListener('click', () => this.clearWhiteboard());
        
        // Mode toggle
        this.modeToggleBtn.addEventListener('click', () => this.toggleMode());
        
        // Number pad buttons
        this.setupNumberPad();
        
        // Menu toggle
        this.headerMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.headerMenuPopup.classList.toggle('active');
        });
        // Close menu when clicking a menu item
        this.headerMenuPopup.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-popup-btn')) {
                this.headerMenuPopup.classList.remove('active');
            }
        });
        document.addEventListener('click', (e) => {
            if (!this.headerMenuBtn.contains(e.target) && !this.headerMenuPopup.contains(e.target)) {
                this.headerMenuPopup.classList.remove('active');
            }
        });
        
        // Initialize whiteboard canvas
        this.initWhiteboard();
        
        // Update wallet display
        this.updateWalletDisplay();
        this.updateCollectionCount();
        
        // Apply any active feature toggles
        this.applyFeatureToggles();
        
        // Initialize answer interface based on mode
        this.updateAnswerInterface();
        
        // Display first question
        this.displayQuestion();
    }
    
    // Initialize audio context (called on first user interaction)
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    // Play correct answer sound effect
    playCorrectSound() {
        this.initAudioContext();
        const ctx = this.audioContext;
        
        // Musical note frequencies
        const NOTE_C5 = 523.25;
        const NOTE_E5 = 659.25;
        const NOTE_G5 = 783.99;
        
        // Create a cheerful ascending tone with three separate notes
        const notes = [
            { freq: NOTE_C5, start: 0, duration: 0.1 },
            { freq: NOTE_E5, start: 0.1, duration: 0.1 },
            { freq: NOTE_G5, start: 0.2, duration: 0.15 }
        ];
        
        notes.forEach(note => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime + note.start);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.start + note.duration);
            
            oscillator.start(ctx.currentTime + note.start);
            oscillator.stop(ctx.currentTime + note.start + note.duration);
        });
    }
    
    // Play wrong answer sound effect
    playWrongSound() {
        this.initAudioContext();
        const ctx = this.audioContext;
        
        // Create a descending "wrong" tone
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(400, ctx.currentTime); // Start higher
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3); // Drop down
        
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    }
    
    generateQuestions() {
        this.questions = [];
        const baseNumbers = [7, 8, 9];
        const multipliers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        
        for (let i = 0; i < this.totalQuestions; i++) {
            const baseNumber = baseNumbers[Math.floor(Math.random() * baseNumbers.length)];
            const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
            
            // Randomly choose multiplication or division
            const isDivision = Math.random() > 0.5 && multiplier !== 0;
            
            let question, answer;
            if (isDivision) {
                // For division: dividend ÷ baseNumber = multiplier
                // This tests knowing that baseNumber × multiplier = dividend
                answer = multiplier;
                const dividend = baseNumber * multiplier;
                question = `${dividend} ÷ ${baseNumber} = ?`;
            } else {
                answer = baseNumber * multiplier;
                question = `${baseNumber} × ${multiplier} = ?`;
            }
            
            this.questions.push({ question, answer });
        }
    }
    
    displayQuestion() {
        if (this.currentQuestion >= this.totalQuestions) {
            this.showResults();
            return;
        }
        
        const { question, answer } = this.questions[this.currentQuestion];
        
        // Update question display with animation
        this.questionElement.style.animation = 'none';
        setTimeout(() => {
            this.questionElement.style.animation = 'popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }, 10);
        
        this.questionElement.textContent = question;
        this.currentCorrectAnswer = answer;
        
        // Update answer interface based on mode
        if (this.isSuperScoreMode) {
            // Reset number pad input
            this.numberPadInput = '';
            this.updateNumberPadDisplay();
        } else {
            // Generate answer options
            const answers = this.generateAnswerOptions(answer);
            
            // Update answer circles
            this.answerCircles.forEach((circle, index) => {
                const answerText = circle.querySelector('.answer-text');
                answerText.textContent = answers[index];
                
                // Reset classes
                circle.classList.remove('correct', 'wrong');
                
                // Add entrance animation
                circle.style.animation = 'none';
                setTimeout(() => {
                    circle.style.animation = `slideUp 0.6s ease-out ${index * 0.1}s both`;
                }, 10);
            });
        }
        
        // Update progress
        this.progressElement.textContent = `${this.currentQuestion + 1}/20`;
        
        // Clear whiteboard for new question (if not already saved)
        if (!this.whiteboardStates[this.currentQuestion]) {
            // Only clear the canvas context if it exists
            if (this.whiteboardCtx) {
                this.whiteboardCtx.clearRect(0, 0, this.whiteboardCanvas.width, this.whiteboardCanvas.height);
            }
        }
    }
    
    generateAnswerOptions(correctAnswer) {
        const answers = [correctAnswer];
        
        // Generate 3 wrong answers
        while (answers.length < 4) {
            // Generate plausible wrong answers
            let wrongAnswer;
            const offset = Math.floor(Math.random() * 20) - 10;
            wrongAnswer = correctAnswer + offset;
            
            // Make sure it's a valid answer (positive number, not duplicate)
            if (wrongAnswer > 0 && wrongAnswer <= 144 && !answers.includes(wrongAnswer)) {
                answers.push(wrongAnswer);
            }
        }
        
        // Shuffle the answers
        return this.shuffleArray(answers);
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    toggleMode() {
        this.isSuperScoreMode = !this.isSuperScoreMode;
        
        // Update button text and aria-label for accessibility
        if (this.isSuperScoreMode) {
            this.modeToggleBtn.textContent = '⚡ Super Score Mode (2x)';
            this.modeToggleBtn.setAttribute('aria-label', 'Super Score Mode - Double Points Active');
            this.modeToggleBtn.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
        } else {
            this.modeToggleBtn.textContent = '⚡ Normal Mode';
            this.modeToggleBtn.setAttribute('aria-label', 'Normal Mode');
            this.modeToggleBtn.style.background = '';
        }
        
        // Update UI to show/hide number pad or answer circles
        this.updateAnswerInterface();
        
        // Redisplay current question to update answer options if not at end
        if (this.currentQuestion < this.totalQuestions) {
            this.displayQuestion();
        }
    }
    
    updateAnswerInterface() {
        if (this.isSuperScoreMode) {
            // Show number pad, hide answer circles
            this.answersContainer.style.display = 'none';
            this.numberPadContainer.classList.add('active');
            this.numberPadInput = '';
            this.updateNumberPadDisplay();
        } else {
            // Show answer circles, hide number pad
            this.answersContainer.style.display = 'grid';
            this.numberPadContainer.classList.remove('active');
        }
    }
    
    setupNumberPad() {
        const buttons = this.numberPadContainer.querySelectorAll('.number-pad-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.dataset.value;
                this.handleNumberPadInput(value);
            });
        });
    }
    
    handleNumberPadInput(value) {
        if (value === 'clear') {
            this.numberPadInput = '';
            this.updateNumberPadDisplay();
        } else if (value === 'submit') {
            if (this.numberPadInput !== '') {
                const parsedAnswer = parseInt(this.numberPadInput);
                // Validate that the answer is a positive integer
                if (!isNaN(parsedAnswer) && parsedAnswer > 0) {
                    this.checkNumberPadAnswer(parsedAnswer);
                }
                this.numberPadInput = '';
                this.updateNumberPadDisplay();
            }
        } else {
            // Limit input to 3 digits (supports answers up to 999 for future expansion)
            if (this.numberPadInput.length < 3) {
                this.numberPadInput += value;
                this.updateNumberPadDisplay();
            }
        }
    }
    
    updateNumberPadDisplay() {
        this.numberPadDisplay.textContent = this.numberPadInput || '_';
    }
    
    checkNumberPadAnswer(userAnswer) {
        const { question, answer } = this.questions[this.currentQuestion];
        const isCorrect = userAnswer === this.currentCorrectAnswer;
        
        // Hide title balloons after first answer
        if (this.currentQuestion === 0 && this.titleBalloons) {
            this.titleBalloons.classList.add('float-away');
        }
        
        // Store the answer for review
        this.roundAnswers.push({
            question: question,
            correctAnswer: this.currentCorrectAnswer,
            userAnswer: userAnswer,
            isCorrect: isCorrect
        });
        
        // Update statistics
        this.statsManager.recordAnswer(question, isCorrect);
        
        // Update streak
        this.updateStreak(isCorrect);
        
        // Play random animation
        this.playRandomAnimation(isCorrect);
        
        // Disable number pad during animation
        const buttons = this.numberPadContainer.querySelectorAll('.number-pad-btn');
        buttons.forEach(btn => btn.disabled = true);
        
        if (isCorrect) {
            // Correct answer! Points and coins are doubled in Super Score Mode
            const scoreMultiplier = this.isSuperScoreMode ? 2 : 1;
            this.score += 1 * scoreMultiplier;
            this.showFeedback('🎉', 'correct');
            this.playCorrectSound();
            this.updateScore();
            this.createConfetti();
            
            // Award streak-based coins with mode multiplier
            const coinsEarned = this.streak * scoreMultiplier;
            this.walletManager.addCoins(coinsEarned);
            this.coinsEarnedThisRound += coinsEarned;
            this.updateWalletDisplay();
            this.showCoinAnimation(coinsEarned);
            this.playChaChingSound();
            
            // Flash display green
            this.numberPadDisplay.style.background = '#34d399';
            setTimeout(() => {
                this.numberPadDisplay.style.background = 'white';
            }, 500);
        } else {
            // Wrong answer
            this.showFeedback('😕', 'wrong');
            this.playWrongSound();
            
            // Flash display red and show correct answer
            this.numberPadDisplay.style.background = '#ef4444';
            this.numberPadDisplay.style.color = 'white';
            setTimeout(() => {
                this.numberPadDisplay.textContent = this.currentCorrectAnswer;
            }, 300);
            setTimeout(() => {
                this.numberPadDisplay.style.background = 'white';
                this.numberPadDisplay.style.color = '#333';
                this.numberPadDisplay.textContent = '_';
            }, 1200);
        }
        
        // Move to next question after delay
        setTimeout(() => {
            this.currentQuestion++;
            
            // Re-enable number pad
            buttons.forEach(btn => btn.disabled = false);
            
            this.displayQuestion();
        }, 1500);
    }
    
    getRandomAnimationTrigger() {
        // Random integer between 3 and 8 inclusive (produces 3, 4, 5, 6, 7, or 8)
        return Math.floor(Math.random() * 6) + 3;
    }
    
    updateStreak(isCorrect) {
        if (isCorrect) {
            this.streak++;
        } else {
            this.streak = 0;
        }
        
        // Update heating meter
        const percentage = Math.min((this.streak / 20) * 100, 100);
        this.heatingMeterFill.style.width = percentage + '%';
        this.heatingMeterCount.textContent = this.streak;
        
        // Add fire effect at 10+ streak
        if (this.streak >= 10) {
            this.heatingMeterFill.classList.add('on-fire');
            this.heatingMeterFire.classList.add('active');
            
            // Mega fire at 15+
            if (this.streak >= 15) {
                this.heatingMeterFire.classList.add('mega-fire');
            }
        } else {
            this.heatingMeterFill.classList.remove('on-fire');
            this.heatingMeterFire.classList.remove('active', 'mega-fire');
        }
    }
    
    playRandomAnimation(isCorrect) {
        this.answersSinceLastAnimation++;
        
        if (this.answersSinceLastAnimation >= this.nextAnimationTrigger) {
            this.answersSinceLastAnimation = 0;
            this.nextAnimationTrigger = this.getRandomAnimationTrigger();
            
            if (isCorrect) {
                this.playCorrectAnimation();
            } else {
                this.playWrongAnimation();
            }
        }
    }
    
    playCorrectAnimation() {
        const animations = [
            { emoji: '❤️', animation: 'heartZoom' },
            { emoji: '⭐', animation: 'starSpin' },
            { emoji: '🎈', animation: 'balloonFloat' },
            { emoji: '🌟', animation: 'sparkle' },
            { emoji: '🦄', animation: 'unicornGallop' },
            { emoji: '🌈', animation: 'rainbowSlide' },
            { emoji: '🎵', animation: 'musicNote' },
            { emoji: '✨', animation: 'glitter' },
            { emoji: '🎁', animation: 'giftBox' },
            { emoji: '🌺', animation: 'flowerBloom' }
        ];
        
        const random = animations[Math.floor(Math.random() * animations.length)];
        this.createAnimationElement(random.emoji, random.animation, 'correct');
    }
    
    playWrongAnimation() {
        const animations = [
            { emoji: '🐍', animation: 'snakeBite' },
            { emoji: '⛈️', animation: 'stormCloud' },
            { emoji: '💥', animation: 'explosion' },
            { emoji: '🌪️', animation: 'tornado' },
            { emoji: '👻', animation: 'ghost' },
            { emoji: '🦇', animation: 'batFly' },
            { emoji: '💔', animation: 'brokenHeart' },
            { emoji: '☔', animation: 'rain' },
            { emoji: '🌩️', animation: 'lightning' },
            { emoji: '🕷️', animation: 'spider' }
        ];
        
        const random = animations[Math.floor(Math.random() * animations.length)];
        this.createAnimationElement(random.emoji, random.animation, 'wrong');
    }
    
    createAnimationElement(emoji, animationClass, type) {
        const element = document.createElement('div');
        element.className = `random-animation ${animationClass}`;
        element.textContent = emoji;
        document.body.appendChild(element);
        
        setTimeout(() => {
            element.remove();
        }, 2000);
    }
    
    checkAnswer(selectedIndex) {
        const selectedCircle = this.answerCircles[selectedIndex];
        const selectedAnswer = parseInt(selectedCircle.querySelector('.answer-text').textContent);
        const { question, answer } = this.questions[this.currentQuestion];
        const isCorrect = selectedAnswer === this.currentCorrectAnswer;
        
        // Hide title balloons after first answer
        if (this.currentQuestion === 0 && this.titleBalloons) {
            this.titleBalloons.classList.add('float-away');
        }
        
        // Store the answer for review
        this.roundAnswers.push({
            question: question,
            correctAnswer: this.currentCorrectAnswer,
            userAnswer: selectedAnswer,
            isCorrect: isCorrect
        });
        
        // Update statistics
        this.statsManager.recordAnswer(question, isCorrect);
        
        // Update streak
        this.updateStreak(isCorrect);
        
        // Play random animation
        this.playRandomAnimation(isCorrect);
        
        // Disable clicking during animation
        this.answerCircles.forEach(circle => {
            circle.style.pointerEvents = 'none';
        });
        
        if (isCorrect) {
            // Correct answer!
            this.score++;
            selectedCircle.classList.add('correct');
            this.showFeedback('🎉', 'correct');
            this.playCorrectSound();
            this.updateScore();
            this.createConfetti();
            
            // Award streak-based coins
            const coinsEarned = this.streak;
            this.walletManager.addCoins(coinsEarned);
            this.coinsEarnedThisRound += coinsEarned;
            this.updateWalletDisplay();
            this.showCoinAnimation(coinsEarned);
            this.playChaChingSound();
        } else {
            // Wrong answer
            selectedCircle.classList.add('wrong');
            this.showFeedback('😕', 'wrong');
            this.playWrongSound();
            
            // Highlight the correct answer
            this.answerCircles.forEach(circle => {
                const answer = parseInt(circle.querySelector('.answer-text').textContent);
                if (answer === this.currentCorrectAnswer) {
                    setTimeout(() => {
                        circle.classList.add('correct');
                    }, 400);
                }
            });
        }
        
        // Move to next question after delay
        setTimeout(() => {
            this.currentQuestion++;
            
            // Re-enable clicking
            this.answerCircles.forEach(circle => {
                circle.style.pointerEvents = 'auto';
            });
            
            this.displayQuestion();
        }, 1500);
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        this.scoreElement.classList.remove('updated');
        setTimeout(() => {
            this.scoreElement.classList.add('updated');
        }, 10);
    }
    
    showFeedback(emoji, type) {
        this.feedbackOverlay.textContent = emoji;
        this.feedbackOverlay.classList.remove('show');
        setTimeout(() => {
            this.feedbackOverlay.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            this.feedbackOverlay.classList.remove('show');
        }, 800);
    }
    
    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 30);
        }
    }
    
    showResults() {
        this.finalScoreElement.textContent = this.score;
        this.resultsScreen.classList.add('show');
        
        // Record this game's score
        this.statsManager.recordGameScore(this.score, this.totalQuestions);
        
        // Show coins earned this round
        this.resultsCoinsEarned.textContent = this.coinsEarnedThisRound + ' 🪙';
        this.resultsWalletBalance.textContent = this.walletManager.getBalance() + ' 🪙';
        
        // Update results title based on score
        const resultsTitle = document.querySelector('.results-title');
        if (this.score === 20) {
            resultsTitle.textContent = '🌟 PERFECT! 🌟';
            this.createMassiveConfetti();
        } else if (this.score >= 15) {
            resultsTitle.textContent = '🎉 Awesome! 🎉';
            this.createConfetti();
        } else if (this.score >= 10) {
            resultsTitle.textContent = '👍 Good Job! 👍';
        } else {
            resultsTitle.textContent = '💪 Keep Practicing! 💪';
        }
    }
    
    createMassiveConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8'];
        
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 20);
        }
    }
    
    showReview() {
        this.reviewScreen.classList.add('show');
        const reviewList = document.getElementById('review-list');
        reviewList.innerHTML = '';
        
        this.roundAnswers.forEach((answer, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = `review-item ${answer.isCorrect ? 'correct' : 'incorrect'}`;
            
            reviewItem.innerHTML = `
                <div>
                    <div class="review-question">${index + 1}. ${answer.question}</div>
                </div>
                <div class="review-details">
                    <div class="review-status">${answer.isCorrect ? '✅' : '❌'}</div>
                    <div class="your-answer">Your answer: ${answer.userAnswer}</div>
                    ${!answer.isCorrect ? `<div class="correct-answer">Correct: ${answer.correctAnswer}</div>` : ''}
                </div>
            `;
            
            reviewList.appendChild(reviewItem);
        });
    }
    
    hideReview() {
        this.reviewScreen.classList.remove('show');
    }
    
    showStats() {
        this.statsScreen.classList.add('show');
        
        const stats = this.statsManager.getStatistics();
        
        // Draw the scores chart
        this.drawScoresChart(stats.scores);
        
        // Display most missed problems
        const missedStatsElement = document.getElementById('missed-stats');
        missedStatsElement.innerHTML = '';
        
        if (stats.mostMissed.length === 0) {
            missedStatsElement.innerHTML = '<div class="no-stats">No data yet. Play more rounds!</div>';
        } else {
            stats.mostMissed.slice(0, 5).forEach(stat => {
                const percentage = Math.round((stat.incorrect / stat.total) * 100);
                const item = document.createElement('div');
                item.className = 'stat-item';
                item.innerHTML = `
                    <div class="stat-problem">${stat.problem}</div>
                    <div class="stat-count">
                        <span>${stat.incorrect} missed</span>
                        <div class="stat-bar">
                            <div class="stat-bar-fill missed" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
                missedStatsElement.appendChild(item);
            });
        }
        
        // Display best performance
        const correctStatsElement = document.getElementById('correct-stats');
        correctStatsElement.innerHTML = '';
        
        if (stats.mostCorrect.length === 0) {
            correctStatsElement.innerHTML = '<div class="no-stats">No data yet. Play more rounds!</div>';
        } else {
            stats.mostCorrect.slice(0, 5).forEach(stat => {
                const percentage = Math.round((stat.correct / stat.total) * 100);
                const item = document.createElement('div');
                item.className = 'stat-item';
                item.innerHTML = `
                    <div class="stat-problem">${stat.problem}</div>
                    <div class="stat-count">
                        <span>${stat.correct} correct</span>
                        <div class="stat-bar">
                            <div class="stat-bar-fill correct" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
                correctStatsElement.appendChild(item);
            });
        }
        
        // Display overall stats
        const overallStatsElement = document.getElementById('overall-stats');
        const accuracy = stats.totalAttempts > 0 
            ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100) 
            : 0;
        
        overallStatsElement.innerHTML = `
            <div class="overall-stat">
                <div class="overall-stat-value">${stats.totalAttempts}</div>
                <div class="overall-stat-label">Total Questions</div>
            </div>
            <div class="overall-stat">
                <div class="overall-stat-value">${stats.totalCorrect}</div>
                <div class="overall-stat-label">Correct Answers</div>
            </div>
            <div class="overall-stat">
                <div class="overall-stat-value">${stats.totalAttempts - stats.totalCorrect}</div>
                <div class="overall-stat-label">Incorrect Answers</div>
            </div>
            <div class="overall-stat">
                <div class="overall-stat-value">${accuracy}%</div>
                <div class="overall-stat-label">Accuracy</div>
            </div>
        `;
    }
    
    drawScoresChart(scores) {
        const canvas = document.getElementById('scores-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        
        // Set canvas size
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (scores.length === 0) {
            ctx.fillStyle = '#999';
            ctx.font = '20px Comic Sans MS';
            ctx.textAlign = 'center';
            ctx.fillText('No game history yet. Play some rounds!', width / 2, height / 2);
            return;
        }
        
        // Calculate padding
        const padding = { top: 20, right: 20, bottom: 40, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        // Calculate running average
        const runningAvg = [];
        let sum = 0;
        scores.forEach((score, index) => {
            sum += score.score;
            runningAvg.push(sum / (index + 1));
        });
        
        // Find max score for scaling
        const maxScore = Math.max(...scores.map(s => s.score), ...runningAvg, 20);
        const yScale = chartHeight / maxScore;
        const xScale = chartWidth / Math.max(scores.length - 1, 1);
        
        // Draw grid lines
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();
            
            // Y-axis labels
            const value = Math.round(maxScore - (maxScore / 4) * i);
            ctx.fillStyle = '#666';
            ctx.font = '14px Comic Sans MS';
            ctx.textAlign = 'right';
            ctx.fillText(value.toString(), padding.left - 10, y + 5);
        }
        
        // Draw X-axis labels
        ctx.fillStyle = '#666';
        ctx.font = '12px Comic Sans MS';
        ctx.textAlign = 'center';
        scores.forEach((score, index) => {
            if (scores.length <= 10 || index % Math.ceil(scores.length / 10) === 0) {
                const x = padding.left + xScale * index;
                ctx.fillText(`${index + 1}`, x, height - padding.bottom + 20);
            }
        });
        
        // Draw running average line
        ctx.strokeStyle = '#f093fb';
        ctx.lineWidth = 3;
        ctx.beginPath();
        runningAvg.forEach((avg, index) => {
            const x = padding.left + xScale * index;
            const y = padding.top + chartHeight - (avg * yScale);
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Draw score line
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.beginPath();
        scores.forEach((score, index) => {
            const x = padding.left + xScale * index;
            const y = padding.top + chartHeight - (score.score * yScale);
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Draw score points
        scores.forEach((score, index) => {
            const x = padding.left + xScale * index;
            const y = padding.top + chartHeight - (score.score * yScale);
            
            ctx.fillStyle = '#667eea';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw axis labels
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Comic Sans MS';
        ctx.textAlign = 'center';
        ctx.fillText('Game Number', width / 2, height - 5);
        
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Score', 0, 0);
        ctx.restore();
    }
    
    showStatsFromGame() {
        // Show stats from the game screen (not results screen)
        this.statsOpenedFromGame = true;
        this.statsScreen.classList.add('show');
        this.showStats();
        
        // Update button text
        this.backFromStatsBtn.textContent = this.STATS_BTN_GAME_TEXT;
    }
    
    hideStats() {
        this.statsScreen.classList.remove('show');
        
        // Reset button text and flag
        if (this.statsOpenedFromGame) {
            this.backFromStatsBtn.textContent = this.STATS_BTN_RESULTS_TEXT;
            this.statsOpenedFromGame = false;
        }
    }
    
    clearStats() {
        if (confirm('Are you sure you want to clear all statistics? This cannot be undone.')) {
            this.statsManager.clearAll();
            this.showStats(); // Refresh the display
        }
    }
    
    resetGame() {
        this.score = 0;
        this.currentQuestion = 0;
        this.roundAnswers = [];
        this.streak = 0;
        this.coinsEarnedThisRound = 0;
        this.answersSinceLastAnimation = 0;
        this.nextAnimationTrigger = this.getRandomAnimationTrigger();
        this.resultsScreen.classList.remove('show');
        this.scoreElement.textContent = '0';
        
        // Show title balloons again
        if (this.titleBalloons) {
            this.titleBalloons.classList.remove('float-away');
        }
        
        // Reset heating meter
        this.heatingMeterFill.style.width = '0%';
        this.heatingMeterCount.textContent = '0';
        this.heatingMeterFill.classList.remove('on-fire');
        this.heatingMeterFire.classList.remove('active', 'mega-fire');
        
        // Clear whiteboard states
        this.whiteboardStates = {};
        if (this.whiteboardCtx) {
            this.whiteboardCtx.clearRect(0, 0, this.whiteboardCanvas.width, this.whiteboardCanvas.height);
        }
        
        // Update answer interface based on current mode
        this.updateAnswerInterface();
        
        // Generate new questions
        this.generateQuestions();
        this.displayQuestion();
    }
    
    // Wallet and Store methods
    updateWalletDisplay() {
        const balance = this.walletManager.getBalance();
        this.walletAmountEl.textContent = balance;
        this.storeWalletAmount.textContent = balance;
    }
    
    updateCollectionCount() {
        this.headerCollectionCount.textContent = this.storeManager.getOwnedCount();
    }
    
    showCoinAnimation(amount) {
        const walletEl = document.getElementById('wallet-display');
        const rect = walletEl.getBoundingClientRect();
        
        const floater = document.createElement('div');
        floater.className = 'coin-float-animation';
        floater.textContent = `+${amount} 🪙`;
        floater.style.left = rect.left + rect.width / 2 + 'px';
        floater.style.top = rect.top + 'px';
        document.body.appendChild(floater);
        
        // Bounce the wallet
        walletEl.classList.remove('coin-bounce');
        void walletEl.offsetWidth;
        walletEl.classList.add('coin-bounce');
        
        setTimeout(() => floater.remove(), 1200);
    }
    
    playChaChingSound() {
        this.initAudioContext();
        const ctx = this.audioContext;
        
        const notes = [
            { freq: 1200, start: 0, duration: 0.08 },
            { freq: 1500, start: 0.08, duration: 0.08 },
            { freq: 1800, start: 0.16, duration: 0.12 }
        ];
        
        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start);
            osc.type = 'triangle';
            gain.gain.setValueAtTime(0.15, ctx.currentTime + note.start);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.start + note.duration);
            osc.start(ctx.currentTime + note.start);
            osc.stop(ctx.currentTime + note.start + note.duration);
        });
    }
    
    showStore() {
        this.updateWalletDisplay();
        this.renderStoreItems();
        this.storeScreen.classList.add('show');
    }
    
    hideStore() {
        this.storeScreen.classList.remove('show');
    }
    
    showCollection() {
        this.renderCollection();
        this.collectionScreen.classList.add('show');
    }
    
    hideCollection() {
        this.collectionScreen.classList.remove('show');
    }
    
    renderStoreItems() {
        this.storeGrid.innerHTML = '';
        const tiers = ['cheap', 'medium', 'expensive', 'legendary', 'epic', 'unreal', 'secret'];
        const tierLabels = { cheap: '🟢 Common', medium: '🔵 Cool', expensive: '🟣 Premium', legendary: '🟡 Legendary', epic: '🔶 Epic', unreal: '💜 Unreal', secret: '🌑 Secret' };
        
        tiers.forEach(tier => {
            const tierHeader = document.createElement('div');
            tierHeader.className = 'store-tier-header tier-' + tier;
            const reward = FeatureTogglesManager.REWARDS[tier];
            const tierComplete = this.storeManager.isTierComplete(tier);
            const tierItems = this.storeManager.items.filter(item => item.tier === tier);
            const ownedInTier = tierItems.filter(item => this.storeManager.isOwned(item.id)).length;
            let headerText = tierLabels[tier];
            if (reward) {
                headerText += tierComplete ? ` ✅ ${reward.emoji} ${reward.name}` : ` (${ownedInTier}/${tierItems.length}) → ${reward.emoji} ${reward.name}`;
            }
            tierHeader.textContent = headerText;
            this.storeGrid.appendChild(tierHeader);
            
            tierItems.forEach(item => {
                const card = document.createElement('div');
                const owned = this.storeManager.isOwned(item.id);
                const canAfford = this.walletManager.getBalance() >= item.price;
                const isSecret = tier === 'secret';
                card.className = 'store-item' + (owned ? ' owned' : '') + (!canAfford && !owned ? ' cant-afford' : '');
                card.setAttribute('data-tier', tier);
                
                // For secret tier items that are not owned, hide emoji and name
                const displayEmoji = (isSecret && !owned) ? '❓' : item.emoji;
                const displayName = (isSecret && !owned) ? '???' : item.name;
                
                card.innerHTML = `
                    <div class="store-item-emoji">${displayEmoji}</div>
                    <div class="store-item-name">${displayName}</div>
                    <div class="store-item-price">${item.price} 🪙</div>
                    ${owned
                        ? '<div class="store-item-owned">Owned ✓</div>'
                        : `<button class="store-buy-btn" ${!canAfford ? 'disabled title="Not enough coins!"' : ''} aria-label="${(isSecret ? 'Secret Item' : item.name)}${!canAfford ? ' - Not enough coins' : ''}">${canAfford ? 'Buy' : '🔒'}</button>`
                    }
                `;
                
                if (!owned && canAfford) {
                    card.querySelector('.store-buy-btn').addEventListener('click', () => this.purchaseItem(item));
                }
                
                this.storeGrid.appendChild(card);
            });
        });
    }
    
    purchaseItem(item) {
        if (this.walletManager.spendCoins(item.price)) {
            this.storeManager.purchase(item.id);
            this.updateWalletDisplay();
            this.updateCollectionCount();
            this.renderStoreItems();
            this.showPurchaseCelebration(item.emoji);
            
            // Check if this purchase completed a tier with a reward
            const reward = FeatureTogglesManager.REWARDS[item.tier];
            if (reward && this.storeManager.isTierComplete(item.tier)) {
                this.featureToggles.setToggle(reward.id, true);
                this.applyFeatureToggles();
                this.showTierCompleteCelebration(item.tier, reward);
            }
        }
    }
    
    showTierCompleteCelebration(tier, reward) {
        const tierLabels = { cheap: 'Common', medium: 'Cool', expensive: 'Premium', legendary: 'Legendary' };
        const overlay = document.createElement('div');
        overlay.className = 'tier-complete-popup';
        overlay.innerHTML = `
            <div class="tier-complete-content">
                <div class="tier-complete-emoji">🏆</div>
                <div class="tier-complete-title">Set Complete!</div>
                <div class="tier-complete-desc">You completed all ${tierLabels[tier]} items!</div>
                <div class="tier-complete-reward">${reward.emoji} ${reward.name} Unlocked!</div>
                <button class="tier-complete-close">Awesome! 🎉</button>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('.tier-complete-close').addEventListener('click', () => overlay.remove());
        setTimeout(() => { if (overlay.parentElement) overlay.remove(); }, 5000);
    }
    
    showPurchaseCelebration(emoji) {
        // Burst of the purchased emoji
        for (let i = 0; i < 12; i++) {
            const el = document.createElement('div');
            el.className = 'purchase-celebration';
            el.textContent = emoji;
            el.style.left = '50%';
            el.style.top = '50%';
            el.style.setProperty('--angle', (i * 30) + 'deg');
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 1200);
        }
    }
    
    renderCollection() {
        this.collectionGrid.innerHTML = '';
        const owned = this.storeManager.getOwnedItems();
        this.collectionProgress.textContent = `${this.storeManager.getOwnedCount()}/${this.storeManager.getTotalCount()} collected`;
        
        // Render tier completion trophies at the top
        const rewardTiers = Object.entries(FeatureTogglesManager.REWARDS);
        const hasAnyReward = rewardTiers.some(([tier]) => this.storeManager.isTierComplete(tier));
        
        if (hasAnyReward || rewardTiers.length > 0) {
            const trophySection = document.createElement('div');
            trophySection.className = 'collection-trophy-section';
            trophySection.innerHTML = '<div class="collection-trophy-header">🏆 Set Completion Rewards</div>';
            
            const tierLabels = { cheap: 'Common', medium: 'Cool', expensive: 'Premium', legendary: 'Legendary' };
            
            rewardTiers.forEach(([tier, reward]) => {
                const unlocked = this.storeManager.isTierComplete(tier);
                const enabled = this.featureToggles.isEnabled(reward.id);
                const tierItems = this.storeManager.items.filter(i => i.tier === tier);
                const ownedInTier = tierItems.filter(i => this.storeManager.isOwned(i.id)).length;
                const hasPhoto = reward.id === 'photoBackground' && localStorage.getItem('mathGamePhotoBackground');
                
                const card = document.createElement('div');
                card.className = 'collection-trophy-card' + (unlocked ? ' unlocked' : ' locked');
                card.innerHTML = `
                    <div class="trophy-card-emoji">${unlocked ? reward.emoji : '🔒'}</div>
                    <div class="trophy-card-name">${reward.name}</div>
                    <div class="trophy-card-desc">${reward.description}</div>
                    <div class="trophy-card-progress">${ownedInTier}/${tierItems.length} ${tierLabels[tier]}</div>
                    ${unlocked ? `
                        <label class="trophy-toggle-label">
                            <input type="checkbox" class="trophy-toggle" data-feature="${reward.id}" ${enabled ? 'checked' : ''}>
                            <span class="trophy-toggle-slider"></span>
                            <span class="trophy-toggle-text">${enabled ? 'ON' : 'OFF'}</span>
                        </label>
                        ${reward.id === 'photoBackground' ? `<button class="photo-bg-camera-btn">${hasPhoto ? '🔄 New Photo' : '📷 Take Photo'}</button>` : ''}
                    ` : ''}
                `;
                trophySection.appendChild(card);
            });
            
            this.collectionGrid.appendChild(trophySection);
            
            // Attach toggle event listeners
            trophySection.querySelectorAll('.trophy-toggle').forEach(toggle => {
                toggle.addEventListener('change', (e) => {
                    const featureId = e.target.dataset.feature;
                    const enabled = e.target.checked;
                    this.featureToggles.setToggle(featureId, enabled);
                    e.target.parentElement.querySelector('.trophy-toggle-text').textContent = enabled ? 'ON' : 'OFF';
                    this.applyFeatureToggles();
                });
            });
            
            // Attach photo background camera button listener
            const cameraBtn = trophySection.querySelector('.photo-bg-camera-btn');
            if (cameraBtn) {
                cameraBtn.addEventListener('click', () => this.openPhotoCapture());
            }
        }
        
        if (owned.length === 0) {
            const noItems = document.createElement('div');
            noItems.className = 'no-stats';
            noItems.textContent = 'No items yet! Visit the store to buy some. 🏪';
            this.collectionGrid.appendChild(noItems);
            return;
        }
        
        // Section header for collected items
        const itemsHeader = document.createElement('div');
        itemsHeader.className = 'collection-items-header';
        itemsHeader.textContent = '🎪 Your Collection';
        this.collectionGrid.appendChild(itemsHeader);
        
        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'collection-items-grid';
        owned.forEach(item => {
            const el = document.createElement('div');
            el.className = 'collection-item';
            el.innerHTML = `<span class="collection-emoji">${item.emoji}</span><span class="collection-name">${item.name}</span>`;
            itemsGrid.appendChild(el);
        });
        this.collectionGrid.appendChild(itemsGrid);
    }
    
    applyFeatureToggles() {
        // Fun Background
        if (this.featureToggles.isEnabled('funBackground') && this.featureToggles.isUnlocked('funBackground', this.storeManager)) {
            document.body.classList.add('fun-background');
        } else {
            document.body.classList.remove('fun-background');
        }
        
        // Extra Pen Colors
        this.updateWhiteboardColorPicker();
        
        // Funny Hats
        if (this.featureToggles.isEnabled('funnyHats') && this.featureToggles.isUnlocked('funnyHats', this.storeManager)) {
            document.querySelectorAll('.character-face').forEach(face => face.classList.add('has-hat'));
        } else {
            document.querySelectorAll('.character-face').forEach(face => face.classList.remove('has-hat'));
        }
        
        // Photo Background
        this.applyPhotoBackground();
    }
    
    applyPhotoBackground() {
        const enabled = this.featureToggles.isEnabled('photoBackground') && this.featureToggles.isUnlocked('photoBackground', this.storeManager);
        let bgEl = document.getElementById('photo-background');
        let shimmerEl = document.getElementById('photo-background-shimmer');
        
        if (enabled) {
            const photoData = localStorage.getItem('mathGamePhotoBackground');
            if (photoData) {
                if (!bgEl) {
                    bgEl = document.createElement('div');
                    bgEl.id = 'photo-background';
                    document.body.insertBefore(bgEl, document.body.firstChild);
                }
                if (!shimmerEl) {
                    shimmerEl = document.createElement('div');
                    shimmerEl.id = 'photo-background-shimmer';
                    document.body.insertBefore(shimmerEl, bgEl.nextSibling);
                }
                bgEl.style.backgroundImage = `url(${photoData})`;
                bgEl.style.display = 'block';
                shimmerEl.style.display = 'block';
                document.body.classList.add('has-photo-background');
            }
        } else {
            if (bgEl) bgEl.style.display = 'none';
            if (shimmerEl) shimmerEl.style.display = 'none';
            document.body.classList.remove('has-photo-background');
        }
    }
    
    openPhotoCapture() {
        // Create camera capture overlay
        const overlay = document.createElement('div');
        overlay.className = 'photo-capture-overlay';
        overlay.innerHTML = `
            <div class="photo-capture-content">
                <div class="photo-capture-title">📸 Take a Photo</div>
                <div class="photo-capture-preview">
                    <video class="photo-capture-video" autoplay playsinline></video>
                    <canvas class="photo-capture-canvas"></canvas>
                </div>
                <div class="photo-capture-buttons">
                    <button class="photo-capture-btn photo-capture-snap">📷 Snap!</button>
                    <button class="photo-capture-btn photo-capture-retake" style="display:none;">🔄 Retake</button>
                    <button class="photo-capture-btn photo-capture-use" style="display:none;">✅ Use This!</button>
                    <button class="photo-capture-btn photo-capture-cancel">❌ Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        const video = overlay.querySelector('.photo-capture-video');
        const canvas = overlay.querySelector('.photo-capture-canvas');
        const snapBtn = overlay.querySelector('.photo-capture-snap');
        const retakeBtn = overlay.querySelector('.photo-capture-retake');
        const useBtn = overlay.querySelector('.photo-capture-use');
        const cancelBtn = overlay.querySelector('.photo-capture-cancel');
        let stream = null;
        
        const startCamera = () => {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
                .then(s => {
                    stream = s;
                    video.srcObject = stream;
                })
                .catch(() => {
                    overlay.querySelector('.photo-capture-title').textContent = '⚠️ Camera not available. Please allow camera access in your browser settings.';
                    snapBtn.style.display = 'none';
                });
        };
        
        const stopCamera = () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
        };
        
        const cleanup = () => {
            stopCamera();
            overlay.remove();
        };
        
        snapBtn.addEventListener('click', () => {
            // Scale down large images to keep localStorage usage reasonable
            const maxDim = 1280;
            let w = video.videoWidth;
            let h = video.videoHeight;
            if (w > maxDim || h > maxDim) {
                const scale = maxDim / Math.max(w, h);
                w = Math.round(w * scale);
                h = Math.round(h * scale);
            }
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(video, 0, 0, w, h);
            video.style.display = 'none';
            canvas.style.display = 'block';
            snapBtn.style.display = 'none';
            retakeBtn.style.display = 'inline-block';
            useBtn.style.display = 'inline-block';
            stopCamera();
        });
        
        retakeBtn.addEventListener('click', () => {
            video.style.display = 'block';
            canvas.style.display = 'none';
            snapBtn.style.display = 'inline-block';
            retakeBtn.style.display = 'none';
            useBtn.style.display = 'none';
            startCamera();
        });
        
        useBtn.addEventListener('click', () => {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            try {
                localStorage.setItem('mathGamePhotoBackground', dataUrl);
            } catch (e) {
                overlay.querySelector('.photo-capture-title').textContent = '⚠️ Photo too large to save. Try a simpler scene!';
                return;
            }
            cleanup();
            this.applyPhotoBackground();
        });
        
        cancelBtn.addEventListener('click', cleanup);
        
        startCamera();
    }
    
    updateWhiteboardColorPicker() {
        let picker = document.getElementById('whiteboard-color-picker');
        const unlocked = this.featureToggles.isEnabled('extraPenColors') && this.featureToggles.isUnlocked('extraPenColors', this.storeManager);
        
        if (!unlocked) {
            if (picker) picker.style.display = 'none';
            this.currentPenColor = '#333';
            if (this.whiteboardCtx) this.whiteboardCtx.strokeStyle = '#333';
            return;
        }
        
        if (!picker) {
            picker = document.createElement('div');
            picker.id = 'whiteboard-color-picker';
            picker.className = 'whiteboard-color-picker';
            const colors = [
                { color: '#333', label: 'Black' },
                { color: '#e74c3c', label: 'Red' },
                { color: '#3498db', label: 'Blue' },
                { color: '#2ecc71', label: 'Green' },
                { color: '#f39c12', label: 'Orange' },
                { color: '#9b59b6', label: 'Purple' }
            ];
            colors.forEach(c => {
                const btn = document.createElement('button');
                btn.className = 'color-picker-btn' + (c.color === '#333' ? ' active' : '');
                btn.style.backgroundColor = c.color;
                btn.title = c.label;
                btn.setAttribute('aria-label', c.label + ' pen');
                btn.dataset.color = c.color;
                btn.addEventListener('click', () => {
                    picker.querySelectorAll('.color-picker-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.currentPenColor = c.color;
                    this.whiteboardCtx.strokeStyle = c.color;
                });
                picker.appendChild(btn);
            });
            const container = document.querySelector('.whiteboard-container');
            container.insertBefore(picker, container.querySelector('.whiteboard-canvas'));
        }
        
        picker.style.display = 'flex';
    }
    
    // Whiteboard methods
    initWhiteboard() {
        this.whiteboardCtx = this.whiteboardCanvas.getContext('2d');
        this.whiteboardCtx.lineWidth = 12;
        this.whiteboardCtx.lineCap = 'round';
        this.whiteboardCtx.strokeStyle = '#333';
        this.currentPenColor = '#333';
        
        // Mouse events
        this.whiteboardCanvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.whiteboardCanvas.addEventListener('mousemove', (e) => this.draw(e));
        this.whiteboardCanvas.addEventListener('mouseup', () => this.stopDrawing());
        this.whiteboardCanvas.addEventListener('mouseleave', () => this.stopDrawing());
        
        // Touch events
        this.whiteboardCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.whiteboardCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.whiteboardCanvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
        
        // Resize canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => {
            if (this.whiteboardOverlay.classList.contains('active')) {
                this.resizeCanvas();
            }
        });
    }
    
    resizeCanvas() {
        // Save current drawing
        const imageData = this.whiteboardCanvas.width > 0 && this.whiteboardCanvas.height > 0 ? 
            this.whiteboardCtx.getImageData(0, 0, this.whiteboardCanvas.width, this.whiteboardCanvas.height) : null;
        
        // Resize canvas to match displayed size
        const rect = this.whiteboardCanvas.getBoundingClientRect();
        const oldWidth = this.whiteboardCanvas.width;
        const oldHeight = this.whiteboardCanvas.height;
        this.whiteboardCanvas.width = rect.width;
        this.whiteboardCanvas.height = rect.height;
        
        // Restore context settings
        this.whiteboardCtx.lineWidth = 12;
        this.whiteboardCtx.lineCap = 'round';
        this.whiteboardCtx.strokeStyle = this.currentPenColor || '#333';
        
        // Restore drawing if exists and dimensions match
        if (imageData && oldWidth === rect.width && oldHeight === rect.height) {
            this.whiteboardCtx.putImageData(imageData, 0, 0);
        }
    }
    
    getCoordinates(e) {
        const rect = this.whiteboardCanvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.whiteboardCanvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.whiteboardCanvas.height / rect.height)
        };
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const coords = this.getCoordinates(e);
        this.whiteboardCtx.beginPath();
        this.whiteboardCtx.moveTo(coords.x, coords.y);
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const coords = this.getCoordinates(e);
        this.whiteboardCtx.lineTo(coords.x, coords.y);
        this.whiteboardCtx.stroke();
    }
    
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            // Save the current whiteboard state for this question
            this.saveWhiteboardState();
        }
    }
    
    saveWhiteboardState() {
        const imageData = this.whiteboardCtx.getImageData(0, 0, this.whiteboardCanvas.width, this.whiteboardCanvas.height);
        this.whiteboardStates[this.currentQuestion] = imageData;
    }
    
    restoreWhiteboardState() {
        const savedState = this.whiteboardStates[this.currentQuestion];
        if (savedState) {
            // Only restore if canvas dimensions match saved image data
            if (savedState.width === this.whiteboardCanvas.width && 
                savedState.height === this.whiteboardCanvas.height) {
                this.whiteboardCtx.putImageData(savedState, 0, 0);
            }
            // If dimensions don't match, the saved state becomes invalid and won't be restored
        }
    }
    
    showWhiteboard() {
        // Update whiteboard with current question and answers
        const { question } = this.questions[this.currentQuestion];
        this.whiteboardQuestion.textContent = question;
        
        // Get current answer options from the answer circles
        const answerTexts = Array.from(this.answerCircles).map(circle => 
            circle.querySelector('.answer-text').textContent
        );
        
        // Update whiteboard answers display
        this.whiteboardAnswers.innerHTML = answerTexts.map((text, index) => 
            `<span class="whiteboard-answer" data-answer-index="${index}">${text}</span>`
        ).join('');

        // Add click handlers to whiteboard answers
        this.whiteboardAnswers.querySelectorAll('.whiteboard-answer').forEach(span => {
            span.addEventListener('click', () => {
                const answerIndex = parseInt(span.dataset.answerIndex);
                this.hideWhiteboard();
                this.checkAnswer(answerIndex);
            });
        });
        
        // Show overlay
        this.whiteboardOverlay.classList.add('active');
        this.updateWhiteboardColorPicker();
        
        // Wait for overlay animation to complete before resizing canvas
        const CANVAS_RENDER_DELAY = 50; // Allow time for CSS animation and DOM rendering
        setTimeout(() => {
            this.resizeCanvas();
            this.restoreWhiteboardState();
        }, CANVAS_RENDER_DELAY);
    }
    
    hideWhiteboard() {
        this.saveWhiteboardState();
        this.whiteboardOverlay.classList.remove('active');
    }
    
    clearWhiteboard() {
        this.whiteboardCtx.clearRect(0, 0, this.whiteboardCanvas.width, this.whiteboardCanvas.height);
        this.saveWhiteboardState();
    }
}

// Wallet Manager Class
class WalletManager {
    constructor() {
        this.storageKey = 'mathGameWallet';
        this.balance = parseInt(localStorage.getItem(this.storageKey), 10) || 0;
    }

    getBalance() {
        return this.balance;
    }

    addCoins(amount) {
        this.balance += amount;
        localStorage.setItem(this.storageKey, this.balance);
        return this.balance;
    }

    spendCoins(amount) {
        if (amount > this.balance) return false;
        this.balance -= amount;
        localStorage.setItem(this.storageKey, this.balance);
        return true;
    }
}

// Store Manager Class
class StoreManager {
    constructor() {
        this.storageKey = 'mathGameOwnedItems';
        this.ownedItems = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        this.items = [
            // Cheap (5-15 coins)
            { id: 'wacky', emoji: '🤪', name: 'Party Brain', price: 5, tier: 'cheap' },
            { id: 'cool', emoji: '😎', name: 'Cool Dude', price: 5, tier: 'cheap' },
            { id: 'party', emoji: '🥳', name: 'Party Animal', price: 8, tier: 'cheap' },
            { id: 'nerd', emoji: '🤓', name: 'Smarty Pants', price: 8, tier: 'cheap' },
            { id: 'monocle', emoji: '🧐', name: 'Fancy Thinker', price: 10, tier: 'cheap' },
            { id: 'poop', emoji: '💩', name: 'Silly Pile', price: 10, tier: 'cheap' },
            { id: 'alien', emoji: '👽', name: 'Space Buddy', price: 12, tier: 'cheap' },
            { id: 'robot', emoji: '🤖', name: 'Robo Friend', price: 12, tier: 'cheap' },
            { id: 'invader', emoji: '👾', name: 'Pixel Pal', price: 14, tier: 'cheap' },
            { id: 'pumpkin', emoji: '🎃', name: 'Spooky Jack', price: 15, tier: 'cheap' },
            // Medium (20-40 coins)
            { id: 'bronto', emoji: '🦕', name: 'Dino Friend', price: 20, tier: 'medium' },
            { id: 'trex', emoji: '🦖', name: 'T-Rex King', price: 22, tier: 'medium' },
            { id: 'dragon', emoji: '🐉', name: 'Fire Breather', price: 25, tier: 'medium' },
            { id: 'squid', emoji: '🦑', name: 'Ink Master', price: 25, tier: 'medium' },
            { id: 'shark', emoji: '🦈', name: 'Fin Boss', price: 28, tier: 'medium' },
            { id: 'octopus', emoji: '🐙', name: 'Eight Arms', price: 28, tier: 'medium' },
            { id: 'flamingo', emoji: '🦩', name: 'Pink Dancer', price: 30, tier: 'medium' },
            { id: 'peacock', emoji: '🦚', name: 'Fancy Feathers', price: 32, tier: 'medium' },
            { id: 'dragon2', emoji: '🐲', name: 'Lucky Dragon', price: 35, tier: 'medium' },
            { id: 'mermaid', emoji: '🧜‍♀️', name: 'Sea Princess', price: 40, tier: 'medium' },
            // Expensive (50-80 coins)
            { id: 'crown', emoji: '👑', name: 'Royal Crown', price: 50, tier: 'expensive' },
            { id: 'diamond', emoji: '💎', name: 'Sparkle Gem', price: 55, tier: 'expensive' },
            { id: 'trophy', emoji: '🏆', name: 'Gold Trophy', price: 55, tier: 'expensive' },
            { id: 'rainbow', emoji: '🌈', name: 'Rainbow Road', price: 60, tier: 'expensive' },
            { id: 'guitar', emoji: '🎸', name: 'Rock Star', price: 60, tier: 'expensive' },
            { id: 'rocket', emoji: '🚀', name: 'Blast Off', price: 65, tier: 'expensive' },
            { id: 'ufo', emoji: '🛸', name: 'UFO Rider', price: 70, tier: 'expensive' },
            { id: 'lightning', emoji: '⚡', name: 'Thunder Bolt', price: 70, tier: 'expensive' },
            { id: 'crystal', emoji: '🔮', name: 'Magic Ball', price: 75, tier: 'expensive' },
            { id: 'nazar', emoji: '🧿', name: 'Lucky Eye', price: 80, tier: 'expensive' },
            // Legendary (100+ coins)
            { id: 'galaxy', emoji: '🌌', name: 'Galaxy Brain', price: 100, tier: 'legendary' },
            { id: 'fireworks', emoji: '🎆', name: 'Sky Boomer', price: 110, tier: 'legendary' },
            { id: 'castle', emoji: '🏰', name: 'Dream Castle', price: 120, tier: 'legendary' },
            { id: 'liberty', emoji: '🗽', name: 'Lady Liberty', price: 130, tier: 'legendary' },
            { id: 'masks', emoji: '🎭', name: 'Drama Star', price: 140, tier: 'legendary' },
            { id: 'circus', emoji: '🎪', name: 'Big Top', price: 150, tier: 'legendary' },
            { id: 'carousel', emoji: '🎠', name: 'Magic Ride', price: 160, tier: 'legendary' },
            { id: 'dizzy', emoji: '💫', name: 'Dizzy Star', price: 170, tier: 'legendary' },
            { id: 'comet', emoji: '☄️', name: 'Comet Chaser', price: 180, tier: 'legendary' },
            { id: 'shooting', emoji: '🌠', name: 'Wish Maker', price: 200, tier: 'legendary' },
            // Epic (250-400 coins)
            { id: 'epic_unicorn', emoji: '🦄', name: 'Epic Unicorn', price: 250, tier: 'epic' },
            { id: 'epic_phoenix', emoji: '🔥', name: 'Phoenix Fire', price: 280, tier: 'epic' },
            { id: 'epic_wizard', emoji: '🧙', name: 'Grand Wizard', price: 300, tier: 'epic' },
            { id: 'epic_dragon', emoji: '🐲', name: 'Dragon King', price: 320, tier: 'epic' },
            { id: 'epic_sun', emoji: '☀️', name: 'Solar Power', price: 350, tier: 'epic' },
            { id: 'epic_moon', emoji: '🌙', name: 'Lunar Magic', price: 380, tier: 'epic' },
            { id: 'epic_star', emoji: '⭐', name: 'Star Power', price: 400, tier: 'epic' },
            // Unreal (500-800 coins)
            { id: 'unreal_infinity', emoji: '♾️', name: 'Infinity Mind', price: 500, tier: 'unreal' },
            { id: 'unreal_atom', emoji: '⚛️', name: 'Atomic Brain', price: 550, tier: 'unreal' },
            { id: 'unreal_dna', emoji: '🧬', name: 'DNA Master', price: 600, tier: 'unreal' },
            { id: 'unreal_black_hole', emoji: '🕳️', name: 'Black Hole', price: 650, tier: 'unreal' },
            { id: 'unreal_telescope', emoji: '🔭', name: 'Star Gazer', price: 700, tier: 'unreal' },
            { id: 'unreal_satellite', emoji: '🛰️', name: 'Space Station', price: 750, tier: 'unreal' },
            { id: 'unreal_cosmos', emoji: '🌌', name: 'Cosmos Lord', price: 800, tier: 'unreal' },
            // Secret (1000+ coins)
            { id: 'precision_master', emoji: '🎯', name: 'Precision Master', price: 1000, tier: 'secret' },
            { id: 'perfect_score', emoji: '💯', name: 'Perfect Score', price: 1200, tier: 'secret' },
            { id: 'ultimate_star', emoji: '🌟', name: 'Ultimate Star', price: 1500, tier: 'secret' },
            { id: 'all_seeing_eye', emoji: '👁️', name: 'All Seeing Eye', price: 2000, tier: 'secret' },
            { id: 'master_artist', emoji: '🎨', name: 'Master Artist', price: 2500, tier: 'secret' },
        ];
    }

    isOwned(itemId) {
        return this.ownedItems.includes(itemId);
    }

    purchase(itemId) {
        if (!this.isOwned(itemId)) {
            this.ownedItems.push(itemId);
            localStorage.setItem(this.storageKey, JSON.stringify(this.ownedItems));
            return true;
        }
        return false;
    }

    getOwnedCount() {
        return this.ownedItems.length;
    }

    getTotalCount() {
        return this.items.length;
    }

    getOwnedItems() {
        return this.items.filter(item => this.isOwned(item.id));
    }

    isTierComplete(tier) {
        const tierItems = this.items.filter(item => item.tier === tier);
        return tierItems.length > 0 && tierItems.every(item => this.isOwned(item.id));
    }

    getCompletedTiers() {
        const tiers = ['cheap', 'medium', 'expensive', 'legendary', 'epic', 'unreal', 'secret'];
        return tiers.filter(tier => this.isTierComplete(tier));
    }
}

// Feature Toggles Manager Class
class FeatureTogglesManager {
    constructor() {
        this.storageKey = 'mathGameFeatureToggles';
        this.toggles = JSON.parse(localStorage.getItem(this.storageKey)) || {};
    }

    // Rewards: cheap=funBackground, medium=extraPenColors, expensive=funnyHats, legendary=photoBackground
    static REWARDS = {
        cheap: { id: 'funBackground', name: 'Fun Background', emoji: '🌈', trophy: '🏆', description: 'Complete all Common items' },
        medium: { id: 'extraPenColors', name: 'Extra Pen Colors', emoji: '🖊️', trophy: '🏆', description: 'Complete all Cool items' },
        expensive: { id: 'funnyHats', name: 'Funny Hats', emoji: '🎩', trophy: '🏆', description: 'Complete all Premium items' },
        legendary: { id: 'photoBackground', name: 'Photo Background', emoji: '📸', trophy: '🏆', description: 'Complete all Legendary items' }
    };

    isEnabled(featureId) {
        return this.toggles[featureId] === true;
    }

    setToggle(featureId, enabled) {
        this.toggles[featureId] = enabled;
        localStorage.setItem(this.storageKey, JSON.stringify(this.toggles));
    }

    isUnlocked(featureId, storeManager) {
        for (const [tier, reward] of Object.entries(FeatureTogglesManager.REWARDS)) {
            if (reward.id === featureId) {
                return storeManager.isTierComplete(tier);
            }
        }
        return false;
    }
}

// Statistics Manager Class
class StatisticsManager {
    constructor() {
        this.storageKey = 'mathGameStats';
        this.scoresKey = 'mathGameScores';
        this.loadStats();
    }
    
    loadStats() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.stats = JSON.parse(stored);
        } else {
            this.stats = {};
        }
        
        const scoresStored = localStorage.getItem(this.scoresKey);
        if (scoresStored) {
            this.scores = JSON.parse(scoresStored);
        } else {
            this.scores = [];
        }
    }
    
    saveStats() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.stats));
        localStorage.setItem(this.scoresKey, JSON.stringify(this.scores));
    }
    
    recordAnswer(problem, isCorrect) {
        if (!this.stats[problem]) {
            this.stats[problem] = {
                correct: 0,
                incorrect: 0,
                total: 0
            };
        }
        
        this.stats[problem].total++;
        if (isCorrect) {
            this.stats[problem].correct++;
        } else {
            this.stats[problem].incorrect++;
        }
        
        this.saveStats();
    }
    
    recordGameScore(score, totalQuestions) {
        const timestamp = Date.now();
        this.scores.push({
            score,
            totalQuestions,
            timestamp,
            date: new Date(timestamp).toLocaleDateString()
        });
        
        // Keep array at maximum of 20 games
        if (this.scores.length > 20) {
            this.scores = this.scores.slice(-20);
        }
        
        this.saveStats();
    }
    
    getStatistics() {
        const problems = Object.keys(this.stats).map(problem => ({
            problem,
            correct: this.stats[problem].correct,
            incorrect: this.stats[problem].incorrect,
            total: this.stats[problem].total
        }));
        
        // Sort by most missed
        const mostMissed = [...problems]
            .filter(p => p.incorrect > 0)
            .sort((a, b) => b.incorrect - a.incorrect);
        
        // Sort by most correct
        const mostCorrect = [...problems]
            .filter(p => p.correct > 0)
            .sort((a, b) => b.correct - a.correct);
        
        // Calculate totals
        const totalAttempts = problems.reduce((sum, p) => sum + p.total, 0);
        const totalCorrect = problems.reduce((sum, p) => sum + p.correct, 0);
        
        return {
            mostMissed,
            mostCorrect,
            totalAttempts,
            totalCorrect,
            scores: this.scores
        };
    }
    
    clearAll() {
        this.stats = {};
        this.scores = [];
        this.saveStats();
    }
}

// Set --app-height CSS variable for iOS Safari viewport fix
function setAppHeight() {
    document.documentElement.style.setProperty('--app-height', window.innerHeight + 'px');
}
window.addEventListener('resize', setAppHeight);
setAppHeight();

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MathGame();
});
