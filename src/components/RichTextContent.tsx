import { sanitizeHtml, isHtmlContent } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";

type RichTextContentProps = {
  html: string;
  className?: string;
  emptyFallback?: string;
};

export function RichTextContent({ html, className, emptyFallback }: RichTextContentProps) {
  const trimmed = html?.trim() ?? "";

  if (!trimmed) {
    return emptyFallback ? <p className={className}>{emptyFallback}</p> : null;
  }

  if (!isHtmlContent(trimmed)) {
    return <p className={className}>{trimmed}</p>;
  }

  const safe = sanitizeHtml(trimmed);
  if (!safe.trim()) {
    return emptyFallback ? <p className={className}>{emptyFallback}</p> : null;
  }

  return (
    <div
      className={cn(
        "rich-text prose prose-sm max-w-none text-(--yolo-muted) leading-relaxed",
        "[&_a]:text-or-bronze [&_a]:underline [&_img]:rounded-lg [&_img]:my-3",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
