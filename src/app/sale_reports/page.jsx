import React, { Suspense } from "react";
import Container from "../components/Container";
import PageClient from "./PageClient"; // ✅ component ที่ใช้ useSearchParams

export default function SaleReportsPage() {
  return (
    <Container>
      <Suspense fallback={<p className="text-center mt-10">🔄 กำลังโหลดข้อมูล...</p>}>
        <PageClient />
      </Suspense>
    </Container>
  );
}
