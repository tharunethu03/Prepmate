export type BadgeDef = {
  key: string;
  name: string;
  description: string;
  emoji: string;
  xpReward: number;
};

export const BADGES: BadgeDef[] = [
  {
    key: "FIRST_INTERVIEW",
    name: "First Step",
    description: "Complete your first interview",
    emoji: "🎯",
    xpReward: 50,
  },
  {
    key: "FIVE_INTERVIEWS",
    name: "On a Roll",
    description: "Complete 5 interviews",
    emoji: "🔥",
    xpReward: 100,
  },
  {
    key: "TWENTY_FIVE_INTERVIEWS",
    name: "Grinder",
    description: "Complete 25 interviews",
    emoji: "💪",
    xpReward: 200,
  },
  {
    key: "HUNDRED_INTERVIEWS",
    name: "Interview Master",
    description: "Complete 100 interviews",
    emoji: "🏆",
    xpReward: 500,
  },
  {
    key: "SCORE_80",
    name: "Sharp Mind",
    description: "Score 80% or higher on an interview",
    emoji: "⭐",
    xpReward: 75,
  },
  {
    key: "SCORE_100",
    name: "Perfect",
    description: "Score 100% on an interview",
    emoji: "💎",
    xpReward: 200,
  },
  {
    key: "FIRST_FRIEND",
    name: "Team Player",
    description: "Add your first friend",
    emoji: "👋",
    xpReward: 30,
  },
  {
    key: "FIVE_FRIENDS",
    name: "Crew",
    description: "Have 5 friends",
    emoji: "🤝",
    xpReward: 75,
  },
  {
    key: "FIRST_CHALLENGE_SENT",
    name: "Challenger",
    description: "Send your first challenge",
    emoji: "⚔️",
    xpReward: 30,
  },
  {
    key: "FIRST_CHALLENGE_ACCEPTED",
    name: "Accepted",
    description: "Accept your first challenge",
    emoji: "🛡️",
    xpReward: 30,
  },
  {
    key: "FIRST_INTERVIEW_CREATED",
    name: "Creator",
    description: "Create your first interview",
    emoji: "✍️",
    xpReward: 50,
  },
  {
    key: "TEN_INTERVIEWS_CREATED",
    name: "Prolific",
    description: "Create 10 interviews",
    emoji: "📚",
    xpReward: 150,
  },
  {
    key: "TEN_LIKES",
    name: "Loved",
    description: "Get 10 likes on an interview",
    emoji: "❤️",
    xpReward: 100,
  },
  {
    key: "PROFILE_COMPLETE",
    name: "Complete",
    description: "Complete your profile setup",
    emoji: "✅",
    xpReward: 50,
  },
  {
    key: "LEVEL_5",
    name: "Rising",
    description: "Reach level 5",
    emoji: "🥉",
    xpReward: 100,
  },
  {
    key: "LEVEL_10",
    name: "Skilled",
    description: "Reach level 10",
    emoji: "🥈",
    xpReward: 200,
  },
  {
    key: "LEVEL_20",
    name: "Expert",
    description: "Reach level 20",
    emoji: "🥇",
    xpReward: 500,
  },
];
