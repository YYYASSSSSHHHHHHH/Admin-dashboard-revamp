import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";

const ToolbarBtn = ({ active, onClick, title, children, disabled, testid }) => (
  <button
    type="button"
    data-testid={testid}
    title={title}
    disabled={disabled}
    onClick={onClick}
    className={`h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors ${
      active ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white" : ""
    } disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600`}
  >
    {children}
  </button>
);

const Toolbar = ({ editor }) => {
  const promptLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  return (
    <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b border-slate-200 bg-slate-50/60">
      <ToolbarBtn
        testid="rt-bold"
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        testid="rt-italic"
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        testid="rt-underline"
        title="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        testid="rt-strike"
        title="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarBtn>

      <span className="h-5 w-px bg-slate-200 mx-1" />

      <ToolbarBtn
        testid="rt-h1"
        title="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        testid="rt-h2"
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarBtn>

      <span className="h-5 w-px bg-slate-200 mx-1" />

      <ToolbarBtn
        testid="rt-bulletlist"
        title="Bullet List"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        testid="rt-orderedlist"
        title="Numbered List"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        testid="rt-quote"
        title="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        testid="rt-link"
        title="Link"
        active={editor.isActive("link")}
        onClick={promptLink}
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </ToolbarBtn>

      <span className="h-5 w-px bg-slate-200 mx-1" />

      <ToolbarBtn
        testid="rt-undo"
        title="Undo"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        testid="rt-redo"
        title="Redo"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo className="h-3.5 w-3.5" />
      </ToolbarBtn>
    </div>
  );
};

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write your message…",
  onEditorReady,
  minHeight = 220,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor: ed }) => onChange?.(ed.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none",
      },
    },
  });

  // Sync external value changes (e.g. template auto-fill)
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor);
  }, [editor, onEditorReady]);

  if (!editor) return null;

  return (
    <div
      data-testid="rich-text-editor"
      className="border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100 transition-all"
    >
      <Toolbar editor={editor} />
      <div className="px-3 py-2.5 overflow-y-auto" style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
