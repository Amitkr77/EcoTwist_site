import { Suspense } from "react";

export default function OrderLayout({ children }) {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        
        <main>{children}</main>
      </Suspense>
    </div>
  );
}
