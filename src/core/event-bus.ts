import { EventPayloads } from '../types/events';

type Handler<T> = (data: T) => void;

class EventBus {
    private handlers: { [K in keyof EventPayloads]?: Handler<EventPayloads[K]>[] } = {};

    public subscribe<K extends keyof EventPayloads>(event: K, handler: Handler<EventPayloads[K]>): () => void {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event]?.push(handler);

        return () => this.unsubscribe(event, handler);
    }

    public unsubscribe<K extends keyof EventPayloads>(event: K, handler: Handler<EventPayloads[K]>): void {
        const h = this.handlers[event];
        if (h) {
            this.handlers[event] = h.filter(item => item !== handler);
        }
    }

    public publish<K extends keyof EventPayloads>(event: K, data: EventPayloads[K]): void {
        const h = this.handlers[event];
        if (h) {
            h.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }
}

export const eventBus = new EventBus();
