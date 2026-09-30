package com.aetheris.media.provider.sandbox

import com.aetheris.media.domain.model.ProviderManifest
import com.aetheris.media.domain.model.ProviderPermission

object ProviderSandbox {

    fun hasPermission(manifest: ProviderManifest, permission: ProviderPermission): Boolean {
        if (!manifest.enabled) return false
        return manifest.grantedPermissions.contains(permission)
    }

    inline fun <T> runGuarded(
        manifest: ProviderManifest,
        requiredPermission: ProviderPermission,
        block: () -> T
    ): Result<T> {
        if (!hasPermission(manifest, requiredPermission)) {
            return Result.failure(
                SecurityException("Provider '${manifest.name}' denied access: missing $requiredPermission permission.")
            )
        }
        return try {
            Result.success(block())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
