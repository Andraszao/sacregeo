import { GameController } from './GameController.js';

document.addEventListener('DOMContentLoaded', () => {
    const loading = document.getElementById('loading');
    
    // Initialize game when Three.js is ready
    try {
        const game = new GameController();
        loading.classList.add('hidden');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        loading.textContent = 'Failed to load game. Please refresh.';
    }
});
