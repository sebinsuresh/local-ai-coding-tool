import { SelectionInfo, AppConfig } from './state';
import { AIResponse } from './api';

export const EVENTS = {
    EDITOR_CONTENT_CHANGED: 'editor:contentChanged',
    EDITOR_SELECTION_CHANGED: 'editor:selectionChanged',
    ACTION_OPEN_POPUP: 'action:openPopup',
    POPUP_OPENED: 'popup:opened',
    POPUP_CLOSED: 'popup:closed',
    AI_REQUEST_STARTED: 'ai:requestStarted',
    AI_RESPONSE_RECEIVED: 'ai:responseReceived',
    AI_ERROR: 'ai:error',
    CONFIG_UPDATED: 'config:updated',
} as const;

export type EventPayloads = {
    [EVENTS.EDITOR_CONTENT_CHANGED]: { content: string };
    [EVENTS.EDITOR_SELECTION_CHANGED]: { selection: SelectionInfo | null };
    [EVENTS.ACTION_OPEN_POPUP]: void;
    [EVENTS.POPUP_OPENED]: void;
    [EVENTS.POPUP_CLOSED]: void;
    [EVENTS.AI_REQUEST_STARTED]: { instruction: string };
    [EVENTS.AI_RESPONSE_RECEIVED]: { response: AIResponse };
    [EVENTS.AI_ERROR]: { error: string };
    [EVENTS.CONFIG_UPDATED]: { config: AppConfig };
};
