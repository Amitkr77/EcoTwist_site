"use client";

import Script from "next/script";

export default function GoogleAnalytics() {
  return (
    <>
      {/* Load gtag.js */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-5CPVWVZ880"
        strategy="afterInteractive"
      />

      {/* Initialize Google Analytics */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-5CPVWVZ880');
        `}
      </Script>
    </>
  );
}
