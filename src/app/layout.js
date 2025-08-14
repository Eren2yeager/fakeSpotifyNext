import "@/styles/index.css";
import "@/styles/scrollbar.css";
import Script from "next/script";
import Providers from "./Providers";

export const metadata = {
  title: "Fake Spotify",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://cdn.lordicon.com/lordicon.js" strategy="beforeInteractive" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body className="relative m-0 p-0 w-[100vw] h-[100vh] bg-black overflow-clip">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}