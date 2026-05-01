import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

// ─── Botón de la barra de herramientas ───────────────────────
function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${
        active
          ? 'bg-green-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

// ─── Editor principal ─────────────────────────────────────────
export default function RichEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    onUpdate({ editor }) {
      // Devuelve HTML al padre — si está vacío devuelve ''
      const html = editor.isEmpty ? '' : editor.getHTML()
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[80px] px-3 py-2.5 text-sm text-gray-900',
      },
    },
  })

  // Sincroniza si el valor externo cambia (al abrir modal de edición)
  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || '')
    }
  }, [value])

  if (!editor) return null

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
      {/* Barra de herramientas */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Negrita (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Cursiva (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Tachado"
        >
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </ToolbarBtn>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Lista"
        >
          ☰
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          1.
        </ToolbarBtn>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Cita"
        >
          "
        </ToolbarBtn>

        <div className="flex-1" />

        {/* Botón limpiar formato */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          active={false}
          title="Limpiar formato"
        >
          ✕
        </ToolbarBtn>
      </div>

      {/* Área de texto */}
      <div className="bg-white relative">
        {editor.isEmpty && placeholder && (
          <p className="absolute top-2.5 left-3 text-gray-400 text-sm pointer-events-none select-none">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
