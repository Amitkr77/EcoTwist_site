import { Suspense } from "react";

export default function ResetLayout({ children }) {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <main>{children}</main>
      </Suspense>
    </div>
  );
}
