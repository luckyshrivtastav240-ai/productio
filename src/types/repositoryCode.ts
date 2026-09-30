/**
 * Aetheris / NexusStream Media Platform - Repository Code System Models
 * Real schema for numeric/alphanumeric repository code registration and resolution.
 */

import { RepositoryManifest } from './media';

export type CodeStatus =
  | 'ACTIVE'
  | 'DISABLED'
  | 'EXPIRED'
  | 'NOT_FOUND'
  | 'INVALID'
  | 'REPOSITORY_UNAVAILABLE';

export interface RepositoryCodeRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  repositoryUrl: string;
  manifestUrl: string;
  version: string;
  status: 'ACTIVE' | 'DISABLED' | 'EXPIRED' | 'REPOSITORY_UNAVAILABLE';
  expiresAt?: number | null;
  createdAt: number;
  updatedAt: number;
  usageCount: number;
  sha256Signature: string;
  metadata?: Record<string, unknown>;
}

export interface CodeResolutionResponse {
  success: boolean;
  code: string;
  status: CodeStatus;
  repository?: RepositoryManifest;
  codeRecord?: RepositoryCodeRecord;
  error?: string;
  message?: string;
}
