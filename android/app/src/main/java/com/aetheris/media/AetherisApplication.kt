package com.aetheris.media

import android.app.Application
import androidx.room.Room
import com.aetheris.media.data.local.AetherisDatabase

class AetherisApplication : Application() {

    lateinit var database: AetherisDatabase
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        database = Room.databaseBuilder(
            applicationContext,
            AetherisDatabase::class.java,
            "aetheris_media.db"
        )
            .fallbackToDestructiveMigration()
            .build()
    }

    companion object {
        lateinit var instance: AetherisApplication
            private set
    }
}
