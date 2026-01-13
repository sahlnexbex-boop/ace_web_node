export function slugify(text) {
  if (!text || typeof text !== "string") return "";

  return text
    .toLowerCase()
    .trim()
    .replace(/[_\W]+/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function deslugify(slug) {
  if (!slug) return "";
  return slug.replace(/-/g, " ").toLowerCase();
}