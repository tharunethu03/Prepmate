import { Suspense } from "react";
import ExplorePage from "./explorePage"; // rename the component file

export default function Page() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center h-screen" />}
    >
      <ExplorePage />
    </Suspense>
  );
}
