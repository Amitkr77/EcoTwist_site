"use client";

import { Toaster } from "react-hot-toast";

export default function AdminLayout({ children }) {
  return (
    <div>
      <main>{children}</main>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
