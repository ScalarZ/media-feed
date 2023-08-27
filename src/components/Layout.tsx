import React from "react";
import { Inter } from "next/font/google";
import { Toaster } from "./ui/toaster";
import CreatePostProvider from "@/context/CreatePostProvider";
import UpdatePostProvider from "@/context/UpdatePostProvider";
import Header from "./Header";

const inter = Inter({ subsets: ["latin"] });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CreatePostProvider>
      <UpdatePostProvider>
        <div className={`mx-auto min-h-screen max-w-md ${inter.className}`}>
          <Header />
          {children}
          <Toaster />
        </div>
      </UpdatePostProvider>
    </CreatePostProvider>
  );
}
