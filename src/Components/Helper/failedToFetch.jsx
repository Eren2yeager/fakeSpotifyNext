import React from "react";

const FailedToFetch = () => {
  return (
    <div className="font-extrabold flex flex-col justify-center items-center">
      <div>
        <lord-icon
          src="https://cdn.lordicon.com/lltgvngb.json"
          trigger="loop"
          stroke="bold"
          delay="3000"
          colors="primary:#e83a30,secondary:#545454"
          style={{ width: "200px", height: "200px" }}
        ></lord-icon>


      </div>
      <p>Failed to Fetch Server Data !</p>
    </div>
  );
};

export default React.memo(FailedToFetch);
