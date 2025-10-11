"use client";

import { Toaster } from "react-hot-toast";
import { Suspense } from "react";

export default function ManagerLayout({ children }) {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}></Suspense>
      <main>{children}</main>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
