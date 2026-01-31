# TODO - Development Tasks

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
- [ ] Create `src/` directory structure (core, editor, ui, ai, types)
- [ ] Create `styles/` directory
- [ ] Create `dist/` directory (git-ignored)
- [ ] Create placeholder TypeScript files for each module

### Basic HTML/CSS
- [ ] Create `index.html` with semantic structure
  - Header (title, config button)
  - Editor container
  - Config panel (initially hidden)
  - "Modify Code" button
- [ ] Create `styles/main.css` with CSS reset and variables
- [ ] Create `styles/editor.css` for editor layout
- [ ] Create `styles/popup.css` for minimal tooltip-like popup
- [ ] Create `styles/mobile.css` with responsive breakpoints
- [ ] Test mobile responsiveness in browser dev tools

---

## Phase 2: Core Infrastructure

### Type Definitions
- [ ] Create `src/types/state.ts`
  - Define `EditorState` interface (content, language, selection)
  - Define `AppState` interface (editor, config, ui)
  - Define `AppConfig` interface (apiEndpoint, apiKey, model)
  - Define `UIState` interface (isPopupOpen, isAIProcessing, highlightedRange)
  - Define `SelectionInfo` interface
- [ ] Create `src/types/events.ts`
  - Define event name constants
  - Define event payload types
- [ ] Create `src/types/api.ts`
  - Define `AIRequest` interface
  - Define `AIResponse` interface

### EventBus Implementation
- [ ] Create `src/core/event-bus.ts`
- [ ] Implement subscribe/unsubscribe methods
- [ ] Implement publish method with typed events
- [ ] Add error handling for event handlers
- [ ] Create singleton instance export

### State Manager Implementation
- [ ] Create `src/core/state-manager.ts`
- [ ] Implement in-memory state storage
- [ ] Implement state getters (getContent, getSelection, getConfig, etc.)
- [ ] Implement state setters (updateContent, updateSelection, updateConfig, etc.)
- [ ] Emit events on state changes via EventBus
- [ ] Create singleton instance export

---

## Phase 3: Editor Layer (MVP Goal)

### Editor Adapter Interface
- [ ] Create `src/editor/editor-adapter.ts`
- [ ] Define `IEditor` interface
- [ ] Implement minimal CodeMirror 6 setup
  - Basic extensions (history, lineNumbers, basic syntax highlighting)
  - Language support (start with JavaScript)
- [ ] Implement `setContent()` method
- [ ] Implement `getContent()` method
- [ ] Implement `getSelection()` method (returns from, to, text, line numbers)
- [ ] Implement `setHighlight()` method (mark range visually)
- [ ] Implement `clearHighlight()` method
- [ ] Implement `focus()` method
- [ ] Implement `onContentChange()` callback mechanism
- [ ] Implement `onSelectionChange()` callback mechanism
- [ ] Add flag to prevent onChange loops during programmatic updates
- [ ] Mount editor to DOM on initialization

### Test Editor MVP
- [ ] Wire up editor to HTML container
- [ ] Verify typing works
- [ ] Verify syntax highlighting works
- [ ] Verify selection detection works
- [ ] Verify content can be programmatically set
- [ ] Test on mobile browser

---

## Phase 4: Popup UI (MVP Goal)

### Popup Manager Implementation
- [ ] Create `src/ui/popup-manager.ts`
- [ ] Create popup HTML structure (input, line display, Send/Cancel buttons)
- [ ] Implement `open()` method
  - Position popup near selection/cursor
  - Show line number(s) being modified
  - Focus input field
- [ ] Implement `close()` method
  - Clear input
  - Hide popup
  - Emit event
- [ ] Implement ESC key handling (close when input focused)
- [ ] Implement Send button handler (emit event with instruction)
- [ ] Implement Cancel button handler (close popup)
- [ ] Style popup as minimal tooltip (see styles/popup.css)
- [ ] Make popup non-blocking (position absolute/fixed)

### Test Popup MVP
- [ ] Click button to open popup
- [ ] Verify line numbers display correctly
- [ ] Verify single line vs. multi-line range
- [ ] Verify ESC closes popup
- [ ] Verify Cancel closes popup
- [ ] Verify editor remains editable while popup open
- [ ] Test popup positioning on mobile

---

## Phase 5: Action Handler (Decoupling)

### Action Handler Implementation
- [ ] Create `src/ui/action-handler.ts`
- [ ] Implement action registry
- [ ] Implement `trigger()` method (emits events via EventBus)
- [ ] Register 'openPopup' action
- [ ] Wire up "Modify Code" button to ActionHandler.trigger('openPopup')

### Integration
- [ ] When 'openPopup' action triggered:
  - Get current selection from EditorAdapter
  - Emit `action:openPopup` event
  - PopupManager listens and opens popup
  - EditorAdapter highlights selection
  - State Manager updates ui.isPopupOpen

---

## Phase 6: Config Panel

### Config Panel UI
- [ ] Add config panel to HTML (hidden by default)
  - API endpoint input
  - API key input
  - Model input
  - Save/Cancel buttons
- [ ] Add config button to header (toggle panel visibility)
- [ ] Implement config form submission
- [ ] Save config to State Manager
- [ ] Show/hide panel on button click
- [ ] Validate config inputs (non-empty endpoint, key)
- [ ] Close panel after saving

---

## Phase 7: AI/API Layer

### API Client Implementation
- [ ] Create `src/ai/api-client.ts`
- [ ] Implement `configure()` method (set endpoint, API key, model)
- [ ] Implement `sendRequest()` method
  - Build OpenAI-compatible request payload
  - Include system prompt (keep simple/flexible)
  - Include user instruction + code context
  - Send POST request with fetch API
  - Parse response
  - Extract modified code from response
  - Return AIResponse
- [ ] Add request timeout handling (30 seconds)
- [ ] Add error handling (network errors, API errors)
- [ ] Emit API events via EventBus (started, success, error)

### Prompt Engineering (Initial)
- [ ] Define simple system prompt for code modification
- [ ] Build user prompt with instruction + code + line context
- [ ] Keep flexible for experimentation

---

## Phase 8: Full Integration

### App Controller Implementation
- [ ] Create `src/core/app-controller.ts`
- [ ] Implement initialization method:
  - Initialize EventBus
  - Initialize State Manager with default config
  - Initialize EditorAdapter
  - Initialize PopupManager
  - Initialize ActionHandler
  - Initialize APIClient with config from State
- [ ] Wire up cross-module event flows:
  - Editor content changes → State updates
  - Editor selection changes → State updates
  - Popup Send clicked → AI request flow
  - AI response received → update editor content
- [ ] Implement AI request workflow:
  1. Get instruction from popup
  2. Get selected code and line range from editor
  3. Show processing state in popup
  4. Call APIClient
  5. On success: update editor content, clear highlight, close popup
  6. On error: show error in popup, keep popup open
- [ ] Handle popup cancel: clear highlight, close popup

### Main Entry Point
- [ ] Create `src/main.ts`
- [ ] Import and initialize App Controller
- [ ] Add DOM ready check
- [ ] Handle initialization errors gracefully

---

## Phase 9: Testing & Polish

### Manual Testing
- [ ] Test full flow: select code → open popup → send instruction → see result
- [ ] Test with no selection (single line at cursor)
- [ ] Test with multi-line selection
- [ ] Test editor editing while popup open
- [ ] Test config panel (save, cancel)
- [ ] Test with valid API endpoint
- [ ] Test with invalid API endpoint (error handling)
- [ ] Test with invalid API key (error handling)
- [ ] Test network error scenarios
- [ ] Test mobile responsiveness on actual device
- [ ] Test ESC to close popup
- [ ] Test highlight clearing

### Bug Fixes
- [ ] Fix any bugs found during testing
- [ ] Improve error messages
- [ ] Ensure smooth animations/transitions
- [ ] Verify no console errors

### Documentation
- [ ] Update README.md with:
  - Setup instructions
  - How to configure API endpoint
  - How to use the tool
  - Example workflow
  - Screenshot/demo

---

## Notes

### Minimal Dependencies
- `typescript` (dev)
- `esbuild` (dev)
- `@codemirror/state` (runtime)
- `@codemirror/view` (runtime)
- `@codemirror/basic-setup` or minimal extensions (runtime)
- `@codemirror/lang-javascript` (runtime)

### Out of Scope for MVP
- File saving/loading
- Multiple tabs
- Keyboard shortcuts
- Advanced AI commands
- Streaming responses
- Diff view
- Dark mode
- Additional languages

These will be added iteratively after MVP is working.

---

## Current Status
**Phase**: Not Started
**Next Task**: Initialize npm project
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
