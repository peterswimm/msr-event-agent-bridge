/**
 * Shared type definitions for MSR Event Hub
 * These types are used across ShowcaseApp, Bridge, and MSR Event Hub
 */

export interface Event {
  id: string;
  displayName: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  eventId: string;
  title: string;
  abstract?: string;
  type: 'talk' | 'keynote' | 'workshop' | 'panel' | 'lightning-talk';
  speakers: Person[];
  date: string;
  time: string;
  duration: number; // minutes
  location?: string;
  track?: string;
  recordingUrl?: string;
  slides?: string[];
  relatedPapers?: string[];
  relatedRepos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDefinition {
  id: string;
  eventId: string;
  title: string;
  abstract: string;
  description?: string;
  theme?: string;
  team: Person[];
  primaryContact?: Person;
  image?: string;
  poster?: string;
  video?: string;
  relatedLinks: RelatedLink[];
  knowledgeArtifacts?: KnowledgeArtifact[];
  compiledSummary?: ProjectSummary;
  maturitySignal: 'exploratory' | 'validated' | 'pilot-ready';
  status: 'draft' | 'submitted' | 'approved' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id?: string;
  name: string;
  title?: string;
  affiliation?: string;
  email?: string;
  profileUrl?: string;
  image?: string;
}

export interface RelatedLink {
  title: string;
  url: string;
  type: 'code' | 'paper' | 'slide' | 'demo' | 'dataset' | 'other';
}

export interface KnowledgeArtifact {
  id: string;
  sourceType: 'paper' | 'talk' | 'repo';
  sourceId: string;
  title: string;
  primaryClaimCapabilities: string[];
  keyMethodsApproach: string[];
  limitationsConstraints: string[];
  extractedAt: string;
}

export interface ProjectSummary {
  whatsNew: string;
  evidenceAndExamples: string[];
  nextSteps: string[];
  keyInsights: string[];
  faq: FAQEntry[];
}

export interface FAQEntry {
  question: string;
  answer: string;
  source?: string;
}

export interface ApiResponse<T> {
  value: T[] | T;
  '@odata.context': string;
  '@odata.etag'?: string;
  error?: {
    code: string;
    message: string;
    details?: Array<{ code: string; message: string }>;
  };
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
}

export interface AuthContext {
  user: User;
  token: string;
  scopes: string[];
  expiresAt: number;
}
