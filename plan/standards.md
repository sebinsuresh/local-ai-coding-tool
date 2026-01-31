# Architecture & Coding Standards

## Project Overview
AI-powered code editor built with CodeMirror 6, TypeScript, and vanilla JavaScript. No frameworks. Communicates with LLM endpoints to assist with code modification.

**MVP Scope**: Single-file editor with minimal popup for AI-assisted code modifications. No file persistence, no tabs, simplified AI commands.

## Core Architectural Principles

### 1. Separation of Concerns (SOLID)
Each module has a single, well-defined responsibility. Implementation details are hidden behind clean interfaces.

### 2. Dependency Inversion
High-level modules don't depend on low-level modules. Both depend on abstractions (interfaces/types).

### 3. Event-Driven Architecture
Modules communicate via a central EventBus. This decouples components and makes the system extensible.

### 4. Adapter Pattern
External dependencies (CodeMirror 6, LLM API) are wrapped in adapters. This allows swapping implementations without touching core logic.

---

## System Architecture

**Simplified MVP Architecture:**

- **UI Layer**: HTML + CSS (editor container, popup, config panel)
- **App Controller**: Initializes and coordinates modules
- **EventBus**: Decoupled communication between modules
- **State Manager**: In-memory state (code content, selection, config, UI state)
- **EditorAdapter**: Wraps CodeMirror 6 for isolation
- **PopupManager**: Handles AI modification popup (non-blocking, minimal)
- **APIClient**: LLM API communication (OpenAI-compatible)
- **ActionHandler**: Decoupled action handling (supports buttons + future keyboard shortcuts)

---

## Module Specifications

### 1. EventBus
**Purpose**: Central nervous system of the app. Enables loose coupling.

**Responsibilities**:
- Subscribe to events
- Publish events
- No business logic

**MVP Events**:
- `editor:contentChanged`
- `editor:selectionChanged`
- `action:openPopup` (decoupled from UI button)
- `popup:opened`, `popup:closed`
- `ai:requestStarted`, `ai:responseReceived`, `ai:error`
- `config:updated`

**Why**: Modules can react to changes without knowing about each other. ActionHandler can trigger popup from button OR keyboard shortcut.

---

### 2. State Manager
**Purpose**: Single source of truth for application state.

**MVP State Structure**:
```typescript
{
  editor: {
    content: string,
    language: string,
    selection: {
      from: number,
      to: number,
      fromLine: number,
      toLine: number
    } | null
  },
  config: {
    apiEndpoint: string,
    apiKey: string,
    model: string
  },
  ui: {
    isPopupOpen: boolean,
    isAIProcessing: boolean,
    highlightedRange: { from: number, to: number } | null
  }
}
```

**Why**: Separates state from UI. CodeMirror is just a view layer. State can be modified by user input OR AI commands. In-memory only for MVP.

---

### 3. EditorAdapter
**Purpose**: Wraps CodeMirror 6. Isolates CM6 implementation details.

**Interface**:
```typescript
interface IEditor {
  setContent(content: string): void;
  getContent(): string;
  getSelection(): { from: number, to: number, text: string } | null;
  setHighlight(from: number, to: number): void;
  clearHighlight(): void;
  setReadOnly(readonly: boolean): void;
  focus(): void;
  onContentChange(callback: (content: string) => void): void;
  onSelectionChange(callback: (selection: SelectionInfo) => void): void;
}
```

**Implementation**:
- Minimal CodeMirror 6 setup (basic editing + syntax highlighting)
- Highlight extension for marking selected code during AI operations
- Prevent onChange loops during programmatic updates

**Why**: 
- If we want to swap CodeMirror for another editor later, we only change this module
- Rest of codebase depends on IEditor interface, not CodeMirror specifics

---

### 4. PopupManager
**Purpose**: Manages the AI modification popup.

**Responsibilities**:
- Open/close popup
- Position popup near selection (or cursor if no selection)
- Display line number(s) being modified
- Handle input field interactions
- Emit events when user sends instruction or cancels
- ESC key closes popup when input focused
- Fully non-blocking (editor remains editable)

**Popup UI Components**:
- Line number display (e.g., "Line 42" or "Lines 42-45")
- Input field for AI instructions
- "Send" button
- "Cancel" button
- Minimal tooltip-like styling

**Why**: Decoupled popup management. Can enhance UI later without touching other modules.

---

### 5. APIClient
**Purpose**: Handles all LLM API communication.

**Interface**:
```typescript
interface IAPIClient {
  sendRequest(request: AIRequest): Promise<AIResponse>;
  configure(endpoint: string, apiKey: string, model: string): void;
}

interface AIRequest {
  instruction: string;      // User's instruction from popup
  codeContext: string;      // The selected code (or current line)
  lineRange: string;        // E.g., "42" or "42-45" for context
}

interface AIResponse {
  modifiedCode: string;     // The code to replace selection with
  error?: string;
}
```

**Implementation**:
- OpenAI-compatible API format
- Simple prompt construction (keep flexible for experimentation)
- Error handling and timeout
- No retry logic initially (keep simple)

**Why**: 
- Isolated from rest of app
- Easy to experiment with different prompt strategies
- Can add more features later (streaming, retry, etc.)

---

### 6. ActionHandler
**Purpose**: Decoupled action handling for triggering operations.

**Responsibilities**:
- Register action handlers (e.g., "openPopup")
- Trigger actions via events (not direct function calls)
- Support multiple triggers (button clicks, keyboard shortcuts)

**Pattern**:
```typescript
// Button clicks ActionHandler.trigger('openPopup')
// Keyboard shortcut also triggers ActionHandler.trigger('openPopup')
// ActionHandler emits event → PopupManager reacts
```

**Why**: 
- Button and keyboard shortcuts can trigger same actions
- Easy to add keyboard shortcuts later
- Actions are testable independently of UI

---

### 7. Application Controller
**Purpose**: Bootstrap and coordinate everything.

**Responsibilities**:
- Initialize all modules
- Wire up event listeners
- Handle complex workflows (AI request → update state → update editor)
- Coordinate popup opening with editor state

**Initialization Flow**:
1. Initialize EventBus
2. Initialize State Manager
3. Initialize EditorAdapter
4. Initialize PopupManager
5. Initialize APIClient (with config from state)
6. Initialize ActionHandler
7. Wire up UI button clicks to ActionHandler
8. Subscribe to events for cross-module coordination

**Why**: Single entry point. Clear initialization flow. Orchestrates complex interactions.

---

## Data Flow Examples

### User Opens Popup for Code Modification
```
1. User selects code in editor (or places cursor on a line)
2. User clicks "Modify Code" button (or presses keyboard shortcut)
3. Button click → ActionHandler.trigger('openPopup')
4. ActionHandler emits `action:openPopup` event
5. PopupManager receives event
6. PopupManager gets current selection from EditorAdapter
7. PopupManager gets line numbers from selection
8. PopupManager opens popup, positions it, shows line numbers
9. EditorAdapter highlights the selected range
10. EventBus emits `popup:opened`
11. State Manager updates ui.isPopupOpen = true
```

### User Sends AI Instruction
```
1. User types instruction in popup input (e.g., "wrap this in a try-catch")
2. User clicks "Send" button (or presses Enter)
3. PopupManager gathers:
   - User instruction
   - Selected code from EditorAdapter
   - Line range
4. EventBus emits `ai:requestStarted`
5. State Manager updates ui.isAIProcessing = true
6. APIClient sends request to LLM endpoint
7. While waiting: popup shows loading state, editor selection remains highlighted
8. Response received → EventBus emits `ai:responseReceived`
9. App Controller processes response
10. State Manager updates editor.content with modified code
11. EditorAdapter sets new content (programmatically, no onChange trigger)
12. EditorAdapter clears highlight
13. PopupManager closes popup
14. State Manager updates ui.isAIProcessing = false, ui.isPopupOpen = false
15. EventBus emits `popup:closed`
```

### User Cancels Popup
```
1. User clicks "Cancel" button or presses ESC while input focused
2. PopupManager closes popup
3. EditorAdapter clears highlight
4. State Manager updates ui.isPopupOpen = false
5. EventBus emits `popup:closed`
```

### User Edits Code While Popup Open
```
1. Popup is open, selection is highlighted
2. User clicks in editor outside highlighted range
3. User types normally - editor is fully functional
4. EditorAdapter emits `editor:contentChanged`
5. State Manager updates editor.content
6. Popup remains open (non-blocking)
7. Highlighted range still visible
```

---

## TypeScript Standards

### Interfaces Over Classes
Prefer interfaces for contracts. Use classes only when needed for state/behavior.

### Strict Mode
Enable strict TypeScript checking. No `any` types without explicit reason.

### Type Files
Define shared types in `src/types/` directory.

### Naming Conventions
- Interfaces: `IEditor`, `IAPIClient`
- Classes: `EditorAdapter`, `PopupManager`
- Events: `namespace:action` (e.g., `popup:opened`)
- Files: kebab-case (e.g., `editor-adapter.ts`)

---

## Build System

### ESBuild Configuration
- Bundle TypeScript → JavaScript
- Output to `dist/bundle.js`
- Source maps for debugging
- Watch mode for development
- Minification for production

### HTML Entry Point
- `index.html` in root references `dist/bundle.js`
- Minimal HTML structure
- CSS loaded in `<head>`

---

## Mobile Responsiveness

### Breakpoints
- Desktop: > 768px - Config panel as sidebar, popup positioned freely
- Tablet: 481-768px - Config panel collapsible, popup adapts to smaller screen
- Mobile: ≤ 480px - Config panel full-width overlay, popup centered

### Touch Considerations
- Larger tap targets for buttons (44x44px minimum)
- Popup input field sized for mobile keyboards
- Editor takes full available height

---

## Error Handling

### Principles
- Never crash silently
- Show user-friendly error messages in popup
- Log detailed errors to console
- Emit error events to EventBus

### AI Request Errors
- Network failures → show error in popup, don't modify code
- API errors → display error message to user
- Invalid API config → prompt user to configure endpoint/key
- Timeout → cancel operation, clear highlight

---

## Performance Considerations

### Editor Performance
- CodeMirror handles large files efficiently
- Minimal extensions to keep editor lightweight

### API Calls
- No auto-triggering (user must explicitly send)
- Single request at a time (no queue initially)
- Simple timeout handling

### Memory
- Single editor instance (no cleanup complexity)
- Popup DOM elements reused (not recreated on each open)

---

## Security Considerations

### API Keys
- Never commit API keys to repo
- Store in State Manager (user provides via config panel)
- Consider localStorage for persistence in future

### Content Security Policy
- Add basic CSP if hosting remotely in future
- Restrict script sources

---

## Extension Points (Future)

### Features Deferred Post-MVP
- Multiple tabs/files
- File saving/loading
- Keyboard shortcuts
- More sophisticated AI commands
- Streaming AI responses
- Diff view before applying changes
- Undo/redo for AI operations
- Dark mode
- Additional language support
- Command history

### Why This Is Deferred
Each feature adds complexity. MVP focuses on core interaction loop: select code → give instruction → apply modification. Once this works smoothly, we can iterate on additional features.

---

## Why This Architecture?

### Modularity
Each piece has clear boundaries. Easy to understand, test, and modify. Small surface area.

### Flexibility
- Want to swap CodeMirror? Change EditorAdapter.
- Want different AI provider? Modify APIClient.
- Want better popup UI? Change PopupManager.
- Want keyboard shortcuts? Add to ActionHandler.

### Maintainability
SOLID principles mean changes are localized. Adding features doesn't break existing code.

### Experimentation-Friendly
AI prompting will require experimentation. Keeping APIClient and prompt construction simple allows rapid iteration without architectural changes.

### Token-Efficient
Smaller codebase = less context for AI coding assistants. Modular design means you can focus assistant on one module at a time.
