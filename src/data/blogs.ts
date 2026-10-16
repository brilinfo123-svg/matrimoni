import {
  FiHeart,
  FiUsers,
  FiMessageCircle,
  FiShield,
} from "react-icons/fi";

export type Blog = {
  id: number;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string[];
  icon: typeof FiHeart;
  theme: "rose" | "lavender" | "peach" | "mint";
  featured?: boolean;
};

export const blogs: Blog[] = [
  {
    id: 1,
    slug: "building-a-strong-relationship-before-marriage",
    category: "Relationships",
    title: "Building a Strong Relationship Before Marriage",
    excerpt:
      "Discover how honest communication, shared values, and mutual respect can create a strong foundation for a lasting partnership.",
    readTime: "6 min read",
    date: "Relationship Guide",
    icon: FiHeart,
    theme: "rose",
    featured: true,
    content: [
      "A strong relationship begins with understanding, trust, and a willingness to learn about each other. Before marriage, give yourselves time to discover what matters most to both of you.",
      "Honest communication helps partners share their expectations, discuss concerns, and express their feelings without fear of judgment. Listening is just as important as speaking.",
      "Discuss important topics such as family values, career ambitions, finances, lifestyle, and future plans. These conversations help you understand whether your goals are compatible.",
      "Respecting differences is essential. You may not agree on everything, but kindness, patience, and a willingness to compromise can help you navigate challenges together.",
      "A meaningful partnership is built through consistent effort. Focus on trust, emotional support, shared values, and creating a future in which both partners feel respected.",
    ],
  },
  {
    id: 2,
    slug: "how-to-find-a-compatible-life-partner",
    category: "Partner Search",
    title: "How to Find a Compatible Life Partner",
    excerpt:
      "Learn how to identify the values, goals, and qualities that matter most when searching for your life partner.",
    readTime: "5 min read",
    date: "Partner Search",
    icon: FiUsers,
    theme: "lavender",
    content: [
      "Finding a compatible life partner is about more than matching interests. It is about discovering someone whose values, expectations, and vision for the future complement your own.",
      "Start by identifying your priorities. Consider your family values, career goals, preferred lifestyle, and the qualities that help you feel understood and supported.",
      "When getting to know someone, ask thoughtful questions and pay attention to how they communicate, treat others, and respond to different opinions.",
      "Be honest about your own expectations too. Clear communication can help both people decide whether they are comfortable moving forward.",
      "Remember that compatibility does not mean being identical. Mutual respect, emotional maturity, trust, and a willingness to grow together can make a meaningful difference.",
    ],
  },
  {
    id: 3,
    slug: "questions-to-ask-before-saying-yes",
    category: "Marriage Advice",
    title: "Questions to Ask Before Saying Yes",
    excerpt:
      "Meaningful conversations about expectations, career goals, family, and lifestyle can help you make an informed decision.",
    readTime: "7 min read",
    date: "Marriage Guide",
    icon: FiMessageCircle,
    theme: "peach",
    content: [
      "Deciding whether to marry someone is an important choice. Taking time to discuss expectations can help both partners understand each other before making a commitment.",
      "Talk about your long-term goals, career plans, financial habits, and preferred living arrangements. Understanding these areas early can prevent misunderstandings later.",
      "Discuss family involvement, cultural traditions, responsibilities at home, and the boundaries that matter to each of you.",
      "Ask how each person approaches disagreements and what support looks like during difficult times. Emotional safety is an important part of a lasting partnership.",
      "There is no perfect list of questions. The aim is to create an open conversation in which both people feel comfortable sharing their hopes, concerns, and expectations.",
    ],
  },
  {
    id: 4,
    slug: "staying-safe-while-meeting-people-online",
    category: "Safety & Privacy",
    title: "Staying Safe While Meeting People Online",
    excerpt:
      "Practical ways to protect your personal information, recognize warning signs, and build trust at a comfortable pace.",
    readTime: "5 min read",
    date: "Safety Guide",
    icon: FiShield,
    theme: "mint",
    content: [
      "Online platforms can help you meet new people, but protecting your privacy should always be a priority.",
      "Avoid sharing sensitive information such as passwords, financial details, identity documents, or your home address with someone you have not established trust with.",
      "Be cautious if someone asks for money, pressures you to move conversations off-platform, or avoids reasonable questions about their identity.",
      "When meeting in person for the first time, choose a public location, arrange your own transportation, and let someone you trust know your plans.",
      "Take your time. You can block or report accounts that make you uncomfortable, and you never need to continue a conversation that does not feel right.",
    ],
  },
  {
    id: 5,
    slug: "understanding-family-expectations-in-marriage",
    category: "Family & Lifestyle",
    title: "Understanding Family Expectations in Marriage",
    excerpt:
      "Explore respectful ways to discuss family traditions, personal boundaries, and expectations for your future together.",
    readTime: "6 min read",
    date: "Lifestyle",
    icon: FiUsers,
    theme: "lavender",
    content: [
      "Family can play an important role in a marriage, particularly when traditions and expectations are meaningful to both partners.",
      "Talk openly about how involved you expect your families to be in major decisions, celebrations, and everyday life.",
      "Discuss personal boundaries respectfully. A healthy balance allows couples to value their families while also building their own identity together.",
      "Differences in traditions or expectations do not need to become conflicts. Listen to each other's perspectives and look for solutions that respect both partners.",
      "The goal is to build a supportive relationship in which family connections and the couple's shared future can coexist with mutual understanding.",
    ],
  },
  {
    id: 6,
    slug: "importance-of-communication-in-a-relationship",
    category: "Relationships",
    title: "The Importance of Communication in a Relationship",
    excerpt:
      "Learn how active listening, empathy, and open conversations can help two people understand each other better.",
    readTime: "4 min read",
    date: "Relationship Guide",
    icon: FiHeart,
    theme: "rose",
    content: [
      "Good communication helps partners understand each other's feelings, expectations, and needs. It creates space for trust and emotional connection to grow.",
      "Active listening means giving your partner your attention without immediately interrupting or preparing a response. Try to understand their perspective before offering your own.",
      "Use calm, respectful language when discussing difficult topics. Explaining how you feel is often more productive than assigning blame.",
      "Not every conversation needs an immediate solution. Sometimes, offering empathy and support is the most helpful response.",
      "With patience and regular communication, couples can handle disagreements more constructively and build a stronger connection over time.",
    ],
  },
];
