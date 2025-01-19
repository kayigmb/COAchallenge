import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactQueryProvider from "@/app/ReactQueryProvider";

export const metadata: Metadata = {
  title: "Wallet App",
  description: "Wallet app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <ToastContainer
          limit={6}
          position="top-right"
          autoClose={2000}
          hideProgressBar={true}
          closeOnClick={true}
          pauseOnHover={true}
          draggable={true}
          pauseOnFocusLoss={false}
        />
      </body>
    </html>
  );
}
