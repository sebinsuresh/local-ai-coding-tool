# Architecture & Coding Standards

## Project Overview
AI-powered code editor built with CodeMirror 6 (CM6), TypeScript, and vanilla JavaScript. No frameworks. Communicates with LLM endpoints to assist with code generation and modification.

## Core Architectural Principles

### 1. Separation of Concerns (SOLID)
Each module has a single, well-defined responsibility. Implementation details are hidden behind clean interfaces.

### 2. Dependency Inversion
High-level modules don't depend on low-level modules. Both depend on abstractions (interfaces/types).

### 3. Event-Driven Architecture
Modules communicate via a central EventBus. This decouples components and makes the system extensible.

### 4. Adapter Pattern
External dependencies (CM6, File System API, LLM API) are wrapped in adapters. This allows swapping implementations without touching core logic.

---

## System Architecture

### Layer Diagram
```
┌─────────────────────────────────────────────────────────┐
│                     UI Layer (HTML/CSS)                 │
│  - index.html                                           │
│  - Mobile-responsive vanilla CSS                        │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                  Application Controller                 │
│  - Coordinates all modules                              │
│  - Initializes system                                   │
│  - Handles user interactions from UI                    │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼───────┐  ┌────────▼─────────┐
│   EventBus     │  │    State      │  │  Command System  │
│                │  │   Manager     │  │                  │
│ - pub/sub      │  │               │  │ - Command types  │
│ - decouples    │  │ - Files state │  │ - Prompts        │
│   modules      │  │ - App config  │  │ - Handlers       │
└───────┬────────┘  └──────┬────────┘  └────────┬─────────┘
        │                  │                    │
┌───────┴──────────────────┴────────────────────┴─────────┐
│                    Core Modules                         │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ TabManager   │  │EditorAdapter │  │  APIClient   │   │
│  │              │  │              │  │              │   │
│  │ - Tab state  │  │ - Wraps CM6  │  │ - LLM calls  │   │
│  │ - Tab switch │  │ - Isolated   │  │ - OpenAI API │   │
│  │ - Create/Del │  │ - Easy swap  │  │ - Config     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │StorageAdapter│  │ UIRenderer   │                     │
│  │              │  │              │                     │
│  │ - File APIs  │  │ - Updates UI │                     │
│  │ - Fallback   │  │ - Animations │                     │
│  │ - Save/Load  │  │ - Status     │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

---

## Module Specifications

### 1. EventBus
**Purpose**: Central nervous system of the app. Enables loose coupling.

**Responsibilities**:
- Subscribe to events
- Publish events
- No business logic

**Events** (examples):
- `tab:created`, `tab:switched`, `tab:closed`
- `editor:contentChanged`, `editor:cursorMoved`
- `ai:requestStarted`, `ai:responseReceived`, `ai:error`
- `file:saved`, `file:loaded`
- `config:updated`

**Why**: Modules can react to changes without knowing about each other.

---

### 2. State Manager
**Purpose**: Single source of truth for application state.

**State Structure**:
```typescript
{
  files: Map<fileId, FileState>,
  activeFileId: string | null,
  config: {
    apiEndpoint: string,
    apiKey: string,
    theme: string
  },
  ui: {
    isAIProcessing: boolean,
    currentOperation: string | null
  }
}
```

**FileState**:
```typescript
{
  id: string,
  name: string,
  content: string,
  language: string,
  isDirty: boolean,
  fileHandle?: FileSystemFileHandle // for File System Access API
}
```

**Why**: Separates state from UI. CodeMirror is just a view layer. State can be modified by user input OR AI commands.

---

### 3. EditorAdapter
**Purpose**: Wraps CodeMirror 6. Isolates CM6 implementation details.

**Interface**:
```typescript
interface IEditor {
  setContent(content: string): void;
  getContent(): string;
  setLanguage(language: string): void;
  setReadOnly(readonly: boolean): void;
  focus(): void;
  dispose(): void;
  onContentChange(callback: (content: string) => void): void;
}
```

**Why**: 
- If we want to swap CodeMirror for Monaco or Ace later, we only change this module
- Rest of codebase depends on IEditor interface, not CodeMirror specifics
- Minimal CodeMirror setup (basic editing + syntax highlighting)

---

### 4. TabManager
**Purpose**: Manages multiple editor instances and tab switching.

**Responsibilities**:
- Create/destroy tabs
- Switch active tab
- Maintain tab order
- Each tab has its own EditorAdapter instance
- Swap editor instances in/out of the DOM container

**Why**: Clean separation between tab management and editing. Supports multi-file workflow.

---

### 5. APIClient
**Purpose**: Handles all LLM API communication.

**Interface**:
```typescript
interface IAPIClient {
  sendRequest(request: APIRequest): Promise<APIResponse>;
  configure(endpoint: string, apiKey: string): void;
}

interface APIRequest {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
}
```

**Why**: 
- Isolated from rest of app
- Easy to add retry logic, streaming, error handling
- Can mock for testing
- OpenAI format, but could be extended

---

### 6. Command System
**Purpose**: Define different AI command types with their own prompts and handlers.

**Command Types** (examples):
- `generate` - Generate new code from description
- `modify` - Modify existing code based on instruction
- `explain` - Explain selected code
- `fix` - Fix errors/bugs
- `refactor` - Refactor code

**Structure**:
```typescript
interface Command {
  type: string;
  systemPromptTemplate: string;
  buildUserPrompt(context: CommandContext): string;
  handleResponse(response: string, context: CommandContext): void;
}
```

**Why**: Extensible. Easy to add new command types without changing core logic.

---

### 7. StorageAdapter
**Purpose**: Handle file persistence with fallback strategy.

**Interface**:
```typescript
interface IStorageAdapter {
  save(file: FileState): Promise<void>;
  load(): Promise<FileState>;
  canUseFileSystemAPI(): boolean;
}
```

**Strategy**:
1. Try File System Access API (if available)
2. Fallback to download/upload (older browsers)
3. LocalStorage for auto-save/recovery

**Why**: Progressive enhancement. Works everywhere.

---

### 8. UIRenderer
**Purpose**: Update UI based on state changes.

**Responsibilities**:
- Render tab list
- Show/hide loading states
- Display AI operation status ("Agent is thinking...")
- Update configuration panel
- Mobile-responsive layout

**Why**: Separates DOM manipulation from business logic.

---

### 9. Application Controller
**Purpose**: Bootstrap and coordinate everything.

**Responsibilities**:
- Initialize all modules
- Wire up event listeners
- Handle user actions from UI
- Orchestrate complex workflows (e.g., AI request → update state → update editor)

**Why**: Single entry point. Clear initialization flow.

---

## Data Flow Examples

### User Types in Editor
```
1. User types → CodeMirror onChange
2. EditorAdapter emits `editor:contentChanged` event
3. State Manager updates file content
4. State Manager marks file as dirty
5. UIRenderer updates save button state
```

### AI Command Request
```
1. User clicks "Generate Code" button
2. App Controller builds command context
3. Command System creates prompts
4. State Manager sets `ui.isAIProcessing = true`
5. UIRenderer shows "Agent is thinking..." overlay
6. EventBus emits `ai:requestStarted`
7. APIClient sends request
8. Response received → EventBus emits `ai:responseReceived`
9. Command handler processes response
10. State Manager updates file content
11. EditorAdapter sets new content (bypasses onChange to avoid loop)
12. State Manager sets `ui.isAIProcessing = false`
13. UIRenderer removes overlay
```

### Tab Switch
```
1. User clicks different tab
2. App Controller calls TabManager.switchTo(fileId)
3. TabManager detaches current editor from DOM
4. TabManager attaches target editor to DOM
5. State Manager updates activeFileId
6. EventBus emits `tab:switched`
7. UIRenderer updates active tab styling
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
- Interfaces: `IEditorAdapter`, `IStorageAdapter`
- Classes: `EditorAdapter`, `TabManager`
- Events: `namespace:action` (e.g., `file:saved`)
- Files: kebab-case (e.g., `editor-adapter.ts`)

---

## File Structure
```
/
├── index.html                 # Entry point
├── styles/
│   ├── main.css              # Core styles
│   ├── editor.css            # Editor-specific
│   ├── mobile.css            # Responsive
│   └── animations.css        # AI status animations
├── src/
│   ├── main.ts               # Bootstrap
│   ├── types/
│   │   ├── state.ts          # State types
│   │   ├── events.ts         # Event types
│   │   └── commands.ts       # Command types
│   ├── core/
│   │   ├── event-bus.ts
│   │   ├── state-manager.ts
│   │   └── app-controller.ts
│   ├── editor/
│   │   ├── editor-adapter.ts
│   │   └── tab-manager.ts
│   ├── ai/
│   │   ├── api-client.ts
│   │   └── command-system.ts
│   ├── storage/
│   │   └── storage-adapter.ts
│   └── ui/
│       └── ui-renderer.ts
├── dist/                      # ESBuild output
└── package.json
```

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
- Desktop: > 768px - side-by-side layout (tabs + editor + config)
- Tablet: 481-768px - stacked layout, collapsible panels
- Mobile: ≤ 480px - single column, tabs accessible via dropdown

### Touch Considerations
- Larger tap targets (44x44px minimum)
- Swipe gestures for tab switching (future enhancement)
- Collapsible panels to maximize editor space

---

## Error Handling

### Principles
- Never crash silently
- Show user-friendly error messages
- Log detailed errors to console
- Emit error events to EventBus

### AI Errors
- API errors → show error message, don't modify code
- Timeout → cancel operation, restore previous state

---

## Testing Strategy (Future)

### Unit Tests
- Each module in isolation
- Mock dependencies via interfaces

### Integration Tests
- Event flow testing
- State transitions

### Manual Testing
- Mobile browsers
- File System API support
- Different LLM endpoints

---

## Performance Considerations

### Debouncing
- Auto-save: debounce editor changes (500ms)
- API calls: prevent duplicate requests

### Memory Management
- Dispose CodeMirror instances when tabs close
- Limit tab count (warn after 10 tabs)

### Large Files
- Consider virtual scrolling for huge files (future)
- Warn before opening files > 1MB

---

## Security Considerations

### API Keys
- Never commit API keys
- Store in localstorage (user provides)

### File System Access
- Request permissions explicitly
- Handle permission denials gracefully

### Content Security Policy
- Add CSP headers if hosting remotely
- Restrict script sources


---

## Why This Architecture?

### Modularity
Each piece has clear boundaries. Easy to understand, test, and modify.

### Flexibility
Want to switch from CodeMirror to Monaco? Change EditorAdapter.
Want different storage? Swap StorageAdapter.
Want to support Claude API? Extend APIClient.

### Maintainability
SOLID principles mean changes are localized. Adding features doesn't break existing code.

### Scalability
Event-driven architecture supports complex workflows without tight coupling.

### Future-Proof
Ready for refactoring. Interfaces allow swapping implementations. State separated from UI allows adding new UIs (e.g., React later if needed) without rewriting logic.
