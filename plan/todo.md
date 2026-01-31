# Development Checklist

## Phase 1: Project Setup & Skeleton

### Repository Setup
- [ ] Initialize npm project (`package.json`)
- [ ] Install TypeScript as dev dependency
- [ ] Install ESBuild as dev dependency
- [ ] Install CodeMirror 6 core packages (minimal set)
- [ ] Create `tsconfig.json` with strict mode
- [ ] Create `.gitignore` (node_modules, dist, .env)

### Build System
- [ ] Create ESBuild configuration script
- [ ] Add build scripts to package.json (build, watch, clean)
- [ ] Test build process (compile TypeScript → dist folder)
- [ ] Verify source maps are generated

### Project Structure
- [ ] Create `src/` directory structure (core, editor, ai, storage, ui, types)
- [ ] Create `styles/` directory
- [ ] Create `dist/` directory (git-ignored)
- [ ] Create basic `index.html` with proper structure
- [ ] Create placeholder TypeScript files for each module

### Basic HTML/CSS
- [ ] Create `index.html` with semantic structure
  - Header (title, config button)
  - Tab bar container
  - Editor container
  - Config panel (initially hidden)
  - Status/AI operation overlay
- [ ] Create `styles/main.css` with CSS reset and variables
- [ ] Create `styles/editor.css` for editor layout
- [ ] Create `styles/mobile.css` with responsive breakpoints
- [ ] Create `styles/animations.css` for AI status animations
- [ ] Test mobile responsiveness in browser dev tools

---

## Phase 2: Core Infrastructure

### Type Definitions
- [ ] Create `src/types/state.ts`
  - Define `FileState` interface
  - Define `AppState` interface
  - Define `AppConfig` interface
  - Define `UIState` interface
- [ ] Create `src/types/events.ts`
  - Define event name constants
  - Define event payload types
- [ ] Create `src/types/commands.ts`
  - Define `Command` interface
  - Define `CommandContext` interface
  - Define `APIRequest`/`APIResponse` types

### EventBus Implementation
- [ ] Create `src/core/event-bus.ts`
- [ ] Implement subscribe/unsubscribe methods
- [ ] Implement publish method with typed events
- [ ] Add error handling for event handlers
- [ ] Create singleton instance export

### State Manager Implementation
- [ ] Create `src/core/state-manager.ts`
- [ ] Implement state storage (using Map for files)
- [ ] Implement state getters (getFile, getActiveFile, getConfig, etc.)
- [ ] Implement state setters (updateFile, setActiveFile, updateConfig, etc.)
- [ ] Emit events on state changes via EventBus
- [ ] Create singleton instance export

---

## Phase 3: Editor Layer

### Editor Adapter Interface
- [ ] Create `src/editor/editor-adapter.ts`
- [ ] Define `IEditor` interface
- [ ] Implement CodeMirror 6 minimal setup
  - Basic extensions (history, lineNumbers, syntax highlighting)
  - Language support (start with JavaScript/TypeScript)
- [ ] Implement `setContent()` method
- [ ] Implement `getContent()` method
- [ ] Implement `setLanguage()` method
- [ ] Implement `setReadOnly()` method
- [ ] Implement `focus()` method
- [ ] Implement `dispose()` method
- [ ] Implement `onContentChange()` callback mechanism
- [ ] Add flag to prevent onChange loops during programmatic updates

### Tab Manager Implementation
- [ ] Create `src/editor/tab-manager.ts`
- [ ] Implement tab creation (creates new EditorAdapter instance)
- [ ] Implement tab switching logic (swap editor in/out of DOM)
- [ ] Implement tab closing (dispose editor, remove from state)
- [ ] Emit tab events (created, switched, closed) via EventBus
- [ ] Store tab order
- [ ] Handle "no tabs open" state

---

## Phase 4: UI Layer

### UI Renderer Implementation
- [ ] Create `src/ui/ui-renderer.ts`
- [ ] Implement tab list rendering
- [ ] Implement active tab highlighting
- [ ] Implement "New Tab" button handler
- [ ] Implement "Close Tab" button handlers
- [ ] Implement config panel toggle
- [ ] Implement AI status overlay (show/hide)
- [ ] Implement AI operation text updates
- [ ] Listen to state changes via EventBus and update UI
- [ ] Add CSS classes for animations

### Config Panel UI
- [ ] Add config form to HTML (API endpoint, API key, model)
- [ ] Implement config form submission handler
- [ ] Save config to State Manager
- [ ] Show/hide config panel on button click
- [ ] Validate config inputs

---

## Phase 5: Storage Layer

### Storage Adapter Implementation
- [ ] Create `src/storage/storage-adapter.ts`
- [ ] Implement File System Access API detection
- [ ] Implement save with File System Access API
  - Request file handle
  - Write file content
  - Store handle in FileState
- [ ] Implement load with File System Access API
- [ ] Implement fallback save (download file)
- [ ] Implement fallback load (file input upload)
- [ ] Implement localStorage auto-save for recovery
- [ ] Emit storage events via EventBus

### Storage UI Integration
- [ ] Add "Save" button to UI
- [ ] Add "Open" button to UI
- [ ] Wire up buttons to StorageAdapter
- [ ] Show save success/failure messages
- [ ] Update file "dirty" state indicator

---

## Phase 6: AI/API Layer

### API Client Implementation
- [ ] Create `src/ai/api-client.ts`
- [ ] Implement `configure()` method (set endpoint, API key)
- [ ] Implement `sendRequest()` method
  - Build OpenAI-compatible request payload
  - Send POST request with fetch API
  - Handle response/errors
  - Return parsed response
- [ ] Add request timeout handling
- [ ] Add retry logic with exponential backoff
- [ ] Emit API events via EventBus (started, success, error)

### Command System Implementation
- [ ] Create `src/ai/command-system.ts`
- [ ] Define base Command class/interface
- [ ] Implement "Generate Code" command
  - System prompt template
  - User prompt builder
  - Response handler (insert into editor)
- [ ] Implement "Modify Code" command
  - System prompt template
  - User prompt builder (includes selected text)
  - Response handler (replace selection or full content)
- [ ] Implement "Explain Code" command (optional, show in modal)
- [ ] Register commands in a command registry
- [ ] Expose command execution API

### AI UI Integration
- [ ] Add AI command buttons to UI (Generate, Modify, etc.)
- [ ] Add command input fields (e.g., "What to generate?")
- [ ] Wire up buttons to Command System
- [ ] Show AI processing overlay when request starts
- [ ] Hide overlay and update editor when response received
- [ ] Show error messages on AI failures

---

## Phase 7: Application Controller & Integration

### App Controller Implementation
- [ ] Create `src/core/app-controller.ts`
- [ ] Implement initialization method
  - Initialize EventBus
  - Initialize State Manager
  - Initialize TabManager (create first tab)
  - Initialize UI Renderer
  - Initialize StorageAdapter
  - Initialize APIClient
  - Initialize Command System
- [ ] Wire up cross-module event flows
  - Editor changes → State updates
  - Tab switches → Editor swaps
  - AI requests → API calls → Editor updates
  - Save/Load → Storage → State → Editor
- [ ] Implement user action handlers
  - New tab click
  - Close tab click
  - Save click
  - Open click
  - AI command clicks

### Main Entry Point
- [ ] Create `src/main.ts`
- [ ] Import and initialize App Controller
- [ ] Add DOM ready check
- [ ] Handle initialization errors gracefully

---

## Phase 8: Testing & Refinement

### Manual Testing
- [ ] Test creating multiple tabs
- [ ] Test switching between tabs
- [ ] Test closing tabs
- [ ] Test editing in multiple tabs
- [ ] Test saving files (File System Access API)
- [ ] Test saving files (fallback download)
- [ ] Test opening files
- [ ] Test AI generate command
- [ ] Test AI modify command
- [ ] Test API endpoint configuration
- [ ] Test error scenarios (bad API key, network error, etc.)
- [ ] Test mobile responsiveness on actual devices

### Bug Fixes & Polish
- [ ] Fix any bugs found during testing
- [ ] Improve error messages
- [ ] Add loading states where needed
- [ ] Ensure all animations work smoothly
- [ ] Verify accessibility (keyboard navigation, ARIA labels)

### Documentation
- [ ] Update README.md with setup instructions
- [ ] Document API endpoint configuration
- [ ] Document supported AI commands
- [ ] Add usage examples/screenshots

---

## Phase 9: Optimization & Enhancement (Optional)

### Performance
- [ ] Add debouncing to auto-save
- [ ] Add debouncing to AI command inputs
- [ ] Profile memory usage with many tabs
- [ ] Optimize bundle size (check if any unused dependencies)

### User Experience
- [ ] Add keyboard shortcuts (Ctrl+S for save, etc.)
- [ ] Add confirmation dialog before closing unsaved tabs
- [ ] Add file type detection from extension
- [ ] Add syntax highlighting for more languages
- [ ] Add dark mode toggle
- [ ] Add undo/redo for AI operations (separate from editor undo)

### Advanced Features
- [ ] Add streaming support for AI responses
- [ ] Add diff view for AI changes (before applying)
- [ ] Add conversation history for AI commands
- [ ] Add project templates
- [ ] Add export project as ZIP

---

## Notes

### Dependencies to Install
- `typescript` (dev)
- `esbuild` (dev)
- `@codemirror/state` (runtime)
- `@codemirror/view` (runtime)
- `@codemirror/basic-setup` or minimal set (runtime)
- `@codemirror/lang-javascript` (runtime, for JS/TS syntax)
- Consider: `@codemirror/lang-python`, `@codemirror/lang-html`, etc. as needed

### Testing Strategy
Start with manual testing for MVP. Can add automated tests later using:
- Vitest or Jest for unit tests
- Playwright for E2E tests

### Version Control
Commit after completing each phase to have clear checkpoints.

---

## Current Status
**Phase**: Not Started
**Last Updated**: January 31, 2026
