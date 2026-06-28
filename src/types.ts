export type Tab = 'dashboard' | 'report' | 'feed' | 'resolved';

export type IssueCategory =
  | 'Sewage Overflow'
  | 'Drainage Blockage'
  | 'Water Leakage'
  | 'Garbage'
  | 'Other';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type IssueStatus =
  | 'Reported'
  | 'AI Analyzed'
  | 'Assigned'
  | 'Work In Progress'
  | 'Work Done'
  | 'Community Verification'
  | 'Resolved';

export interface AIAnalysisResult {
  issue_detected: string;
  confidence: number;
  severity: SeverityLevel;
  visual_observations?: string[];
  reason: string;
  recommended_action: string;
  location_analysis?: string;
  community_verification_question?: string;
}

export interface AIResolutionAssessment {
  resolution_status: string;
  confidence: string | number;
  observations: string;
  visualImprovementScore: number;
  likelyResolved: 'Yes' | 'No';
  remainingVisibleIssues: string[];
  afterImageUrl?: string;
  assessedAt?: string;
}

export interface CivicReport {
  id: string;
  title: string;
  category: IssueCategory;
  aiSuggestedCategory: string;
  confidence: number;
  severity: SeverityLevel;
  visualObservations?: string[];
  reason: string;
  recommendedAction: string;
  location: string;
  locationText?: string;
  latitude?: number | null;
  longitude?: number | null;
  areaName?: string;
  zone?: string;
  description: string;
  imageUrl: string;
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
  verificationQuestion: string;
  verifications: {
    stillPresent: number;
    resolved: number;
    userVoted?: 'present' | 'resolved';
  };
  communityResolutionVote?: 'Yes, Fully Fixed' | 'No, Still Exists';
  aiResolutionAssessment?: AIResolutionAssessment;
  department: string;
}
