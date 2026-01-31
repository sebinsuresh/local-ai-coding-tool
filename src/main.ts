import { AppController } from './core/app-controller';

document.addEventListener('DOMContentLoaded', () => {
    try {
        new AppController();
        console.log('AI Local Coding Tool initialized');
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
});
