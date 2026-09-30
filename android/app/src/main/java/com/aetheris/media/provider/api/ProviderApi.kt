package com.aetheris.media.provider.api

import com.aetheris.media.domain.model.*

/**
 * Public Provider API interface that all Aetheris extensions implement.
 */
interface AetherisProvider {
    val manifest: ProviderManifest

    suspend fun search(query: String): Result<List<ContentItem>>
    suspend fun getDetails(contentId: String): Result<ContentItem>
    suspend fun resolveSources(contentId: String, episodeId: String? = null): Result<List<StreamSource>>
}

sealed class ProviderResult<out T> {
    data class Success<out T>(val value: T) : ProviderResult<T>()
    data class Failure(val error: String, val cause: Throwable? = null) : ProviderResult<Nothing>()
}
