import React, { Suspense } from "react";
import Container from "../components/Container";
import PageClient from "./PageClient";

export default function SaleReportsPage() {
  return (
    <Container>
      <Suspense fallback={<p className="text-center mt-10">🔄 กำลังโหลด...</p>}>
        <PageClient />
      </Suspense>
    </Container>
  );
}
