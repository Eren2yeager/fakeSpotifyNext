'use client'
import React from "react";
import { createBrowserRouter, RouterProvider} from "react-router-dom";
import Home  from "@/pages/Home.jsx";
import MainLayout from "@/pages/MainLayout.jsx"
import PlaylistOverview from "@/pages/PlaylistOverview.jsx";
import BigLeft from "@/Components/left/bigLeft.jsx";

import Search from "@/pages/search.jsx";
import AudioComponent from "@/Components/audioComponents/AudioComponent.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout  />,
    errorElement: <p>Loading...</p>,
    children: [
      { index: true, element: <Home /> },
      { path:"/home", element: <Home /> },
      { path: "/playlists", element: <BigLeft /> },
      { path: "/search", element: <Search /> },
      { path: "/playlists/:slug", element: <PlaylistOverview /> },



      
      {path:"*", element: <p className="text-center font-bold p-10">Not found 404</p>}


    ],
    
  },


   
]);


function App() {
  return (
    <>
         <RouterProvider router={router}>
           </RouterProvider>;
         <AudioComponent />
    </>
  );
}

export default App;
