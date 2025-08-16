function parseLRC(lrcText) {
    const lines = lrcText.split("\n");
    const result = [];
    const timeExp = /\[(\d{1,2}):(\d{2})(\.\d{1,2})?\]/;
  
    lines.forEach(line => {
      const match = timeExp.exec(line);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const fraction = match[3] ? parseFloat(match[3]) : 0;
        const time = minutes * 60 + seconds + fraction;
        const lyricText = line.replace(timeExp, "").trim();
        if (lyricText) result.push({ time, line: lyricText });
      }
    });
  
    return result;
  }
  
  export default parseLRC;