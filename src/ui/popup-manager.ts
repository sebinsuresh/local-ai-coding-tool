import { eventBus } from '../core/event-bus';
import { EVENTS } from '../types/events';

export class PopupManager {
    private popupEl: HTMLElement | null = null;
    private inputEl: HTMLInputElement | null = null;
    private lineDisplayEl: HTMLElement | null = null;

    constructor() {
        this.createPopup();
    }

    private createPopup(): void {
        this.popupEl = document.createElement('div');
        this.popupEl.className = 'ai-popup hidden';
        this.popupEl.innerHTML = `
            <div class="ai-popup-header" id="line-display">Line 1</div>
            <input type="text" id="ai-instruction" placeholder="What should I do?">
            <div class="ai-popup-buttons">
                <button id="ai-cancel">Cancel</button>
                <button id="ai-send">Send</button>
            </div>
        `;

        document.body.appendChild(this.popupEl);

        this.inputEl = this.popupEl.querySelector('#ai-instruction') as HTMLInputElement;
        this.lineDisplayEl = this.popupEl.querySelector('#line-display') as HTMLElement;

        this.popupEl.querySelector('#ai-send')?.addEventListener('click', () => this.handleSend());
        this.popupEl.querySelector('#ai-cancel')?.addEventListener('click', () => this.close());
        
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleSend();
            if (e.key === 'Escape') this.close();
        });
    }

    public open(lineRange: string, position: { top: number; left: number }): void {
        if (!this.popupEl || !this.inputEl || !this.lineDisplayEl) return;

        this.lineDisplayEl.textContent = lineRange;
        this.popupEl.style.top = `${position.top}px`;
        this.popupEl.style.left = `${position.left}px`;
        this.popupEl.classList.remove('hidden');
        this.inputEl.value = '';
        this.inputEl.focus();
        
        eventBus.publish(EVENTS.POPUP_OPENED, undefined);
    }

    public close(): void {
        this.popupEl?.classList.add('hidden');
        eventBus.publish(EVENTS.POPUP_CLOSED, undefined);
    }

    private handleSend(): void {
        const instruction = this.inputEl?.value.trim();
        if (instruction) {
            eventBus.publish(EVENTS.AI_REQUEST_STARTED, { instruction });
        }
    }
}
