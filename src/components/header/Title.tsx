import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";

const Title = () => {
  const { data: session, status } = useSession();
  const firstName = session?.user?.name?.split(" ")[0];

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const titleMap: Record<string, { title: ReactNode; subtitle: ReactNode }> = {
    "/dashboard": {
      title: (
        <>
          Welcome Back, <span className="text-accent">{firstName}!</span> 👋
        </>
      ),
      subtitle: "Today, " + formattedDate,
    },
    "/explore-interviews": {
      title: (
        <>
          Explore <span className="text-accent">Interviews</span>
        </>
      ),
      subtitle:
        "Discover real interview experiences tailored to your career goals.",
    },
    "/create-interviews": {
      title: (
        <>
          Create <span className="text-accent">Interviews</span>
        </>
      ),
      subtitle:
        "Build realistic interview experiences and share your expertise.",
    },
    "/saved-interviews": {
      title: (
        <>
          Saved <span className="text-accent">Interviews</span>
        </>
      ),
      subtitle: "Your saved interviews — ready when you are!",
    },
    "/leaderboard": {
      title: (
        <>
          <span className="text-accent">Leaderboard</span>
        </>
      ),
      subtitle: "Compete, level up, and show your skills on the leaderboard!",
    },
    "/challenges": {
      title: (
        <>
          <span className="text-accent">Challenges</span>
        </>
      ),
      subtitle:
        "Compete with your friends and see who performs best in interviews!",
    },
    "/about-us": {
      title: (
        <>
          About <span className="text-accent">PREPMATE</span>
        </>
      ),
      subtitle:
        "Empowering you to prepare smarter, perform better, and grow faster.",
    },
    "/help-center": {
      title: (
        <>
          Help <span className="text-accent">Center</span>
        </>
      ),
      subtitle:
        "Find answers, get support, and learn how to make the most of PREPMATE.",
    },
    "/settings": {
      title: (
        <>
          <span className="text-accent">Settings</span>
        </>
      ),
      subtitle: "Make PREPMATE work just the way you like.",
    },
    "/profile": {
      title: (
        <>
          <span className="text-accent">Profile</span>
        </>
      ),
      subtitle: "Your journey on PREPMATE so far.",
    },
    "/add-friends": {
      title: (
        <>
          Add<span className="text-accent"> Friends</span>
        </>
      ),
      subtitle: "Your Circle Starts Here",
    },
     "/resume-interview": {
      title: (
        <>
          Resume <span className="text-accent"> Interview</span>
        </>
      ),
      subtitle: "Upload your CV and get questions tailored to your exact experience",
    },
  };

  const pathname = usePathname();

  return (
    <div className="flex flex-col">
      <h1 className="text-primary">{titleMap[pathname]?.title}</h1>
      <p
        className={
          pathname === "/dashboard"
            ? "text-sm text-secondary border-2 border-border py-2 px-3 rounded-full w-fit"
            : "text-sm text-secondary"
        }
      >
        {titleMap[pathname]?.subtitle}
      </p>
    </div>
  );
};

export default Title;
