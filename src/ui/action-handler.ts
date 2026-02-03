import { eventBus } from '../core/event-bus';
import { EVENTS } from '../types/events';

export class ActionHandler {
    constructor() {
        this.init();
    }

    private init(): void {
        const modifyBtn = document.getElementById('modify-btn');
        modifyBtn?.addEventListener('click', () => {
            this.trigger('openPopup');
        });

        // Global keyboard shortcut: Ctrl+I (or Cmd+I on Mac)
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
                e.preventDefault();
                this.trigger('openPopup');
            }
        });
    }

    public trigger(action: string): void {
        if (action === 'openPopup') {
            eventBus.publish(EVENTS.ACTION_OPEN_POPUP, undefined);
        }
    }
}
