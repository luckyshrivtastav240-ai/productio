package com.aetheris.media

import com.aetheris.media.domain.model.*
import com.aetheris.media.provider.manager.CodeResolveResponse
import com.aetheris.media.provider.sandbox.ProviderSandbox
import org.junit.Assert.*
import org.junit.Test

class ProviderSystemTest {

    private val sampleManifest = ProviderManifest(
        providerId = "org.test.provider",
        name = "Test Provider",
        version = "1.0.0",
        author = "Test Author",
        description = "Test description",
        language = "en",
        country = "US",
        capabilities = listOf(ProviderCapability.SEARCH, ProviderCapability.STREAMS),
        supportedContentTypes = listOf(ContentType.MOVIE),
        apiVersion = "1.2.0",
        requiredPermissions = listOf(ProviderPermission.NETWORK, ProviderPermission.PLAYBACK),
        grantedPermissions = listOf(ProviderPermission.NETWORK, ProviderPermission.PLAYBACK),
        repositoryUrl = "https://example.com/repo.json",
        sha256Signature = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
        enabled = true
    )

    @Test
    fun testProviderSandbox_permissionGranted() {
        val hasNetwork = ProviderSandbox.hasPermission(sampleManifest, ProviderPermission.NETWORK)
        assertTrue(hasNetwork)

        val hasStorage = ProviderSandbox.hasPermission(sampleManifest, ProviderPermission.STORAGE)
        assertFalse(hasStorage)
    }

    @Test
    fun testProviderSandbox_disabledProvider_blocksAllPermissions() {
        val disabled = sampleManifest.copy(enabled = false)
        val hasNetwork = ProviderSandbox.hasPermission(disabled, ProviderPermission.NETWORK)
        assertFalse(hasNetwork)
    }

    @Test
    fun testProviderSandbox_runGuardedExecution() {
        val successResult = ProviderSandbox.runGuarded(sampleManifest, ProviderPermission.NETWORK) {
            "Network Data"
        }
        assertTrue(successResult.isSuccess)
        assertEquals("Network Data", successResult.getOrNull())

        val blockedResult = ProviderSandbox.runGuarded(sampleManifest, ProviderPermission.STORAGE) {
            "Secret Storage"
        }
        assertTrue(blockedResult.isFailure)
        assertTrue(blockedResult.exceptionOrNull() is SecurityException)
    }

    @Test
    fun testRepositoryCodeValidation_formatRules() {
        val validCode = "3737"
        val validAlpha = "3670"
        val invalidCode = "!"

        assertTrue(validCode.matches(Regex("^[A-Z0-9_-]{3,16}$")))
        assertTrue(validAlpha.matches(Regex("^[A-Z0-9_-]{3,16}$")))
        assertFalse(invalidCode.matches(Regex("^[A-Z0-9_-]{3,16}$")))
    }
}
