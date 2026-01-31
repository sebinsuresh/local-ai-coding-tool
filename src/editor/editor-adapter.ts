import { EditorState, StateField, StateEffect, RangeSet } from '@codemirror/state';
import { EditorView, Decoration, DecorationSet } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { SelectionInfo } from '../types/state';

const addHighlight = StateEffect.define<{from: number, to: number}>();
const clearHighlight = StateEffect.define<null>();

const highlightDecoration = Decoration.mark({ class: 'cm-highlight' });

const highlightField = StateField.define<DecorationSet>({
    create() { return Decoration.none },
    update(highlights, tr) {
        highlights = highlights.map(tr.changes);
        for (let e of tr.effects) {
            if (e.is(addHighlight)) {
                highlights = Decoration.set([highlightDecoration.range(e.value.from, e.value.to)]);
            } else if (e.is(clearHighlight)) {
                highlights = Decoration.none;
            }
        }
        return highlights;
    },
    provide: f => EditorView.decorations.from(f)
});

export interface IEditor {
    setContent(content: string): void;
    getContent(): string;
    getSelection(): SelectionInfo | null;
    setHighlight(from: number, to: number): void;
    clearHighlight(): void;
    focus(): void;
    onContentChange(callback: (content: string) => void): void;
    onSelectionChange(callback: (selection: SelectionInfo | null) => void): void;
}

export class EditorAdapter implements IEditor {
    private view: EditorView;
    private isProgrammaticUpdate = false;

    constructor(container: HTMLElement) {
        this.view = new EditorView({
            state: EditorState.create({
                doc: '',
                extensions: [
                    basicSetup,
                    javascript(),
                    highlightField,
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged && !this.isProgrammaticUpdate) {
                            this.contentChangeCallback?.(update.state.doc.toString());
                        }
                        if (update.selectionSet) {
                            this.selectionChangeCallback?.(this.getSelection());
                        }
                    })
                ]
            }),
            parent: container
        });
    }

    private contentChangeCallback?: (content: string) => void;
    private selectionChangeCallback?: (selection: SelectionInfo | null) => void;

    public setContent(content: string): void {
        this.isProgrammaticUpdate = true;
        this.view.dispatch({
            changes: { from: 0, to: this.view.state.doc.length, insert: content }
        });
        this.isProgrammaticUpdate = false;
    }

    public getContent(): string {
        return this.view.state.doc.toString();
    }

    public getSelection(): SelectionInfo | null {
        const { from, to } = this.view.state.selection.main;
        if (from === to && !this.view.hasFocus) return null;

        const text = this.view.state.sliceDoc(from, to);
        const fromLine = this.view.state.doc.lineAt(from).number;
        const toLine = this.view.state.doc.lineAt(to).number;

        return { from, to, fromLine, toLine, text };
    }

    public setHighlight(from: number, to: number): void {
        this.view.dispatch({
            effects: addHighlight.of({ from, to })
        });
    }

    public clearHighlight(): void {
        this.view.dispatch({
            effects: clearHighlight.of(null)
        });
    }

    public focus(): void {
        this.view.focus();
    }

    public onContentChange(callback: (content: string) => void): void {
        this.contentChangeCallback = callback;
    }

    public onSelectionChange(callback: (selection: SelectionInfo | null) => void): void {
        this.selectionChangeCallback = callback;
    }
}
