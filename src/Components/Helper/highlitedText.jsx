
function HighlightText(text, query) {
    if (!query) return text;
  
    const regex = new RegExp(`(${query})`, "gi"); // case-insensitive match
    const parts = text.split(regex);
  
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-blue-600 font-semibold rounded-[2px]">
          {part}
        </span>
      ) : (
        part
      )
    );
  }

  export default HighlightText;
  

