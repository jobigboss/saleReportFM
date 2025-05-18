import React, { Suspense } from "react";
import Container from "../components/Container";
import PageClient from "./PageClient";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

function LoadingLottie() {
  const [animationData, setAnimationData] = React.useState(null);

  React.useEffect(() => {
    const load = async () => {
      const res = await fetch("/lottie/foremost-delivery.json");
      const data = await res.json();
      setAnimationData(data);
    };
    load();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-[#0076CE]">
      {animationData && (
        <Lottie animationData={animationData} loop className="w-150 h-150 mb-4" />
      )}
    </div>
  );
}

export default function SaleReportsPage() {
  return (
    <Container>
      <Suspense fallback={<LoadingLottie />}>
        <PageClient />
      </Suspense>
    </Container>
  );
}
