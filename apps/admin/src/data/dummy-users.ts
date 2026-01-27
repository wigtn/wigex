export type UserProvider = "local" | "google" | "apple";
export type UserStatus = "active" | "inactive" | "suspended";

export interface User {
  id: string;
  email: string;
  name: string;
  provider: UserProvider;
  status: UserStatus;
  profileImageUrl?: string;
  createdAt: string;
  lastLoginAt: string;
  tripsCount: number;
  expensesTotal: number;
}

export interface UserDetail extends User {
  trips: {
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    totalExpense: number;
  }[];
  recentExpenses: {
    id: string;
    description: string;
    amount: number;
    currency: string;
    category: string;
    date: string;
  }[];
  aiUsage: {
    ocrCount: number;
    chatCount: number;
    lastUsedAt: string;
  };
}

const names = [
  "김민준", "이서연", "박도윤", "최서아", "정예준",
  "강지우", "조수아", "윤하은", "임지호", "한지민",
  "오민서", "신유진", "황준서", "권서현", "송지아",
  "홍동하", "양시우", "문예린", "장현우", "배소민"
];

const providers: UserProvider[] = ["local", "google", "apple"];
const statuses: UserStatus[] = ["active", "active", "active", "active", "inactive", "suspended"];

function generateEmail(name: string, index: number): string {
  const domains = ["gmail.com", "naver.com", "kakao.com", "icloud.com"];
  const cleanName = name.replace(/\s/g, "").toLowerCase();
  return `user${index + 1}_${cleanName}@${domains[index % domains.length]}`;
}

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

export const dummyUsers: User[] = names.map((name, index) => ({
  id: `user-${String(index + 1).padStart(3, "0")}`,
  email: generateEmail(name, index),
  name,
  provider: providers[index % providers.length],
  status: statuses[index % statuses.length],
  profileImageUrl: index % 3 === 0 ? undefined : `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
  createdAt: randomDate(new Date("2025-06-01"), new Date("2026-01-20")),
  lastLoginAt: randomDate(new Date("2026-01-01"), new Date("2026-01-27")),
  tripsCount: Math.floor(Math.random() * 15) + 1,
  expensesTotal: Math.floor(Math.random() * 5000000) + 100000,
}));

export function getUserById(id: string): UserDetail | undefined {
  const user = dummyUsers.find(u => u.id === id);
  if (!user) return undefined;

  return {
    ...user,
    trips: Array.from({ length: user.tripsCount }, (_, i) => ({
      id: `trip-${user.id}-${i + 1}`,
      title: ["도쿄 여행", "파리 여행", "뉴욕 출장", "방콕 휴가", "오사카 여행"][i % 5],
      destination: ["Tokyo, Japan", "Paris, France", "New York, USA", "Bangkok, Thailand", "Osaka, Japan"][i % 5],
      startDate: randomDate(new Date("2025-06-01"), new Date("2026-01-15")),
      endDate: randomDate(new Date("2026-01-16"), new Date("2026-02-01")),
      totalExpense: Math.floor(Math.random() * 1000000) + 200000,
    })).slice(0, Math.min(5, user.tripsCount)),
    recentExpenses: Array.from({ length: 5 }, (_, i) => ({
      id: `expense-${user.id}-${i + 1}`,
      description: ["호텔 숙박", "항공권", "식사", "교통비", "관광지 입장료"][i % 5],
      amount: Math.floor(Math.random() * 300000) + 10000,
      currency: ["KRW", "USD", "JPY", "EUR"][i % 4],
      category: ["accommodation", "transportation", "food", "transportation", "entertainment"][i % 5],
      date: randomDate(new Date("2026-01-01"), new Date("2026-01-27")),
    })),
    aiUsage: {
      ocrCount: Math.floor(Math.random() * 50) + 5,
      chatCount: Math.floor(Math.random() * 100) + 10,
      lastUsedAt: randomDate(new Date("2026-01-20"), new Date("2026-01-27")),
    },
  };
}

export function searchUsers(
  query: string,
  provider?: UserProvider,
  status?: UserStatus
): User[] {
  return dummyUsers.filter(user => {
    const matchQuery = !query ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.name.toLowerCase().includes(query.toLowerCase());
    const matchProvider = !provider || user.provider === provider;
    const matchStatus = !status || user.status === status;
    return matchQuery && matchProvider && matchStatus;
  });
}

// Dashboard stats
export const userStats = {
  total: dummyUsers.length,
  active: dummyUsers.filter(u => u.status === "active").length,
  todaySignups: 3,
  weekSignups: 12,
  monthSignups: 45,
  byProvider: {
    local: dummyUsers.filter(u => u.provider === "local").length,
    google: dummyUsers.filter(u => u.provider === "google").length,
    apple: dummyUsers.filter(u => u.provider === "apple").length,
  },
};
