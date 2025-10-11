import { Suspense } from "react";

export default function SignupLayout({ children }) {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        
        <main className="mt-7">{children}</main>
      </Suspense>
    </div>
  );
}
