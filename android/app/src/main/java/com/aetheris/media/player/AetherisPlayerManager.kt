package com.aetheris.media.player

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

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _currentPosition = MutableStateFlow(0L)
    val currentPosition: StateFlow<Long> = _currentPosition.asStateFlow()

    private val _duration = MutableStateFlow(0L)
    val duration: StateFlow<Long> = _duration.asStateFlow()

    fun initializePlayer(): ExoPlayer {
        val player = ExoPlayer.Builder(context).build()
        player.addListener(object : Player.Listener {
            override fun onIsPlayingChanged(playing: Boolean) {
                _isPlaying.value = playing
            }

            override fun onPlaybackStateChanged(playbackState: Int) {
                if (playbackState == Player.STATE_READY) {
                    _duration.value = player.duration.coerceAtLeast(0L)
                }
            }
        })
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
        if (resumePositionMs > 0) {
            player.seekTo(resumePositionMs)
        }
        player.prepare()
        player.playWhenReady = true
    }

    fun seekTo(positionMs: Long) {
        exoPlayer?.seekTo(positionMs)
    }

    fun setPlaybackSpeed(speed: Float) {
        exoPlayer?.setPlaybackSpeed(speed)
    }

    fun release() {
        exoPlayer?.release()
        exoPlayer = null
    }
}
