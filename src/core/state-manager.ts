import { AppState, AppConfig, SelectionInfo, UIState, EditorState } from '../types/state';
import { eventBus } from './event-bus';
import { EVENTS } from '../types/events';

class StateManager {
    private state: AppState = {
        editor: {
            content: '',
            language: 'javascript',
            selection: null
        },
        config: {
            apiEndpoint: 'http://127.0.0.1:1234/v1',
            apiKey: 'NA',
            model: 'qwen/qwen3-4b-2507'
        },
        ui: {
            isPopupOpen: false,
            isAIProcessing: false,
            highlightedRange: null
        }
    };

    // Getters
    public getState(): AppState {
        return { ...this.state };
    }

    public getConfig(): AppConfig {
        return { ...this.state.config };
    }

    // Setters
    public updateConfig(config: Partial<AppConfig>): void {
        this.state.config = { ...this.state.config, ...config };
        eventBus.publish(EVENTS.CONFIG_UPDATED, { config: this.state.config });
    }

    public updateEditorContent(content: string): void {
        this.state.editor.content = content;
        eventBus.publish(EVENTS.EDITOR_CONTENT_CHANGED, { content });
    }

    public updateSelection(selection: SelectionInfo | null): void {
        this.state.editor.selection = selection;
        eventBus.publish(EVENTS.EDITOR_SELECTION_CHANGED, { selection });
    }

    public setPopupOpen(isOpen: boolean): void {
        this.state.ui.isPopupOpen = isOpen;
        if (isOpen) {
            eventBus.publish(EVENTS.POPUP_OPENED, undefined);
        } else {
            eventBus.publish(EVENTS.POPUP_CLOSED, undefined);
        }
    }

    public setAIProcessing(isProcessing: boolean): void {
        this.state.ui.isAIProcessing = isProcessing;
    }

    public setHighlightedRange(range: { from: number; to: number } | null): void {
        this.state.ui.highlightedRange = range;
    }
}

export const stateManager = new StateManager();
