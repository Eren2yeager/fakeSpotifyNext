"use client";
import React, { useState } from "react";
import BigLeft from "@/Components/left/bigLeft";
const page = () => {
  const [activeitemForleft, setActiveitemForleft] = useState(0);

  return (
    <BigLeft
      activeItem={activeitemForleft}
      setActiveItem={setActiveitemForleft}
    />
  );
};

export default React.memo(page);
