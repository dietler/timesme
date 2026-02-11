class MathGame {
    constructor() {
        this.score = 0;
        this.currentQuestion = 0;
        this.totalQuestions = 20;
        this.questions = [];
        this.currentCorrectAnswer = 0;
        
        // DOM elements
        this.scoreElement = document.getElementById('score');
        this.progressElement = document.getElementById('progress');
        this.questionElement = document.getElementById('question');
        this.answerCircles = document.querySelectorAll('.answer-circle');
        this.resultsScreen = document.getElementById('results-screen');
        this.finalScoreElement = document.getElementById('final-score');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.feedbackOverlay = document.getElementById('feedback-overlay');
        
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
        
        // Disable clicking during animation
        this.answerCircles.forEach(circle => {
            circle.style.pointerEvents = 'none';
        });
        
        if (selectedAnswer === this.currentCorrectAnswer) {
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
    
    resetGame() {
        this.score = 0;
        this.currentQuestion = 0;
        this.resultsScreen.classList.remove('show');
        this.scoreElement.textContent = '0';
        
        // Generate new questions
        this.generateQuestions();
        this.displayQuestion();
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MathGame();
});
