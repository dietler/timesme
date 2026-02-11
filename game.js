class MathGame {
    constructor() {
        this.score = 0;
        this.currentQuestion = 0;
        this.totalQuestions = 20;
        this.questions = [];
        this.currentCorrectAnswer = 0;
        this.roundAnswers = []; // Store all answers from current round
        
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
        
        // Initialize statistics manager
        this.statsManager = new StatisticsManager();
        
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
        
        // Display first question
        this.displayQuestion();
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
        
        // Update progress
        this.progressElement.textContent = `${this.currentQuestion + 1}/20`;
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
    
    checkAnswer(selectedIndex) {
        const selectedCircle = this.answerCircles[selectedIndex];
        const selectedAnswer = parseInt(selectedCircle.querySelector('.answer-text').textContent);
        const { question, answer } = this.questions[this.currentQuestion];
        const isCorrect = selectedAnswer === this.currentCorrectAnswer;
        
        // Store the answer for review
        this.roundAnswers.push({
            question: question,
            correctAnswer: this.currentCorrectAnswer,
            userAnswer: selectedAnswer,
            isCorrect: isCorrect
        });
        
        // Update statistics
        this.statsManager.recordAnswer(question, isCorrect);
        
        // Disable clicking during animation
        this.answerCircles.forEach(circle => {
            circle.style.pointerEvents = 'none';
        });
        
        if (isCorrect) {
            // Correct answer!
            this.score++;
            selectedCircle.classList.add('correct');
            this.showFeedback('🎉', 'correct');
            this.updateScore();
            this.createConfetti();
        } else {
            // Wrong answer
            selectedCircle.classList.add('wrong');
            this.showFeedback('😕', 'wrong');
            
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
    
    hideStats() {
        this.statsScreen.classList.remove('show');
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
        this.resultsScreen.classList.remove('show');
        this.scoreElement.textContent = '0';
        
        // Generate new questions
        this.generateQuestions();
        this.displayQuestion();
    }
}

// Statistics Manager Class
class StatisticsManager {
    constructor() {
        this.storageKey = 'mathGameStats';
        this.loadStats();
    }
    
    loadStats() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.stats = JSON.parse(stored);
        } else {
            this.stats = {};
        }
    }
    
    saveStats() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.stats));
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
            totalCorrect
        };
    }
    
    clearAll() {
        this.stats = {};
        this.saveStats();
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MathGame();
});
