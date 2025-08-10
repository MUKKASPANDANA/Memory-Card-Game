class MemoryGame {
    constructor() {
        this.initializeElements();
        this.initializeGameState();
        this.initializeThemes();
        this.initializeEventListeners();
        this.loadSettings();
        this.startNewGame();
    }
    
    initializeElements() {
        this.gameBoard = document.getElementById('game-board');
        this.movesElement = document.getElementById('moves');
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.streakElement = document.getElementById('streak');
        this.difficultySelect = document.getElementById('difficulty');
        this.themeSelect = document.getElementById('theme');
        this.newGameButton = document.getElementById('new-game');
        this.hintButton = document.getElementById('hint-btn');
        this.pauseButton = document.getElementById('pause-btn');
        this.soundToggle = document.getElementById('sound-toggle');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        
        // Power-ups
        this.freezeTimeBtn = document.getElementById('freeze-time');
        this.peekCardsBtn = document.getElementById('peek-cards');
        
        // Modals
        this.congratulationsModal = document.getElementById('congratulations');
        this.pauseModal = document.getElementById('pause-modal');
        this.settingsModal = document.getElementById('settings-modal');
        
        // Modal buttons
        this.playAgainButton = document.getElementById('play-again');
        this.closeModalButton = document.getElementById('close-modal');
        this.resumeButton = document.getElementById('resume-game');
        this.quitButton = document.getElementById('quit-game');
        
        // Particles container
        this.particlesContainer = document.getElementById('particles');
    }
    
    initializeGameState() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.time = 0;
        this.timer = null;
        this.gameStarted = false;
        this.isPaused = false;
        this.isProcessing = false; // Add processing flag
        this.soundEnabled = true;
        this.streak = 0;
        this.bestStreak = 0;
        this.hintsUsed = 0;
        this.powerUpsUsed = {freeze: 0, peek: 0};
        this.score = 0;
        this.settings = {
            flipSpeed: 600,
            hintCost: 50
        };
        
        // Power-up cooldowns
        this.freezeTimer = null;
        this.freezeCooldown = 0;
        this.peekCooldown = 0;
        this.isFrozen = false;
    }
    
    initializeThemes() {
        this.themes = {
            emojis: ['🎯', '🎮', '🎲', '🎪', '🎨', '🎭', '🎺', '🎸', '🚀', '🛸', '🌟', '⭐', '🌙', '☀️', '🌈', '🦄', '💎', '👑', '🏆', '🎁', '🔥', '⚡', '💫', '🎈'],
            animals: ['🐶', '🐱', '🐼', '🦊', '🐸', '🐝', '🦋', '🐧', '🦁', '🐯', '🐨', '🐰', '🐷', '🐭', '🐙', '🦀', '🐠', '🐳', '🦄', '🐲', '🦉', '🐺', '🐻', '🐵'],
            fruits: ['🍎', '🍊', '🍋', '🍌', '🍇', '🍓', '🍑', '🍒', '🥝', '🍍', '🥭', '🍉', '🍈', '🥥', '🍅', '🥑', '🍆', '🥒', '🌶️', '🌽', '🥕', '🥔', '🍠', '🥜'],
            space: ['🚀', '🛸', '🌟', '⭐', '🌙', '☀️', '🪐', '🌍', '🌎', '🌏', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '☄️', '🌌', '🔭', '👨‍🚀', '👩‍🚀', '🛰️'],
            symbols: ['💎', '👑', '🏆', '🎁', '🔥', '⚡', '💫', '🎈', '🎪', '🎭', '🎨', '🎯', '🎮', '🎲', '🃏', '🎪', '🎨', '🎭', '🎺', '🎸', '🥇', '🥈', '🥉', '🏅']
        };
    }
    
    initializeEventListeners() {
        this.newGameButton.addEventListener('click', () => this.startNewGame());
        this.hintButton.addEventListener('click', () => this.useHint());
        this.pauseButton.addEventListener('click', () => this.togglePause());
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        
        // Power-ups
        this.freezeTimeBtn.addEventListener('click', () => this.useFreezeTime());
        this.peekCardsBtn.addEventListener('click', () => this.usePeekCards());
        
        // Modal buttons
        this.playAgainButton.addEventListener('click', () => {
            this.hideModal(this.congratulationsModal);
            this.startNewGame();
        });
        this.closeModalButton.addEventListener('click', () => {
    this.stopTimer(); 
    this.hideModal(this.congratulationsModal);
});

        this.resumeButton.addEventListener('click', () => this.togglePause());
        this.quitButton.addEventListener('click', () => {
            this.hideModal(this.pauseModal);
            this.startNewGame();
        });
        
        // Close modals on background click
        [this.congratulationsModal, this.pauseModal, this.settingsModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal);
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePause();
            } else if (e.code === 'KeyH') {
                this.useHint();
            } else if (e.code === 'KeyN') {
                this.startNewGame();
            }
        });
    }
    
    loadSettings() {
        // Use simple object storage instead of localStorage for artifacts environment
        this.savedSettings = this.savedSettings || {};
        this.settings = { ...this.settings, ...this.savedSettings };
    }
    
    saveSettings() {
        // Use simple object storage instead of localStorage for artifacts environment
        this.savedSettings = { ...this.settings };
    }
    
    getDifficultyConfig() {
        const configs = {
            easy: { rows: 4, cols: 4, pairs: 8 },
            medium: { rows: 4, cols: 6, pairs: 12 },
            hard: { rows: 6, cols: 6, pairs: 18 },
            expert: { rows: 6, cols: 8, pairs: 24 }
        };
        return configs[this.difficultySelect.value];
    }
    
    startNewGame() {
        this.initializeGameState();
        this.updateUI();
        this.createCards();
        this.renderCards();
        this.hideModal(this.congratulationsModal);
        this.hideModal(this.pauseModal);
    }
    
    createCards() {
        const config = this.getDifficultyConfig();
        const theme = this.themeSelect.value;
        const symbols = [...this.themes[theme]];
        
        // Shuffle and select required number of symbols
        this.shuffleArray(symbols);
        const selectedSymbols = symbols.slice(0, config.pairs);
        
        // Create pairs and shuffle
        this.cards = [];
        selectedSymbols.forEach((symbol, index) => {
            this.cards.push({ id: index * 2, symbol, matched: false });
            this.cards.push({ id: index * 2 + 1, symbol, matched: false });
        });
        
        this.shuffleArray(this.cards);
        this.totalPairs = config.pairs;
        this.updateProgress();
    }
    
    renderCards() {
        const config = this.getDifficultyConfig();
        this.gameBoard.className = `game-board ${this.difficultySelect.value}`;
        this.gameBoard.innerHTML = '';
        
        this.cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            this.gameBoard.appendChild(cardElement);
        });
    }
    
    createCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.index = index;
        
        cardDiv.innerHTML = `
            <div class="card-face card-back"></div>
            <div class="card-face card-front">${card.symbol}</div>
        `;
        
        // Add click event listener with proper binding
        const clickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.flipCard(index);
        };
        
        cardDiv.addEventListener('click', clickHandler);
        cardDiv.addEventListener('touchstart', clickHandler); // Mobile support
        
        return cardDiv;
    }
    
    flipCard(index) {
        // Prevent flipping if game is paused, already processing, or card is already flipped/matched
        if (this.isPaused || this.isProcessing || this.flippedCards.length >= 2) return;
        
        const card = this.cards[index];
        const cardElement = this.gameBoard.children[index];
        
        // Don't flip if card is already matched or currently flipped
        if (card.matched || this.flippedCards.includes(index)) return;
        
        // Start game timer on first move
        if (!this.gameStarted) {
            this.startTimer();
            this.gameStarted = true;
        }
        
        // Add flip animation
        cardElement.classList.add('flipped');
        this.flippedCards.push(index);
        this.playSound('flip');
        
        // If two cards are flipped, check for match
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.isProcessing = true; // Prevent further clicks
            this.updateUI();
            
            setTimeout(() => {
                this.checkMatch();
                this.isProcessing = false; // Allow clicks again
            }, 800); // Slightly longer delay for better UX
        }
    }
    
    checkMatch() {
        const [firstIndex, secondIndex] = this.flippedCards;
        const firstCard = this.cards[firstIndex];
        const secondCard = this.cards[secondIndex];
        
        if (firstCard.symbol === secondCard.symbol) {
            // Match found
            this.handleMatch(firstIndex, secondIndex);
        } else {
            // No match
            this.handleMismatch(firstIndex, secondIndex);
        }
        
        this.flippedCards = [];
    }
    
    handleMatch(firstIndex, secondIndex) {
        const firstElement = this.gameBoard.children[firstIndex];
        const secondElement = this.gameBoard.children[secondIndex];
        
        // Mark cards as matched
        this.cards[firstIndex].matched = true;
        this.cards[secondIndex].matched = true;
        
        firstElement.classList.add('matched');
        secondElement.classList.add('matched');
        
        this.matchedPairs++;
        this.streak++;
        this.bestStreak = Math.max(this.bestStreak, this.streak);
        
        // Calculate score
        const baseScore = 100;
        const streakBonus = this.streak * 10;
        const timeBonus = Math.max(0, 50 - Math.floor(this.time / 10));
        this.score += baseScore + streakBonus + timeBonus;
        
        this.playSound('match');
        this.createParticleEffect(firstElement);
        this.createParticleEffect(secondElement);
        
        // Check for streak milestone
        if (this.streak % 3 === 0 && this.streak > 0) {
            this.showStreakEffect();
        }
        
        this.updateUI();
        this.updateProgress();
        
        // Check win condition
        if (this.matchedPairs === this.totalPairs) {
            setTimeout(() => this.gameWon(), 500);
        }
    }
    
    handleMismatch(firstIndex, secondIndex) {
        const firstElement = this.gameBoard.children[firstIndex];
        const secondElement = this.gameBoard.children[secondIndex];
        
        // Reset streak
        this.streak = 0;
        
        // Add shake animation for failed match
        firstElement.style.animation = 'shake 0.5s ease-in-out';
        secondElement.style.animation = 'shake 0.5s ease-in-out';
        
        // Flip cards back after a delay
        setTimeout(() => {
            firstElement.classList.remove('flipped');
            secondElement.classList.remove('flipped');
            firstElement.style.animation = '';
            secondElement.style.animation = '';
        }, 1000);
        
        this.playSound('error');
        this.updateUI();
    }
    
    useHint() {
        if (this.score < this.settings.hintCost) {
            this.showNotification('Not enough points for hint!', 'error');
            return;
        }
        
        // Find unmatched cards
        const unmatchedCards = this.cards
            .map((card, index) => ({ card, index }))
            .filter(({ card }) => !card.matched);
        
        if (unmatchedCards.length < 2) return;
        
        // Find a matching pair
        for (let i = 0; i < unmatchedCards.length; i++) {
            for (let j = i + 1; j < unmatchedCards.length; j++) {
                if (unmatchedCards[i].card.symbol === unmatchedCards[j].card.symbol) {
                    const firstElement = this.gameBoard.children[unmatchedCards[i].index];
                    const secondElement = this.gameBoard.children[unmatchedCards[j].index];
                    
                    firstElement.classList.add('hint-glow');
                    secondElement.classList.add('hint-glow');
                    
                    setTimeout(() => {
                        firstElement.classList.remove('hint-glow');
                        secondElement.classList.remove('hint-glow');
                    }, 3000);
                    
                    this.score -= this.settings.hintCost;
                    this.hintsUsed++;
                    this.updateUI();
                    this.showNotification('Hint used! -50 points', 'info');
                    return;
                }
            }
        }
    }
    
    useFreezeTime() {
        if (this.freezeCooldown > 0) {
            this.showNotification('Freeze Time is on cooldown!', 'error');
            return;
        }
        
        this.isFrozen = true;
        this.freezeCooldown = 30; // 30 second cooldown
        this.powerUpsUsed.freeze++;
        
        this.freezeTimeBtn.classList.add('disabled');
        this.showNotification('Time frozen for 10 seconds!', 'success');
        
        // Freeze for 10 seconds
        setTimeout(() => {
            this.isFrozen = false;
            this.showNotification('Time unfrozen!', 'info');
        }, 10000);
        
        // Start cooldown
        this.startCooldown('freeze', this.freezeCooldown);
    }
    
    usePeekCards() {
        if (this.peekCooldown > 0) {
            this.showNotification('Peek Cards is on cooldown!', 'error');
            return;
        }
        
        this.peekCooldown = 45; // 45 second cooldown
        this.powerUpsUsed.peek++;
        
        this.peekCardsBtn.classList.add('disabled');
        this.showNotification('Peeking at all cards for 2 seconds!', 'success');
        
        // Show all cards
        const cardElements = this.gameBoard.querySelectorAll('.card');
        cardElements.forEach(card => {
            if (!card.classList.contains('matched')) {
                card.classList.add('peek');
            }
        });
        
        // Hide cards after 2 seconds
        setTimeout(() => {
            cardElements.forEach(card => {
                card.classList.remove('peek');
            });
        }, 2000);
        
        // Start cooldown
        this.startCooldown('peek', this.peekCooldown);
    }
    
    startCooldown(type, duration) {
        const cooldownElement = document.getElementById(`${type === 'freeze' ? 'freeze' : 'peek'}-cooldown`);
        const powerUpButton = type === 'freeze' ? this.freezeTimeBtn : this.peekCardsBtn;
        
        let remaining = duration;
        cooldownElement.style.width = '100%';
        
        const cooldownInterval = setInterval(() => {
            remaining--;
            const percentage = (remaining / duration) * 100;
            cooldownElement.style.width = `${percentage}%`;
            
            if (remaining <= 0) {
                clearInterval(cooldownInterval);
                cooldownElement.style.width = '0%';
                powerUpButton.classList.remove('disabled');
                
                if (type === 'freeze') {
                    this.freezeCooldown = 0;
                } else {
                    this.peekCooldown = 0;
                }
            }
        }, 1000);
    }
    
    togglePause() {
        if (!this.gameStarted) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.pauseTimer();
            this.showModal(this.pauseModal);
            this.pauseButton.textContent = '▶️ Resume';
        } else {
            this.resumeTimer();
            this.hideModal(this.pauseModal);
            this.pauseButton.textContent = '⏸️ Pause';
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggle.classList.toggle('sound-off');
        this.soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            if (!this.isPaused && !this.isFrozen) {
                this.time++;
                this.updateUI();
            }
        }, 1000);
    }
    
    pauseTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
    
    resumeTimer() {
        this.startTimer();
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateUI() {
        this.movesElement.textContent = this.moves;
        this.timerElement.textContent = this.formatTime(this.time);
        this.scoreElement.textContent = this.score;
        this.streakElement.textContent = this.streak;
        
        // Update streak display with special effect
        if (this.streak >= 3) {
            this.streakElement.parentElement.classList.add('streak-effect');
            setTimeout(() => {
                this.streakElement.parentElement.classList.remove('streak-effect');
            }, 1000);
        }
    }
    
    updateProgress() {
        const percentage = (this.matchedPairs / this.totalPairs) * 100;
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${this.matchedPairs} / ${this.totalPairs} pairs found`;
    }
    
    gameWon() {
        this.stopTimer();
        this.playSound('win');
        
        // Calculate final rating
        const rating = this.calculateRating();
        
        // Update final stats in modal
        document.getElementById('final-moves').textContent = this.moves;
        document.getElementById('final-time').textContent = this.formatTime(this.time);
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-streak').textContent = this.bestStreak;
        document.getElementById('rating').innerHTML = rating;
        
        // Show celebration particles
        this.createCelebrationEffect();
        
        setTimeout(() => {
            this.showModal(this.congratulationsModal);
        }, 1000);
    }
    
    calculateRating() {
        const config = this.getDifficultyConfig();
        const perfectMoves = config.pairs;
        const maxTime = config.pairs * 8; // 8 seconds per pair is good
        
        let stars = 1;
        
        if (this.moves <= perfectMoves * 1.5 && this.time <= maxTime * 1.2) {
            stars = 3;
        } else if (this.moves <= perfectMoves * 2 && this.time <= maxTime * 1.5) {
            stars = 2;
        }
        
        return '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    }
    
    createParticleEffect(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const particles = ['✨', '🌟', '💫', '⭐'];
        
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.transform = `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px)`;
            
            this.particlesContainer.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 3000);
        }
    }
    
    createCelebrationEffect() {
        const celebrations = ['🎉', '🎊', '✨', '🌟', '💫', '🎈'];
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.textContent = celebrations[Math.floor(Math.random() * celebrations.length)];
                particle.style.left = Math.random() * window.innerWidth + 'px';
                particle.style.top = window.innerHeight + 'px';
                particle.style.fontSize = (Math.random() * 20 + 15) + 'px';
                
                this.particlesContainer.appendChild(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 3000);
            }, i * 200);
        }
    }
    
    showStreakEffect() {
        this.showNotification(`🔥 ${this.streak} Match Streak! 🔥`, 'success');
        
        // Create streak particles
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = '🔥';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = Math.random() * window.innerHeight + 'px';
            
            this.particlesContainer.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 2000);
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#3742fa'};
            color: white;
            padding: 12px 24px;
            border-radius: 20px;
            font-weight: bold;
            z-index: 10000;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    showModal(modal) {
        modal.classList.remove('hidden');
    }
    
    hideModal(modal) {
        modal.classList.add('hidden');
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        // In a real implementation, you would have actual audio files
        // For now, we'll just create a visual feedback
        const soundMap = {
            flip: () => console.log('🔊 Flip sound'),
            match: () => console.log('🔊 Match sound'),
            win: () => console.log('🔊 Win sound'),
            error: () => console.log('🔊 Error sound')
        };
        
        soundMap[type]?.();
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// Add some additional CSS animations via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px) rotateY(5deg); }
        75% { transform: translateX(5px) rotateY(-5deg); }
    }
    
    .notification {
        font-size: 14px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    .card.processing {
        pointer-events: none;
    }
`;
document.head.appendChild(style);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();

});
