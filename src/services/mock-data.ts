/**
 * Mock Data for MSR Event Hub
 * Used when Cosmos DB is not available (development/testing)
 */

import { Event, Session, ProjectDefinition } from '../types/models.js';
import { UserProfile, Bookmark } from './users-service.js';

export const MOCK_EVENTS: Event[] = [
  {
    id: 'redmond-2025',
    displayName: 'MSR Redmond TAB 2025',
    description: 'Microsoft Research Redmond Technical Advisory Board meeting 2025',
    location: 'Building 99, Redmond, WA',
    startDate: '2025-01-24T09:00:00Z',
    endDate: '2025-01-24T17:00:00Z',
    imageUrl: 'https://via.placeholder.com/400x300?text=Redmond+2025',
    tags: ['MSR', 'TAB', 'Research'],
    status: 'published',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-24T08:00:00Z'
  },
  {
    id: 'india-2025',
    displayName: 'MSR India MVP Launch',
    description: 'Microsoft Research India MVP event launch and showcase',
    location: 'Bangalore, India',
    startDate: '2025-01-24T15:00:00Z',
    endDate: '2025-01-24T18:00:00Z',
    imageUrl: 'https://via.placeholder.com/400x300?text=India+MVP',
    tags: ['MVP', 'Launch', 'AI'],
    status: 'published',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-24T14:00:00Z'
  }
];

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'RRS25-SESSION-001',
    eventId: 'redmond-2025',
    title: 'AI Agents: Architecture and Best Practices',
    abstract: 'Explore the latest patterns and practices for building AI agents at scale',
    type: 'keynote',
    speakers: [
      {
        name: 'Dr. Sarah Chen',
        title: 'Principal Researcher',
        affiliation: 'Microsoft Research',
        email: 'sarahchen@microsoft.com'
      }
    ],
    date: '2025-01-24',
    time: '09:30',
    duration: 60,
    location: 'Main Auditorium',
    track: 'AI Agents',
    recordingUrl: 'https://example.com/recording/RRS25-001',
    slides: ['https://example.com/slides/RRS25-001.pdf'],
    relatedPapers: ['https://arxiv.org/abs/2405.12345'],
    relatedRepos: ['https://github.com/microsoft/autogen'],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-24T08:00:00Z'
  },
  {
    id: 'RRS25-SESSION-002',
    eventId: 'redmond-2025',
    title: 'RAI Governance and Compliance Framework',
    abstract: 'Building responsible AI systems with built-in governance',
    type: 'talk',
    speakers: [
      {
        name: 'Dr. James Park',
        title: 'Senior Researcher, RAI',
        affiliation: 'Microsoft Research',
        email: 'jamespark@microsoft.com'
      }
    ],
    date: '2025-01-24',
    time: '10:45',
    duration: 45,
    location: 'Main Auditorium',
    track: 'Responsible AI',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-24T08:00:00Z'
  },
  {
    id: 'RRS25-WORKSHOP-001',
    eventId: 'redmond-2025',
    title: 'Hands-on: Building Your First AI Agent',
    abstract: 'Workshop: Learn to build and deploy a simple AI agent',
    type: 'workshop',
    speakers: [
      {
        name: 'Engineer Team',
        title: 'Developer Relations',
        affiliation: 'Microsoft Research'
      }
    ],
    date: '2025-01-24',
    time: '13:30',
    duration: 120,
    location: 'Room 201',
    track: 'Hands-on',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-24T08:00:00Z'
  },
  {
    id: 'INDIA-SESSION-001',
    eventId: 'india-2025',
    title: 'MVP Showcase: Event Discovery with AI Agents',
    abstract: 'See the AI agent in action discovering events at MSR India',
    type: 'keynote',
    speakers: [
      {
        name: 'Priya Sharma',
        title: 'Lead Researcher',
        affiliation: 'MSR India'
      }
    ],
    date: '2025-01-24',
    time: '15:00',
    duration: 30,
    location: 'Main Hall',
    track: 'MVP Launch',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-24T14:00:00Z'
  }
];

export const MOCK_PROJECTS: ProjectDefinition[] = [
  {
    id: 'proj-001',
    eventId: 'redmond-2025',
    title: 'Autonomous Research Agent Framework',
    abstract: 'A framework for building autonomous agents that can conduct research independently',
    description: 'This project presents a novel framework enabling AI agents to autonomously conduct research by gathering data, analyzing findings, and reporting results',
    theme: 'AI Systems',
    team: [
      {
        name: 'Dr. Alice Johnson',
        title: 'Project Lead',
        affiliation: 'MSR'
      },
      {
        name: 'Bob Liu',
        title: 'Engineer',
        affiliation: 'MSR'
      }
    ],
    primaryContact: {
      name: 'Dr. Alice Johnson',
      title: 'Project Lead',
      email: 'alice@microsoft.com'
    },
    image: 'https://via.placeholder.com/600x400?text=Research+Agent',
    relatedLinks: [
      {
        title: 'GitHub Repository',
        url: 'https://github.com/microsoft/research-agent',
        type: 'code'
      },
      {
        title: 'Research Paper',
        url: 'https://arxiv.org/abs/2405.12345',
        type: 'paper'
      }
    ],
    maturitySignal: 'pilot-ready',
    status: 'published',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-24T08:00:00Z'
  }
];

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-001',
    email: 'alice@microsoft.com',
    displayName: 'Dr. Alice Johnson',
    department: 'Microsoft Research',
    role: 'admin',
    avatar: 'https://via.placeholder.com/100x100?text=Alice',
    bio: 'Principal researcher in AI systems and autonomous agents',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-24T08:00:00Z'
  },
  {
    id: 'user-002',
    email: 'bob@microsoft.com',
    displayName: 'Bob Liu',
    department: 'Microsoft Research',
    role: 'curator',
    avatar: 'https://via.placeholder.com/100x100?text=Bob',
    bio: 'Software engineer focused on AI agent frameworks',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-24T08:00:00Z'
  },
  {
    id: 'user-003',
    email: 'priya@microsoft.com',
    displayName: 'Priya Sharma',
    department: 'MSR India',
    role: 'curator',
    avatar: 'https://via.placeholder.com/100x100?text=Priya',
    bio: 'Lead researcher at Microsoft Research India',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-24T08:00:00Z'
  },
  {
    id: 'user-004',
    email: 'attendee@microsoft.com',
    displayName: 'Sarah Mitchell',
    department: 'Product Engineering',
    role: 'user',
    avatar: 'https://via.placeholder.com/100x100?text=Sarah',
    bio: 'Product engineer interested in AI research',
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-01-24T08:00:00Z'
  }
];

export const MOCK_BOOKMARKS: Bookmark[] = [
  {
    id: 'bookmark-001',
    userId: 'user-002',
    entityId: 'RRS25-SESSION-001',
    entityType: 'session',
    eventId: 'redmond-2025',
    notes: 'Great insights on agent architecture patterns',
    tags: ['favorite', 'ai-agents'],
    createdAt: '2025-01-24T09:35:00Z',
    savedAt: '2025-01-24T09:35:00Z'
  },
  {
    id: 'bookmark-002',
    userId: 'user-002',
    entityId: 'proj-001',
    entityType: 'project',
    notes: 'Relevant to our current research direction',
    tags: ['research', 'agents'],
    createdAt: '2025-01-24T10:15:00Z',
    savedAt: '2025-01-24T10:15:00Z'
  },
  {
    id: 'bookmark-003',
    userId: 'user-004',
    entityId: 'redmond-2025',
    entityType: 'event',
    notes: 'Planning to attend this event',
    tags: ['attend'],
    createdAt: '2025-01-20T15:30:00Z',
    savedAt: '2025-01-20T15:30:00Z'
  },
  {
    id: 'bookmark-004',
    userId: 'user-004',
    entityId: 'RRS25-WORKSHOP-001',
    entityType: 'session',
    eventId: 'redmond-2025',
    notes: 'Must attend - hands-on learning opportunity',
    tags: ['workshop', 'learning'],
    createdAt: '2025-01-22T14:00:00Z',
    savedAt: '2025-01-22T14:00:00Z'
  }
];
