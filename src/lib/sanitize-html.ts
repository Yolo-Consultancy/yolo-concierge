import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "h1", "h2", "h3", "h4",
  "ul", "ol", "li",
  "blockquote", "pre", "code", "hr",
  "a", "img",
];

const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt", "title", "class"];

export function sanitizeHtml(html: string): string {
  if (!html?.trim()) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ["target"],
  });
}

export function stripHtml(html: string): string {
  if (!html?.trim()) return "";
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).trim();
}

export function isHtmlContent(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}
