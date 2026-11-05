'use client';

import React, { useEffect, useRef } from 'react';
import {
  Bold,
  Code,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  RemoveFormatting,
  Underline,
} from 'lucide-react';
import { sanitizeHtml, stripHtml } from '../utils/product';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  invalid?: boolean;
  id?: string;
  ariaDescribedBy?: string;
}

interface ToolbarAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  command: string;
  value?: string;
}

const toolbarActions: ToolbarAction[] = [
  { label: 'Bold', icon: Bold, command: 'bold' },
  { label: 'Italic', icon: Italic, command: 'italic' },
  { label: 'Underline', icon: Underline, command: 'underline' },
  { label: 'Heading', icon: Heading2, command: 'formatBlock', value: 'h2' },
  { label: 'Bulleted list', icon: List, command: 'insertUnorderedList' },
  { label: 'Numbered list', icon: ListOrdered, command: 'insertOrderedList' },
  { label: 'Quote', icon: Quote, command: 'formatBlock', value: 'blockquote' },
  { label: 'Code block', icon: Code, command: 'formatBlock', value: 'pre' },
];

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder = 'Write a compelling product description...',
  invalid = false,
  id,
  ariaDescribedBy,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isEmpty = stripHtml(value).length === 0;

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (document.activeElement === editor) return;

    if (editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  const syncValue = () => {
    const editor = editorRef.current;
    if (!editor) return;
    onChange(editor.innerHTML);
  };

  const runCommand = (command: string, commandValue?: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    document.execCommand(command, false, commandValue);
    syncValue();
  };

  const handleLink = () => {
    const url = window.prompt('Enter a link URL (https://, http://, mailto:, or /path)');
    if (!url) return;

    const trimmed = url.trim();
    const isSafe =
      trimmed.startsWith('https://') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('mailto:') ||
      trimmed.startsWith('/');

    if (!isSafe) {
      window.alert('Use a safe URL starting with https://, http://, mailto:, or /.');
      return;
    }

    runCommand('createLink', trimmed);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    const html = event.clipboardData.getData('text/html');
    const text = event.clipboardData.getData('text/plain');

    if (html) {
      document.execCommand('insertHTML', false, sanitizeHtml(html));
    } else {
      document.execCommand('insertText', false, text);
    }

    syncValue();
  };

  const handleBlur = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const clean = sanitizeHtml(editor.innerHTML);
    if (editor.innerHTML !== clean) {
      editor.innerHTML = clean;
    }
    onChange(clean);
    onBlur?.();
  };

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-white transition ${
        invalid
          ? 'border-red-300 focus-within:ring-2 focus-within:ring-red-500/15'
          : 'border-[#e8e6e3] focus-within:border-[#ff4600] focus-within:ring-2 focus-within:ring-[#ff4600]/15'
      }`}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#f0eeeb] bg-[#faf9f6] px-2 py-1.5">
        {toolbarActions.map((action) => (
          <button
            key={action.label}
            type="button"
            title={action.label}
            aria-label={action.label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(action.command, action.value)}
            className="rounded p-1.5 text-neutral-500 transition hover:bg-white hover:text-neutral-900"
          >
            <action.icon className="h-3.5 w-3.5" />
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-neutral-200" />
        <button
          type="button"
          title="Insert link"
          aria-label="Insert link"
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleLink}
          className="rounded p-1.5 text-neutral-500 transition hover:bg-white hover:text-neutral-900"
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Clear formatting"
          aria-label="Clear formatting"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runCommand('removeFormat')}
          className="rounded p-1.5 text-neutral-500 transition hover:bg-white hover:text-neutral-900"
        >
          <RemoveFormatting className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="relative">
        {isEmpty && (
          <span className="pointer-events-none absolute left-3 top-3 text-sm text-neutral-400">{placeholder}</span>
        )}
        <div
          ref={editorRef}
          id={id}
          role="textbox"
          aria-multiline="true"
          aria-invalid={invalid}
          aria-describedby={ariaDescribedBy}
          contentEditable
          suppressContentEditableWarning
          onInput={syncValue}
          onPaste={handlePaste}
          onBlur={handleBlur}
          className="prose prose-sm min-h-44 max-w-none px-3 py-3 text-sm leading-relaxed text-neutral-800 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between border-t border-[#f0eeeb] bg-[#faf9f6] px-3 py-1.5 text-[10px] text-neutral-400">
        <span>Formatting is sanitized before saving.</span>
        <span>{stripHtml(value).length} characters</span>
      </div>
    </div>
  );
}
