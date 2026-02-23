import InterviewClient from "./InterviewClient";

// app/interviews/[id]/page.tsx

type InterviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { id } = await params;
  console.log("Interview ID:", id);

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/interviews/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return <div>Interview not found</div>;

  const interview = await res.json();

  return <InterviewClient interview={interview} />;
}
