'use client';

import { useState, useEffect } from 'react';

interface EnemyRaritiesKilled {
  Elite?: number;
  MiniBoss?: number;
  Base?: number;
}

interface EnemiesKilled {
  [key: string]: number;
}

interface SkillsUsed {
  [key: string]: number;
}

interface DungeonsCompleted {
  [key: string]: number;
}

interface Stats {
  enemyRaritiesKilled: EnemyRaritiesKilled;
  enemiesKilled: EnemiesKilled;
  skillsUsed: SkillsUsed;
  dungeonsCompleted: DungeonsCompleted;
}

interface SeasonStat {
  wallet: string;
  username: string;
  profile: {
    username: string;
  };
  stats: Stats;
}

interface ApiResponse {
  seasonId: string;
  lastEvaluatedKey: string | null;
  seasonStats: SeasonStat[];
}

interface LeaderboardEntry {
  username: string;
  wallet: string;
  total: number;
}

export default function Home() {
  const [seasonStats, setSeasonStats] = useState<SeasonStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seasonId, setSeasonId] = useState('0');
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchSeasonStats = async (seasonIdParam: string, lastKeyParam: string | null = null) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/season-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seasonId: seasonIdParam,
          limit: 50,
          ...(lastKeyParam && { lastKey: lastKeyParam }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Error ${response.status}: ${response.statusText}` }));
        const errorMessage = errorData.details 
          ? `${errorData.error || 'Error'} - ${errorData.details}`
          : errorData.error || `Error: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data: ApiResponse = await response.json();
      
      if (lastKeyParam) {
        // Append to existing data for pagination
        setSeasonStats(prev => [...prev, ...data.seasonStats]);
      } else {
        // Replace data for new search
        setSeasonStats(data.seasonStats);
      }
      
      setLastKey(data.lastEvaluatedKey);
      setHasMore(data.lastEvaluatedKey !== null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasonStats(seasonId);
  }, []);

  const handleLoadMore = () => {
    if (lastKey && !loading) {
      fetchSeasonStats(seasonId, lastKey);
    }
  };

  const handleSeasonChange = (newSeasonId: string) => {
    setSeasonId(newSeasonId);
    setLastKey(null);
    fetchSeasonStats(newSeasonId);
  };

  // Calculate leaderboards
  const enemiesLeaderboard: LeaderboardEntry[] = seasonStats
    .map(stat => ({
      username: stat.username,
      wallet: stat.wallet,
      total: Object.values(stat.stats.enemiesKilled || {}).reduce((sum, count) => sum + count, 0),
    }))
    .sort((a, b) => b.total - a.total);

  const dungeonsLeaderboard: LeaderboardEntry[] = seasonStats
    .map(stat => ({
      username: stat.username,
      wallet: stat.wallet,
      total: Object.values(stat.stats.dungeonsCompleted || {}).reduce((sum, count) => sum + count, 0),
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">Netherak Leaderboard</h1>
        <p className="text-gray-400 text-center mb-8">Season Statistics</p>

        {/* Season Selector */}
        <div className="mb-8 flex justify-center gap-4">
          <label className="flex items-center gap-2">
            <span className="text-gray-300">Season ID:</span>
            <input
              type="text"
              value={seasonId}
              onChange={(e) => setSeasonId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSeasonChange(seasonId);
                }
              }}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
            <button
              onClick={() => handleSeasonChange(seasonId)}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Buscar
            </button>
          </label>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-center">
            Error: {error}
          </div>
        )}

        {loading && seasonStats.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">Cargando estadísticas...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Enemies Killed Leaderboard */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-blue-400">🏆 Enemigos Eliminados</h2>
                <div className="space-y-2">
                  {enemiesLeaderboard.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No hay datos disponibles</p>
                  ) : (
                    enemiesLeaderboard.map((entry, index) => (
                      <div
                        key={`${entry.wallet}-enemies-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-yellow-400 w-8 text-center">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold">{entry.username || 'Sin nombre'}</p>
                            <p className="text-xs text-gray-400 font-mono">
                              {entry.wallet.slice(0, 6)}...{entry.wallet.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xl font-bold text-green-400">
                          {entry.total.toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Dungeons Completed Leaderboard */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-purple-400">🏰 Dungeons Completados</h2>
                <div className="space-y-2">
                  {dungeonsLeaderboard.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No hay datos disponibles</p>
                  ) : (
                    dungeonsLeaderboard.map((entry, index) => (
                      <div
                        key={`${entry.wallet}-dungeons-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-yellow-400 w-8 text-center">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold">{entry.username || 'Sin nombre'}</p>
                            <p className="text-xs text-gray-400 font-mono">
                              {entry.wallet.slice(0, 6)}...{entry.wallet.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xl font-bold text-green-400">
                          {entry.total.toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold"
                >
                  {loading ? 'Cargando...' : 'Cargar más'}
                </button>
              </div>
            )}

            {/* Stats Summary */}
            {seasonStats.length > 0 && (
              <div className="mt-8 text-center text-gray-400">
                <p>Mostrando {seasonStats.length} jugador{seasonStats.length !== 1 ? 'es' : ''}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
