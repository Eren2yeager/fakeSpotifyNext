/**
 * Formats a number into a shorthand string (e.g., 1.2K, 3.4M, 5B).
 * @param {number} value - The number to format.
 * @returns {string} The formatted shorthand string.
 */
function valueFormator(value) {
  if (typeof value !== "number" || isNaN(value)) return "0";
  if (value < 1000) return value.toString();

  const units = [
    { value: 1e9, symbol: "B" },
    { value: 1e6, symbol: "M" },
    { value: 1e3, symbol: "K" },
  ];

  for (let i = 0; i < units.length; i++) {
    if (value >= units[i].value) {
      let formatted = (value / units[i].value).toFixed(1);
      // Remove trailing .0
      if (formatted.endsWith(".0")) {
        formatted = formatted.slice(0, -2);
      }
      return `${formatted}${units[i].symbol}`;
    }
  }
  return value.toString();
}

export default valueFormator;
