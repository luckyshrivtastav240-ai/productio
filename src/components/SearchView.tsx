/**
 * Aetheris Media Platform - Smart Search Engine View
 * Real-time parallel multi-provider search with deduplication and metadata merging.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles, Filter, X } from 'lucide-react';
import { ContentItem } from '../types/media';
import { SearchAggregator, ProviderSearchResult } from '../services/search/aggregator';
import { MediaCard } from './MediaCard';

interface SearchViewProps {
  onPlay: (item: ContentItem) => void;
  onOpenDetails: (item: ContentItem) => void;
  onToggleFavorite: (id: string) => void;
  favorites: string[];
}

export const SearchView: React.FC<SearchViewProps> = ({
  onPlay,
  onOpenDetails,
  onToggleFavorite,
  favorites,
}) => {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ContentItem[]>([]);
  const [providerStatuses, setProviderStatuses] = useState<ProviderSearchResult[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setProviderStatuses([]);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const { items, providerResults } = await SearchAggregator.search(
          {
            query,
            type: selectedType,
            genre: selectedGenre,
          },
          controller.signal
        );

        setResults(items);
        setProviderStatuses(providerResults);
        setIsLoading(false);
      } catch {
        // Aborted or network error
      }
    }, 280);

    return () => {
      clearTimeout(timer);
    };
  }, [query, selectedType, selectedGenre]);

  const typeFilters = [
    { id: 'ALL', label: 'All Formats' },
    { id: 'MOVIE', label: 'Movies' },
    { id: 'SERIES', label: 'Series' },
    { id: 'LIVE', label: 'Live TV' },
    { id: 'DOCUMENTARY', label: 'Documentaries' },
  ];

  const genres = ['ALL', 'Sci-Fi', 'Animation', 'Fantasy', 'Action', 'Documentary', 'Space', 'Classic'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Universal Content Search</h1>
        <p className="mt-1 text-sm text-slate-400">
          Search simultaneously across all enabled repositories and providers with duplicate merging.
        </p>
      </div>

      {/* Search Input Field */}
      <div className="relative mb-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, director, theme, or keyword (e.g. 'Tears of Steel', 'NASA', 'Bunny')..."
          className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-3.5 pr-12 pl-12 text-sm text-white placeholder-slate-500 shadow-inner backdrop-blur-md focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Segmented Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Content Type Filter */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/5 bg-slate-950/60 p-1">
          {typeFilters.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedType === tab.id
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Genre Selector */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 focus:border-amber-400 focus:outline-none"
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                Genre: {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Real-time Provider Query Status Badges */}
      {providerStatuses.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Queried Providers:</span>
          {providerStatuses.map((ps) => (
            <div
              key={ps.providerId}
              className="flex items-center gap-1.5 rounded-md border border-white/5 bg-white/5 px-2.5 py-1 text-slate-300 font-mono text-[11px]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{ps.providerName}</span>
              <span className="text-slate-500">({ps.durationMs}ms)</span>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-amber-400" />
          <p className="text-xs text-slate-400">Aggregating stream results across providers...</p>
        </div>
      )}

      {/* Empty Initial Prompt */}
      {!isLoading && !query && (
        <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-12 text-center">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-amber-400/80" />
          <h3 className="text-base font-semibold text-white">Instant Cross-Provider Discovery</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-slate-400">
            Type any title above. Aetheris queries all installed extensions concurrently, matches titles, and merges
            all available streams into unified media cards.
          </p>
        </div>
      )}

      {/* Empty Results State */}
      {!isLoading && query && results.length === 0 && (
        <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-12 text-center">
          <p className="text-base font-medium text-white">No matching titles found for "{query}"</p>
          <p className="mt-1 text-xs text-slate-400">
            Check your search spelling, adjust genre filters, or enable additional providers in Provider Center.
          </p>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && results.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
            <span>Found {results.length} unified titles with active streams</span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                isFavorite={favorites.includes(item.id)}
                onPlay={onPlay}
                onOpenDetails={onOpenDetails}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
