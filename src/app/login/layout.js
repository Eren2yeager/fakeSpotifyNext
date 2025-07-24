import React from "react";
export const metadata = {
  title: "Login - Fake Spotify",
};
function LoginLayout({ children }) {



    return <>{children}</>;
  }
 
  export default React.memo(LoginLayout)