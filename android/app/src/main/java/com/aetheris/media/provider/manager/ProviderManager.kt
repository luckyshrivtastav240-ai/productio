package com.aetheris.media.provider.manager

import com.aetheris.media.domain.model.ContentItem
import com.aetheris.media.domain.model.ProviderManifest
import com.aetheris.media.domain.model.StreamSource
import com.aetheris.media.provider.api.AetherisProvider
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class ProviderManager {

    private val _registeredProviders = MutableStateFlow<List<AetherisProvider>>(emptyList())
    val registeredProviders: StateFlow<List<AetherisProvider>> = _registeredProviders.asStateFlow()

    fun registerProvider(provider: AetherisProvider) {
        val current = _registeredProviders.value.toMutableList()
        current.removeAll { it.manifest.providerId == provider.manifest.providerId }
        current.add(provider)
        _registeredProviders.value = current
    }

    fun unregisterProvider(providerId: String) {
        _registeredProviders.value = _registeredProviders.value.filter { it.manifest.providerId != providerId }
    }

    /**
     * Parallel Universal Search with Deduping across providers
     */
    suspend fun searchParallel(query: String): List<ContentItem> = coroutineScope {
        val providers = _registeredProviders.value.filter { it.manifest.enabled }

        val deferredResults = providers.map { provider ->
            async {
                provider.search(query).getOrDefault(emptyList())
            }
        }

        val allItems = deferredResults.awaitAll().flatten()

        // Deduplicate items based on title
        val map = mutableMapOf<String, ContentItem>()
        for (item in allItems) {
            val key = item.title.trim().lowercase()
            if (!map.containsKey(key)) {
                map[key] = item
            }
        }
        map.values.toList()
    }
}
