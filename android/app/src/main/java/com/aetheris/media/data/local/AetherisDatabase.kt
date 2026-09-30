package com.aetheris.media.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.aetheris.media.data.local.dao.MediaDao
import com.aetheris.media.data.local.entities.*

@Database(
    entities = [
        RepositoryCodeEntity::class,
        RepositoryEntity::class,
        InstalledProviderEntity::class,
        ProviderVersionEntity::class,
        WatchProgressEntity::class,
        FavoriteEntity::class,
        HistoryEntity::class,
        DownloadEntity::class,
        CacheMetadataEntity::class,
        UserSettingsEntity::class
    ],
    version = 2,
    exportSchema = false
)
abstract class AetherisDatabase : RoomDatabase() {
    abstract fun mediaDao(): MediaDao
}
