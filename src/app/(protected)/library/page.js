"use client";
import React, { useState } from "react";
import BigLeft from "@/Components/left/bigLeft";
export default function Page () {
  const [activeitemForleft, setActiveitemForleft] = useState(0);

  return (
    <BigLeft
      activeItem={activeitemForleft}
      setActiveItem={setActiveitemForleft}
    />
  );
};

