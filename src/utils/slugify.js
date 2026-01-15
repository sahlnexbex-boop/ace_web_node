export function slugify(text) {
  if (!text || typeof text !== "string") return "";

  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function deslugify(slug) {
  if (!slug) return "";
  return slug.replace(/-/g, " ");
}
