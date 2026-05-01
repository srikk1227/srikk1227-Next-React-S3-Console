"use client";
import ProductionError from "@/components/ProductionError";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <ProductionError error={error} reset={reset} />
      </body>
    </html>
  );
} 