import { eventBus } from './event-bus';
import { stateManager } from './state-manager';
import { EditorAdapter } from '../editor/editor-adapter';
import { PopupManager } from '../ui/popup-manager';
import { ActionHandler } from '../ui/action-handler';
import { APIClient } from '../ai/api-client';
import { EVENTS } from '../types/events';

export class AppController {
    private editor: EditorAdapter;
    private popup: PopupManager;
    private actionHandler: ActionHandler;
    private apiClient: APIClient;

    constructor() {
        const editorContainer = document.getElementById('editor-container');
        if (!editorContainer) throw new Error('Editor container not found');

        this.editor = new EditorAdapter(editorContainer);
        this.popup = new PopupManager();
        this.actionHandler = new ActionHandler();
        this.apiClient = new APIClient();

        this.init();
    }

    private init(): void {
        this.setupEventHandlers();
        this.setupConfigPanel();
        
        // Initial config
        this.apiClient.configure(stateManager.getConfig());
    }

    private setupEventHandlers(): void {
        // Editor -> State
        this.editor.onContentChange((content) => {
            stateManager.updateEditorContent(content);
        });

        this.editor.onSelectionChange((selection) => {
            stateManager.updateSelection(selection);
        });

        // Action -> Popup
        eventBus.subscribe(EVENTS.ACTION_OPEN_POPUP, () => {
            const selection = this.editor.getSelection();
            if (!selection) {
                // TODO: If no selection, maybe use current line
                // For MVP, we'll just require focus/selection
                return;
            }

            const lineRange = selection.fromLine === selection.toLine 
                ? `Line ${selection.fromLine}` 
                : `Lines ${selection.fromLine}-${selection.toLine}`;
            
            // Highlight selection
            this.editor.setHighlight(selection.from, selection.to);

            // For MVP, position at bottom right of screen or near cursor
            // Modern CM6 uses coordsAtPos, but let's just use fixed for now
            this.popup.open(lineRange, { top: 100, left: 100 });
        });

        // Popup -> AI Request
        eventBus.subscribe(EVENTS.AI_REQUEST_STARTED, async ({ instruction }) => {
            const selection = this.editor.getSelection();
            if (!selection) return;

            stateManager.setAIProcessing(true);
            
            const response = await this.apiClient.sendRequest({
                instruction,
                codeContext: selection.text,
                lineRange: `${selection.fromLine}-${selection.toLine}`
            });

            stateManager.setAIProcessing(false);

            if (response.error) {
                alert(response.error); // Simple error display for MVP
            } else {
                // Apply changes
                const fullContent = this.editor.getContent();
                const newContent = fullContent.substring(0, selection.from) + 
                                 response.modifiedCode + 
                                 fullContent.substring(selection.to);
                
                this.editor.setContent(newContent);
                this.editor.clearHighlight();
                this.popup.close();
            }
        });

        // Popup Closed -> Clear Highlight (if cancelled)
        eventBus.subscribe(EVENTS.POPUP_CLOSED, () => {
            this.editor.clearHighlight();
        });

        // Config -> API Client
        eventBus.subscribe(EVENTS.CONFIG_UPDATED, ({ config }) => {
            this.apiClient.configure(config);
        });
    }

    private setupConfigPanel(): void {
        const configBtn = document.getElementById('config-btn');
        const configPanel = document.getElementById('config-panel');
        const saveBtn = document.getElementById('save-config');
        const closeBtn = document.getElementById('close-config');

        configBtn?.addEventListener('click', () => {
            configPanel?.classList.remove('hidden');
            // Populate inputs
            const config = stateManager.getConfig();
            (document.getElementById('api-endpoint') as HTMLInputElement).value = config.apiEndpoint;
            (document.getElementById('api-key') as HTMLInputElement).value = config.apiKey;
            (document.getElementById('model') as HTMLInputElement).value = config.model;
        });

        closeBtn?.addEventListener('click', () => {
            configPanel?.classList.add('hidden');
        });

        saveBtn?.addEventListener('click', () => {
            const endpoint = (document.getElementById('api-endpoint') as HTMLInputElement).value;
            const key = (document.getElementById('api-key') as HTMLInputElement).value;
            const model = (document.getElementById('model') as HTMLInputElement).value;

            stateManager.updateConfig({
                apiEndpoint: endpoint,
                apiKey: key,
                model: model
            });

            configPanel?.classList.add('hidden');
        });
    }
}
