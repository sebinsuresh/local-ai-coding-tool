export interface AIRequest {
    instruction: string;      // User's instruction from popup
    codeContext: string;      // The selected code (or current line)
    lineRange: string;        // E.g., "42" or "42-45" for context
}

export interface AIResponse {
    modifiedCode: string;     // The code to replace selection with
    error?: string;
}
