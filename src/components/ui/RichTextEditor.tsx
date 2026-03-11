'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'px-2 py-1 text-xs rounded border transition-colors',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5',
        active ? 'border-gold-300 bg-gold-50 text-gold-700' : 'border-ink-300 text-ink-700 hover:bg-ink-50',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    // Prevent SSR/hydration mismatches in Next.js
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: [
          'ProseMirror',
          'min-h-[140px] w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900',
          'focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent',
        ].join(' '),
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  // Keep editor in sync when switching between records
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const next = value || ''
    if (current !== next) editor.commands.setContent(next, false)
  }, [editor, value])

  useEffect(() => {
    if (!editor || !placeholder) return
    editor.setOptions({
      editorProps: {
        ...editor.options.editorProps,
        attributes: {
          ...editor.options.editorProps?.attributes,
          'data-placeholder': placeholder,
        },
      },
    })
  }, [editor, placeholder])

  if (!editor) return null

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        >
          Bold
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          Italic
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
        >
          Underline
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        >
          Bullets
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        >
          Numbered
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
        >
          Quote
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const previous = editor.getAttributes('link').href as string | undefined
            const url = window.prompt('Link URL', previous || 'https://')
            if (!url) return
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
          }}
          active={editor.isActive('link')}
        >
          Link
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
        >
          Unlink
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          Clear
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

