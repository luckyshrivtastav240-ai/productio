# Aetheris / NexusStream Media Platform (Android Production Architecture)

A completely original, modular media discovery, extension repository, and adaptive playback platform engineered for Android (Phone, Tablet, and Android TV Leanback).

---

## 1. Architectural Overview

```
Repository Code (e.g. 3737, 3670)
       ↓
Repository Code Resolver (/api/repository/resolve)
       ↓
Backend Registry & Manifest Validator (JSON / SHA-256)
       ↓
Provider Extension Engine (Isolated Sandbox)
       ↓
Smart Search Aggregator (Parallel + Title Normalization + Deduping)
       ↓
Source Resolver (Quality / Latency / Stability Ranking)
       ↓
Adaptive Media Engine (Android Media3 / ExoPlayer: HLS, DASH, MP4)
       ↓
Persistence Layer (Room DB: RepositoryCodes, WatchProgress, Favorites, Downloads)
```

### Module Separation
- **`com.aetheris.media.domain`**: Core business models, capabilities (`SEARCH`, `STREAMS`, `LIVE`, `SUBTITLES`), permissions (`NETWORK`, `PLAYBACK`, etc.).
- **`com.aetheris.media.provider.api`**: Modular Extension API contract (`AetherisProvider`).
- **`com.aetheris.media.provider.sandbox`**: Security sandbox enforcing per-provider permission isolation.
- **`com.aetheris.media.provider.manager`**: Repository manager, manifest validation, RepositoryCodeResolver, parallel coroutine dispatcher.
- **`com.aetheris.media.player`**: Android Media3 ExoPlayer wrapper supporting HLS adaptive bitrate, audio tracks, and WebVTT subtitles.
- **`com.aetheris.media.data.local`**: Room Database schema (v2) with SQLite DAOs for Repository Codes, Repositories, Providers, WatchProgress, Favorites, and Downloads.
- **`com.aetheris.media.ui`**: Jetpack Compose Material 3 presentation layer with Leanback TV D-pad focus states.

---

## 2. Repository Code System (3737 & 3670)

The platform supports numeric/alphanumeric repository codes resolving through a trusted backend registry:

- **Code `3737`**: Resolves to *Aetheris / NexusStream Open Cinema Core Repository* (`/api/manifest/3737`), exposing 4K Open Cinema Studio and Creative Commons animation series.
- **Code `3670`**: Resolves to *Public Cultural Heritage & Aerospace Media Repository* (`/api/manifest/3670`), exposing public-domain classics and real-time NASA aerospace telemetry streams.

### Code Resolution Pipeline
1. Input format validation (3-16 alphanumeric characters).
2. Backend resolver request (`POST /api/repository/resolve`).
3. Check code status (`ACTIVE`, `DISABLED`, `EXPIRED`, `NOT_FOUND`).
4. Retrieve repository manifest from registered `manifestUrl`.
5. Check minimum API compatibility and SHA-256 signatures.
6. Install selected or all discovered providers.
7. Execute real 9-stage diagnostics suite.
8. Enable verified providers for universal search and playback.

---

## 3. Building the Android Project

### Prerequisites
- Android Studio Ladybug (2024.2+) or IntelliJ IDEA
- JDK 17 or higher
- Android SDK Platform 35
- Gradle 8.7+

### Command Line Build
```bash
cd android

# Clean previous build artifacts
./gradlew clean

# Build debug APK
./gradlew assembleDebug

# Run unit tests
./gradlew testDebugUnitTest
```

The compiled APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 4. Provider Manifest Format

Providers are declared using a JSON manifest containing cryptographic SHA-256 signatures:

```json
{
  "providerId": "org.aetheris.provider.opencinema",
  "name": "Open Cinema Studio",
  "version": "2.4.0",
  "author": "Aetheris Open Foundation",
  "language": "en",
  "country": "US",
  "capabilities": ["SEARCH", "DETAILS", "STREAMS", "SUBTITLES", "DOWNLOAD", "CAST"],
  "supportedContentTypes": ["MOVIE", "DOCUMENTARY"],
  "apiVersion": "1.2.0",
  "requiredPermissions": ["NETWORK", "METADATA", "PLAYBACK", "SUBTITLE", "DOWNLOAD"],
  "sha256Signature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

---

## 5. Legal Compliance
Aetheris / NexusStream does not host copyrighted media. The platform is engineered to interact with user-authorized providers, public domain archives, and Creative Commons licensed streams.
