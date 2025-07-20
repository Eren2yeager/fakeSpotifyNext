function dateFormatter(dateString) {
    let date = new Date(dateString).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })

     return date
}

export default dateFormatter;