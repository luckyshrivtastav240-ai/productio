/**
 * Aetheris Media Platform - Provider Security Sandbox & Permission Enforcement Engine
 * Ensures third-party extensions run within strict capability and permission boundaries.
 */

import { ProviderManifest, ProviderPermission, ProviderCapability, StreamSource } from '../../types/media';
import { storage } from '../storage';

export interface SandboxExecutionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  violation?: string;
  executionTimeMs: number;
}

export class ProviderSandbox {
  /**
   * Verifies if a provider has been granted a specific permission by the user.
   */
  static hasPermission(manifest: ProviderManifest, permission: ProviderPermission): boolean {
    if (!manifest.enabled) {
      return false;
    }
    return manifest.grantedPermissions.includes(permission);
  }

  /**
   * Verifies if a provider declares support for an intended capability.
   */
  static hasCapability(manifest: ProviderManifest, capability: ProviderCapability): boolean {
    return manifest.capabilities.includes(capability);
  }

  /**
   * Enforces permission check before performing a network call on behalf of a provider.
   */
  static async executeWithNetworkSandbox<T>(
    manifest: ProviderManifest,
    operationName: string,
    executor: () => Promise<T>
  ): Promise<SandboxExecutionResult<T>> {
    const startTime = performance.now();

    // 1. Verify enabled state
    if (!manifest.enabled) {
      const err = `Provider '${manifest.name}' is currently disabled.`;
      storage.addProviderLog({
        providerId: manifest.providerId,
        level: 'warn',
        category: 'sandbox',
        message: `Blocked ${operationName}: provider is disabled`,
      });
      return {
        success: false,
        violation: 'PROVIDER_DISABLED',
        error: err,
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    }

    // 2. Verify NETWORK permission
    if (!this.hasPermission(manifest, 'NETWORK')) {
      const err = `Sandbox Violation: Provider '${manifest.name}' attempted network operation '${operationName}' without granted NETWORK permission.`;
      storage.addProviderLog({
        providerId: manifest.providerId,
        level: 'error',
        category: 'sandbox',
        message: `Sandbox Violation: Missing NETWORK permission for ${operationName}`,
      });
      return {
        success: false,
        violation: 'PERMISSION_DENIED_NETWORK',
        error: err,
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    }

    // 3. Execute with timeout guard
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Operation '${operationName}' timed out after 8000ms`)), 8000);
      });

      const result = await Promise.race([executor(), timeoutPromise]);
      const duration = Math.round(performance.now() - startTime);

      storage.addProviderLog({
        providerId: manifest.providerId,
        level: 'info',
        category: 'network',
        message: `${operationName} completed successfully in ${duration}ms`,
      });

      return {
        success: true,
        data: result,
        executionTimeMs: duration,
      };
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - startTime);
      const errorMessage = err instanceof Error ? err.message : String(err);

      storage.addProviderLog({
        providerId: manifest.providerId,
        level: 'error',
        category: 'network',
        message: `${operationName} failed: ${errorMessage}`,
      });

      return {
        success: false,
        error: errorMessage,
        executionTimeMs: duration,
      };
    }
  }

  /**
   * Filters and validates stream sources to ensure they adhere to sandbox policies.
   */
  static sanitizeStreamSources(manifest: ProviderManifest, sources: StreamSource[]): StreamSource[] {
    const canPlay = this.hasPermission(manifest, 'PLAYBACK');
    const canSubtitle = this.hasPermission(manifest, 'SUBTITLE');
    const canDownload = this.hasPermission(manifest, 'DOWNLOAD') && this.hasCapability(manifest, 'DOWNLOAD');

    if (!canPlay) {
      storage.addProviderLog({
        providerId: manifest.providerId,
        level: 'warn',
        category: 'sandbox',
        message: `Stripped stream sources: PLAYBACK permission not granted`,
      });
      return [];
    }

    return sources.map((source) => {
      return {
        ...source,
        providerId: manifest.providerId,
        providerName: manifest.name,
        permitsDownload: canDownload && source.permitsDownload,
        subtitles: canSubtitle ? source.subtitles : [],
      };
    });
  }
}
