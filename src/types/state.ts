export interface SelectionInfo {
    from: number;
    to: number;
    fromLine: number;
    toLine: number;
    text: string;
}

export interface AppConfig {
    apiEndpoint: string;
    apiKey: string;
    model: string;
}

export interface UIState {
    isPopupOpen: boolean;
    isAIProcessing: boolean;
    highlightedRange: { from: number; to: number } | null;
}

export interface EditorState {
    content: string;
    language: string;
    selection: SelectionInfo | null;
}

export interface AppState {
    editor: EditorState;
    config: AppConfig;
    ui: UIState;
}
