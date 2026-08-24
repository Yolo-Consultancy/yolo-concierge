import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Link2,
  Code2,
  ImageIcon,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type VehicleDescriptionEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

type StyleValue = "paragraph" | "heading1" | "heading2" | "heading3";

const STYLE_OPTIONS: { value: StyleValue; label: string }[] = [
  { value: "paragraph", label: "Paragraphe" },
  { value: "heading1", label: "Titre 1" },
  { value: "heading2", label: "Titre 2" },
  { value: "heading3", label: "Titre 3" },
];

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "p-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted",
        active && "bg-muted text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function VehicleDescriptionEditor({
  value,
  onChange,
  placeholder = "Décrivez le véhicule…",
}: VehicleDescriptionEditorProps) {
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[120px] px-3 py-2 focus:outline-none text-sm text-foreground",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  useEffect(() => {
    if (!editor || sourceMode) return;
    const current = editor.getHTML();
    const normalized = value || "";
    if (normalized !== current && normalized !== (current === "<p></p>" ? "" : current)) {
      editor.commands.setContent(normalized || "<p></p>", { emitUpdate: false });
    }
  }, [editor, value, sourceMode]);

  useEffect(() => {
    if (sourceMode) setSourceHtml(value);
  }, [sourceMode, value]);

  const currentStyle = (): StyleValue => {
    if (!editor) return "paragraph";
    if (editor.isActive("heading", { level: 1 })) return "heading1";
    if (editor.isActive("heading", { level: 2 })) return "heading2";
    if (editor.isActive("heading", { level: 3 })) return "heading3";
    return "paragraph";
  };

  const applyStyle = (style: StyleValue) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (style === "paragraph") chain.setParagraph().run();
    else if (style === "heading1") chain.toggleHeading({ level: 1 }).run();
    else if (style === "heading2") chain.toggleHeading({ level: 2 }).run();
    else if (style === "heading3") chain.toggleHeading({ level: 3 }).run();
  };

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImage = () => {
    if (!editor) return;
    const url = window.prompt("URL de l'image");
    if (!url?.trim()) return;
    editor.chain().focus().setImage({ src: url.trim() }).run();
  };

  const toggleSourceMode = () => {
    if (sourceMode) {
      onChange(sourceHtml.trim());
      editor?.commands.setContent(sourceHtml.trim() || "<p></p>", { emitUpdate: false });
      setSourceMode(false);
    } else {
      setSourceHtml(editor?.getHTML() ?? value);
      setSourceMode(true);
    }
  };

  return (
    <div className="rounded-md border border-input bg-background overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30">
        {!sourceMode && editor && (
          <>
            <div className="relative mr-1">
              <select
                value={currentStyle()}
                onChange={(e) => applyStyle(e.target.value as StyleValue)}
                className="appearance-none pl-2 pr-7 py-1 rounded-md text-xs font-medium bg-transparent border border-transparent hover:border-border cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            </div>

            <div className="w-px h-5 bg-border mx-0.5" />

            <ToolbarButton
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Gras"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italique"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>

            <div className="w-px h-5 bg-border mx-0.5" />

            <ToolbarButton
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Liste à puces"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Liste numérotée"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Citation"
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("codeBlock")}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Bloc de code"
            >
              <Code className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Ligne horizontale"
            >
              <Minus className="h-4 w-4" />
            </ToolbarButton>

            <div className="w-px h-5 bg-border mx-0.5" />

            <ToolbarButton active={editor.isActive("link")} onClick={setLink} title="Lien">
              <Link2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={insertImage} title="Image">
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
          </>
        )}

        <ToolbarButton active={sourceMode} onClick={toggleSourceMode} title="Code source HTML">
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {sourceMode ? (
        <textarea
          rows={6}
          value={sourceHtml}
          onChange={(e) => {
            setSourceHtml(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full min-h-[120px] px-3 py-2 text-sm font-mono bg-background focus:outline-none resize-y"
          spellCheck={false}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
