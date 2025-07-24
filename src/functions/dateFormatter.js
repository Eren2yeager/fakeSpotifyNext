/**
 * Returns a human‑friendly time stamp:
 *   • < 5 s              → “just now”
 *   • < 60 s             → “xx seconds ago”
 *   • < 60 min           → “xx minutes ago”
 *   • < 24 h             → “xx hours ago”
 *   • < 7 days           → “xx days ago”
 *   • < 4 weeks          → “xx weeks ago”
 *   • otherwise          → “22 July, 2025”
 *
 * @param {string|number|Date} dateString – any value accepted by `new Date()`
 */
function dateFormatter(dateString) {
  const input = new Date(dateString);
  const now   = new Date();
  const diff  = now - input;                 // ms since the song was added
  const secs  = Math.floor(diff / 1000);

  // “just now”  ───────────────────────────────────────────────
  if (secs < 5) return "just now";

  // seconds / minutes / hours / days / weeks ─────────────────
  const mins  = Math.floor(secs  / 60);
  const hours = Math.floor(mins  / 60);
  const days  = Math.floor(hours / 24);
  const weeks = Math.floor(days  / 7);

  if (secs  < 60)  return `${secs} second${secs  === 1 ? "" : "s"} ago`;
  if (mins  < 60)  return `${mins} minute${mins  === 1 ? "" : "s"} ago`;
  if (hours < 24)  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days  < 7)   return `${days} day${days   === 1 ? "" : "s"} ago`;
  if (weeks < 4)   return `${weeks} week${weeks === 1 ? "" : "s"} ago`;

  // Fallback to explicit calendar date ───────────────────────
  return input.toLocaleDateString("en-GB", {
    day:   "numeric",
    month: "long",
    year:  "numeric",
  });
}

export default dateFormatter;
