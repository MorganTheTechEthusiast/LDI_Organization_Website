export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function requiredFields(body, fields) {
  return fields.filter((field) => !body[field] || String(body[field]).trim() === "");
}
