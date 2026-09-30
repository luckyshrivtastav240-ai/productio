package com.aetheris.media.data.local.dao

import androidx.room.*
import com.aetheris.media.data.local.entities.*
import kotlinx.coroutines.flow.Flow

@Dao
interface MediaDao {

    // Repository Codes
    @Query("SELECT * FROM repository_codes WHERE code = :code LIMIT 1")
    suspend fun getRepositoryCode(code: String): RepositoryCodeEntity?

    @Query("SELECT * FROM repository_codes")
    fun getAllRepositoryCodes(): Flow<List<RepositoryCodeEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertRepositoryCode(codeRecord: RepositoryCodeEntity)

    // Repositories
    @Query("SELECT * FROM repositories")
    fun getAllRepositories(): Flow<List<RepositoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertRepository(repository: RepositoryEntity)

    @Query("DELETE FROM repositories WHERE repositoryId = :repositoryId")
    suspend fun deleteRepository(repositoryId: String)

    // Watch Progress
    @Query("SELECT * FROM watch_progress ORDER BY lastWatchedAt DESC")
    fun getAllWatchProgress(): Flow<List<WatchProgressEntity>>

    @Query("SELECT * FROM watch_progress WHERE contentId = :contentId LIMIT 1")
    suspend fun getWatchProgress(contentId: String): WatchProgressEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertWatchProgress(progress: WatchProgressEntity)

    @Query("DELETE FROM watch_progress WHERE contentId = :contentId")
    suspend fun deleteWatchProgress(contentId: String)

    // Favorites
    @Query("SELECT * FROM favorites ORDER BY addedAt DESC")
    fun getFavorites(): Flow<List<FavoriteEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFavorite(fav: FavoriteEntity)

    @Query("DELETE FROM favorites WHERE contentId = :contentId")
    suspend fun removeFavorite(contentId: String)

    @Query("SELECT EXISTS(SELECT 1 FROM favorites WHERE contentId = :contentId)")
    suspend fun isFavorite(contentId: String): Boolean

    // History
    @Query("SELECT * FROM history_entries ORDER BY viewedAt DESC")
    fun getHistory(): Flow<List<HistoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHistory(entry: HistoryEntity)

    @Query("DELETE FROM history_entries")
    suspend fun clearHistory()

    // Providers
    @Query("SELECT * FROM installed_providers")
    fun getProviders(): Flow<List<InstalledProviderEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertProvider(provider: InstalledProviderEntity)

    @Query("UPDATE installed_providers SET enabled = :enabled WHERE providerId = :providerId")
    suspend fun setProviderEnabled(providerId: String, enabled: Boolean)

    @Query("DELETE FROM installed_providers WHERE providerId = :providerId")
    suspend fun deleteProvider(providerId: String)

    // Downloads
    @Query("SELECT * FROM download_items ORDER BY startedAt DESC")
    fun getAllDownloads(): Flow<List<DownloadEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertDownload(download: DownloadEntity)

    @Query("DELETE FROM download_items WHERE id = :id")
    suspend fun deleteDownload(id: String)
}
