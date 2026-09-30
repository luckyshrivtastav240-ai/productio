/**
 * Aetheris Media Platform - Android Studio Source Code Inspector & Exporter
 * Provides an interactive file browser and code viewer for the complete Kotlin/Jetpack Compose Android project.
 */

import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, FileText, Smartphone } from 'lucide-react';

export const AndroidCodeExporter: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('MainActivity.kt');

  const files: Record<string, { path: string; language: string; content: string }> = {
    'MainActivity.kt': {
      path: 'app/src/main/java/com/aetheris/media/MainActivity.kt',
      language: 'kotlin',
      content: `package com.aetheris.media

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.aetheris.media.ui.theme.AetherisTheme
import com.aetheris.media.ui.theme.ObsidianBlack

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AetherisTheme {
                Surface(
                    modifier = Modifier.fillMaxSize().background(ObsidianBlack),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AetherisMainContent()
                }
            }
        }
    }
}`,
    },
    'AetherisPlayerManager.kt': {
      path: 'app/src/main/java/com/aetheris/media/player/AetherisPlayerManager.kt',
      language: 'kotlin',
      content: `package com.aetheris.media.player

import android.content.Context
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import com.aetheris.media.domain.model.StreamSource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class AetherisPlayerManager(private val context: Context) {
    private var exoPlayer: ExoPlayer? = null

    fun initializePlayer(): ExoPlayer {
        val player = ExoPlayer.Builder(context).build()
        exoPlayer = player
        return player
    }

    fun prepareStream(source: StreamSource, resumePositionMs: Long = 0L) {
        val player = exoPlayer ?: initializePlayer()
        val mimeType = when (source.container.lowercase()) {
            "m3u8" -> MimeTypes.APPLICATION_M3U8
            "mpd" -> MimeTypes.APPLICATION_MPD
            else -> MimeTypes.VIDEO_MP4
        }
        val mediaItem = MediaItem.Builder()
            .setUri(source.url)
            .setMimeType(mimeType)
            .build()

        player.setMediaItem(mediaItem)
        if (resumePositionMs > 0) player.seekTo(resumePositionMs)
        player.prepare()
        player.playWhenReady = true
    }
}`,
    },
    'ProviderSandbox.kt': {
      path: 'app/src/main/java/com/aetheris/media/provider/sandbox/ProviderSandbox.kt',
      language: 'kotlin',
      content: `package com.aetheris.media.provider.sandbox

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
                SecurityException("Provider '\${manifest.name}' denied access: missing \$requiredPermission permission.")
            )
        }
        return try {
            Result.success(block())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}`,
    },
    'MediaEntities.kt': {
      path: 'app/src/main/java/com/aetheris/media/data/local/entities/MediaEntities.kt',
      language: 'kotlin',
      content: `package com.aetheris.media.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "watch_progress")
data class WatchProgressEntity(
    @PrimaryKey val contentId: String,
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
)`,
    },
    'AndroidManifest.xml': {
      path: 'app/src/main/AndroidManifest.xml',
      language: 'xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />

    <uses-feature android:name="android.software.leanback" android:required="false" />
    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />

    <application
        android:name=".AetherisApplication"
        android:label="@string/app_name"
        android:theme="@style/Theme.Aetheris">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:supportsPictureInPicture="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    },
    'build.gradle.kts': {
      path: 'app/build.gradle.kts',
      language: 'kotlin',
      content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.aetheris.media"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.aetheris.media"
        minSdk = 24
        targetSdk = 35
        versionCode = 100
        versionName = "1.0.0"
    }
}`,
    },
  };

  const current = files[selectedFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Code2 className="h-6 w-6 text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-white">Android Studio Project Architecture</h3>
            <p className="text-xs text-slate-400">
              Clean Architecture · Jetpack Compose · Android Media3 (ExoPlayer) · Room SQLite · Provider SDK
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? 'Copied' : 'Copy Source'}</span>
        </button>
      </div>

      {/* Build Command Callout */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-2.5 text-xs">
        <Terminal className="h-4 w-4 text-amber-400 shrink-0" />
        <span className="text-slate-300">
          Build target: <code className="font-mono text-amber-300">./gradlew assembleDebug</code> (Output: <code className="font-mono text-slate-400">app-debug.apk</code>)
        </span>
      </div>

      {/* File Selector Tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {Object.keys(files).map((fileName) => (
          <button
            key={fileName}
            onClick={() => setSelectedFile(fileName)}
            className={`rounded-lg px-3 py-1 text-xs font-mono transition-colors ${
              selectedFile === fileName
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {fileName}
          </button>
        ))}
      </div>

      {/* Code Viewer */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-950">
        <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-2 text-[11px] font-mono text-slate-400">
          <span>{current.path}</span>
          <span className="uppercase text-slate-500">{current.language}</span>
        </div>
        <pre className="max-h-96 overflow-x-auto p-4 font-mono text-xs text-slate-200 leading-relaxed select-all">
          <code>{current.content}</code>
        </pre>
      </div>
    </div>
  );
};
