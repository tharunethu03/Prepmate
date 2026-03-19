import { Suspense } from "react";
import PublicProfilePage from "./publicProfilePage";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <PublicProfilePage />
    </Suspense>
  );
}