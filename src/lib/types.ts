export type Student = {
  id: string;
  name: string;
};

export type RankEntry = {
  studentId: string;
  rank: number;
  comment: string;
};

export type Submission = {
  id: string;
  raterId: string;
  rankings: RankEntry[];
  submittedAt: string;
  updatedAt: string;
};

export type ClassSession = {
  id: string;
  code: string;
  name: string;
  teacherPin: string;
  students: Student[];
  submissions: Submission[];
  createdAt: string;
};

export type PublicClass = {
  code: string;
  name: string;
  students: Student[];
  submittedRaterIds: string[];
};

export type PeerFeedback = {
  fromId: string;
  from: string;
  rank: number;
  comment: string;
};

export type RankStats = {
  count: number;
  mean: number | null;
  sd: number | null;
  min: number | null;
  max: number | null;
  median: number | null;
};

export type StudentSummary = {
  studentId: string;
  name: string;
  averageRank: number | null;
  rankCount: number;
  stats: RankStats;
  /** Every peer ranking received, including empty comments */
  feedback: PeerFeedback[];
  comments: PeerFeedback[];
};

export type ResultsPayload = {
  code: string;
  name: string;
  students: Student[];
  submissions: {
    raterId: string;
    raterName: string;
    submittedAt: string;
    rankings: RankEntry[];
  }[];
  summaries: StudentSummary[];
};
