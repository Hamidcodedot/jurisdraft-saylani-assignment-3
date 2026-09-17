'use client';

import React from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Undo,
  Redo,
  FilePlus2,
  PenTool,
  RotateCcw,
  Sparkles,
  Eye,
} from 'lucide-react';

interface RichTextToolbarProps {
  editor: Editor | null;
  onInsertPageBreak?: () => void;
  onResetContent?: () => void;
  isEditingEnabled: boolean;
  onToggleEditMode: () => void;
  wordCount?: number;
  charCount?: number;
}

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
  editor,
  onInsertPageBreak,
  onResetContent,
  isEditingEnabled,
  onToggleEditMode,
  wordCount,
  charCount,
}) => {
  if (!editor) return null;

  return (
    <div className="px-4 py-2 border-b border-slate-200 bg-white/95 backdrop-blur-xs flex flex-wrap items-center justify-between gap-2 text-xs no-print select-none">
      
      {/* Left Formatting Group */}
      <div className="flex items-center flex-wrap gap-1">
        
        {/* Active Mode Indicator / Toggle */}
        <button
          type="button"
          onClick={onToggleEditMode}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition mr-2 ${
            isEditingEnabled
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
          title={isEditingEnabled ? 'Switch to Paginated Print View' : 'Enable Direct In-Place Editing'}
        >
          {isEditingEnabled ? (
            <>
              <PenTool className="w-3 h-3 text-[#D4AF37]" />
              <span>Direct Edit Mode</span>
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 text-slate-500" />
              <span>Page Preview Mode</span>
            </>
          )}
        </button>

        <div className="h-4 w-[1px] bg-slate-200 mx-1" />

        {/* Text Styling */}
        <button
          type="button"
          disabled={!isEditingEnabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition ${
            editor.isActive('bold')
              ? 'bg-slate-200 text-slate-900 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={!isEditingEnabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition ${
            editor.isActive('italic')
              ? 'bg-slate-200 text-slate-900'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={!isEditingEnabled}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded transition ${
            editor.isActive('underline')
              ? 'bg-slate-200 text-slate-900'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30'
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={!isEditingEnabled}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded transition ${
            editor.isActive('strike')
              ? 'bg-slate-200 text-slate-900'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 mx-1" />

        {/* Headings */}
        <button
          type="button"
          disabled={!isEditingEnabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-1.5 py-1 rounded text-[11px] font-bold transition ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 disabled:opacity-30'
          }`}
          title="Heading 1 (Document Title)"
        >
          H1
        </button>

        <button
          type="button"
          disabled={!isEditingEnabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-1.5 py-1 rounded text-[11px] font-bold transition ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 disabled:opacity-30'
          }`}
          title="Heading 2 (Article / Section)"
        >
          H2
        </button>

        <button
          type="button"
          disabled={!isEditingEnabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-1.5 py-1 rounded text-[11px] font-bold transition ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 disabled:opacity-30'
          }`}
          title="Heading 3 (Clause / Subsection)"
        >
          H3
        </button>

        <div className="h-4 w-[1px] bg-slate-200 mx-1" />

        {/* Lists & Dividers */}
        <button
          type="button"
          disabled={!isEditingEnabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition ${
            editor.isActive('bulletList')
              ? 'bg-slate-200 text-slate-900'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30'
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={!isEditingEnabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition ${
            editor.isActive('orderedList')
              ? 'bg-slate-200 text-slate-900'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={!isEditingEnabled}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition"
          title="Horizontal Rule"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {onInsertPageBreak && (
          <button
            type="button"
            disabled={!isEditingEnabled}
            onClick={onInsertPageBreak}
            className="flex items-center gap-1 px-2 py-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 text-[11px] font-medium transition border border-transparent hover:border-slate-200"
            title="Insert Physical Sheet Page Break"
          >
            <FilePlus2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Page Break</span>
          </button>
        )}

      </div>

      {/* Right Undo / Redo / Word Count / Reset Group */}
      <div className="flex items-center gap-2">
        {wordCount !== undefined && (
          <span className="hidden sm:inline text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            {wordCount.toLocaleString()} words
          </span>
        )}

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            disabled={!editor.can().undo() || !isEditingEnabled}
            onClick={() => editor.chain().focus().undo().run()}
            className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={!editor.can().redo() || !isEditingEnabled}
            onClick={() => editor.chain().focus().redo().run()}
            className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {onResetContent && (
          <button
            type="button"
            onClick={onResetContent}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded transition border border-transparent hover:border-amber-200"
            title="Reset to default template clauses"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset</span>
          </button>
        )}
      </div>

    </div>
  );
};
