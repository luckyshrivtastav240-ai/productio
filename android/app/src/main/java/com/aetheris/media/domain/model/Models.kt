package com.aetheris.media.domain.model

enum class ProviderCapability {
    SEARCH,
    DETAILS,
    EPISODES,
    STREAMS,
    SUBTITLES,
    DOWNLOAD,
    LIVE,
    CAST
}

enum class ProviderPermission {
    NETWORK,
    METADATA,
    PLAYBACK,
    SUBTITLE,
    DOWNLOAD,
    STORAGE,
    AUTHENTICATION
}

enum class ContentType {
    MOVIE,
    SERIES,
    ANIME,
    LIVE,
    DOCUMENTARY
}

enum class StreamQuality {
    QUALITY_4K,
    QUALITY_1080P,
    QUALITY_720P,
    QUALITY_480P,
    AUTO
}

data class SubtitleTrack(
    val id: String,
    val language: String,
    val label: String,
    val url: String,
    val format: String = "vtt",
    val isDefault: Boolean = false
)

data class StreamSource(
    val id: String,
    val providerId: String,
    val providerName: String,
    val url: String,
    val quality: StreamQuality,
    val codec: String,
    val container: String,
    val audioLanguage: String,
    val subtitles: List<SubtitleTrack> = emptyList(),
    val durationSeconds: Long? = null,
    val fileSizeBytes: Long? = null,
    val permitsDownload: Boolean = true,
    val isLive: Boolean = false
)

data class ContentItem(
    val id: String,
    val title: String,
    val overview: String,
    val year: Int,
    val posterUrl: String,
    val backdropUrl: String? = null,
    val genres: List<String> = emptyList(),
    val rating: Float = 0f,
    val durationMinutes: Int = 0,
    val type: ContentType = ContentType.MOVIE,
    val primaryProviderId: String,
    val providerSourceIds: List<String> = emptyList(),
    val isLive: Boolean = false
)

data class ProviderManifest(
    val providerId: String,
    val name: String,
    val version: String,
    val author: String,
    val description: String,
    val language: String,
    val country: String,
    val capabilities: List<ProviderCapability>,
    val supportedContentTypes: List<ContentType>,
    val apiVersion: String,
    val requiredPermissions: List<ProviderPermission>,
    val grantedPermissions: List<ProviderPermission>,
    val repositoryUrl: String,
    val sha256Signature: String,
    val enabled: Boolean = true,
    val installedAt: Long = System.currentTimeMillis()
)
