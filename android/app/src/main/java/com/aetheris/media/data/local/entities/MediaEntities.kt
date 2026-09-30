package com.aetheris.media.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "repository_codes")
data class RepositoryCodeEntity(
    @PrimaryKey val code: String, // e.g. "3737", "3670"
    val id: String,
    val name: String,
    val description: String,
    val repositoryUrl: String,
    val manifestUrl: String,
    val version: String,
    val status: String = "ACTIVE", // ACTIVE, DISABLED, EXPIRED
    val expiresAt: Long? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val usageCount: Int = 0,
    val sha256Signature: String
)

@Entity(tableName = "repositories")
data class RepositoryEntity(
    @PrimaryKey val repositoryId: String,
    val name: String,
    val version: String,
    val author: String,
    val description: String,
    val url: String,
    val icon: String? = null,
    val sha256Signature: String,
    val lastSyncedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "installed_providers")
data class InstalledProviderEntity(
    @PrimaryKey val providerId: String,
    val name: String,
    val version: String,
    val author: String,
    val description: String,
    val repositoryUrl: String,
    val sha256Signature: String,
    val enabled: Boolean,
    val installedAt: Long
)

@Entity(tableName = "provider_versions")
data class ProviderVersionEntity(
    @PrimaryKey val id: String, // providerId_version
    val providerId: String,
    val version: String,
    val changelog: String? = null,
    val updateUrl: String? = null,
    val publishedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "watch_progress")
data class WatchProgressEntity(
    @PrimaryKey val contentId: String,
    val seasonId: String? = null,
    val episodeId: String? = null,
    val title: String,
    val posterUrl: String,
    val seasonNumber: Int? = null,
    val episodeNumber: Int? = null,
    val positionSeconds: Long,
    val durationSeconds: Long,
    val lastWatchedAt: Long = System.currentTimeMillis(),
    val completed: Boolean = false
)

@Entity(tableName = "favorites")
data class FavoriteEntity(
    @PrimaryKey val contentId: String,
    val title: String,
    val posterUrl: String,
    val addedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "history_entries")
data class HistoryEntity(
    @PrimaryKey val contentId: String,
    val title: String,
    val posterUrl: String,
    val viewedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "download_items")
data class DownloadEntity(
    @PrimaryKey val id: String,
    val contentId: String,
    val title: String,
    val posterUrl: String,
    val streamUrl: String,
    val quality: String,
    val fileSizeBytes: Long,
    val downloadedBytes: Long,
    val status: String,
    val localFilePath: String? = null,
    val startedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "cache_metadata")
data class CacheMetadataEntity(
    @PrimaryKey val key: String,
    val value: String,
    val sizeBytes: Long,
    val expiresAt: Long
)

@Entity(tableName = "user_settings")
data class UserSettingsEntity(
    @PrimaryKey val id: String = "default_settings",
    val preferredLanguage: String = "en",
    val defaultQuality: String = "1080p",
    val hardwareAcceleration: Boolean = true,
    val wifiOnlyDownloads: Boolean = false
)
