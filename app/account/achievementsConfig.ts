/**
 * Achievement definitions - 4 levels per category
 * Based on PM spec
 */

export type AchievementCategory = 'monsters' | 'dungeons' | 'waves' | 'souls'

export interface AchievementLevel {
  level: number
  title: string
  target: number
  /** Description format: "Slay x Humans", etc. */
  getDescription: (target: number) => string
  /** Label under progress bar: "Humans Slayed", etc. */
  progressLabel: string
  /** Icon path for this level (1-4) */
  getIconPath: (level: number) => string
}

const BASE_PATH = '/media/archievements'

const MONSTERS_LEVELS: AchievementLevel[] = [
  { level: 1, title: 'Blooding Butcher', target: 10, getDescription: (t) => `Slay ${t} Humans`, progressLabel: 'Humans Slayed', getIconPath: (l) => `${BASE_PATH}/T_monster_killed_${l}.png` },
  { level: 2, title: 'Harvester of Mortals', target: 100, getDescription: (t) => `Slay ${t} Humans`, progressLabel: 'Humans Slayed', getIconPath: (l) => `${BASE_PATH}/T_monster_killed_${l}.png` },
  { level: 3, title: 'Extinction Warden', target: 500, getDescription: (t) => `Slay ${t} Humans`, progressLabel: 'Humans Slayed', getIconPath: (l) => `${BASE_PATH}/T_monster_killed_${l}.png` },
  { level: 4, title: 'Annihilation Sovereign', target: 1000, getDescription: (t) => `Slay ${t} Humans`, progressLabel: 'Humans Slayed', getIconPath: (l) => `${BASE_PATH}/T_monster_killed_${l}.png` },
]

const DUNGEONS_LEVELS: AchievementLevel[] = [
  { level: 1, title: 'Depth Treader', target: 1, getDescription: (t) => `Complete ${t} Dungeons`, progressLabel: 'Dungeons Completed', getIconPath: (l) => `${BASE_PATH}/T_dungeon_completed_${l}.png` },
  { level: 2, title: 'Breaker of Sanctuaries', target: 10, getDescription: (t) => `Complete ${t} Dungeons`, progressLabel: 'Dungeons Completed', getIconPath: (l) => `${BASE_PATH}/T_dungeon_completed_${l}.png` },
  { level: 3, title: 'Ravager of the Deep Realms', target: 25, getDescription: (t) => `Complete ${t} Dungeons`, progressLabel: 'Dungeons Completed', getIconPath: (l) => `${BASE_PATH}/T_dungeon_completed_${l}.png` },
  { level: 4, title: 'Endless Delver', target: 50, getDescription: (t) => `Complete ${t} Dungeons`, progressLabel: 'Dungeons Completed', getIconPath: (l) => `${BASE_PATH}/T_dungeon_completed_${l}.png` },
]

const WAVES_LEVELS: AchievementLevel[] = [
  { level: 1, title: 'Surviving Maw', target: 1, getDescription: (t) => `Survive ${t} Waves of Enemies`, progressLabel: 'Waves Completed', getIconPath: (l) => `${BASE_PATH}/T_waves_completed_${l}.png` },
  { level: 2, title: 'Unyielding Hellstorm', target: 25, getDescription: (t) => `Survive ${t} Waves of Enemies`, progressLabel: 'Waves Completed', getIconPath: (l) => `${BASE_PATH}/T_waves_completed_${l}.png` },
  { level: 3, title: 'Eternal Siegebinger', target: 50, getDescription: (t) => `Survive ${t} Waves of Enemies`, progressLabel: 'Waves Completed', getIconPath: (l) => `${BASE_PATH}/T_waves_completed_${l}.png` },
  { level: 4, title: 'Endless Overrun', target: 100, getDescription: (t) => `Survive ${t} Waves of Enemies`, progressLabel: 'Waves Completed', getIconPath: (l) => `${BASE_PATH}/T_waves_completed_${l}.png` },
]

const SOULS_LEVELS: AchievementLevel[] = [
  { level: 1, title: 'Soul Sipper', target: 1, getDescription: (t) => `Harvest ${t} Souls`, progressLabel: 'Harvested Souls', getIconPath: (l) => `${BASE_PATH}/T_souldrains_${l}.png` },
  { level: 2, title: 'Essence Devourer', target: 25, getDescription: (t) => `Harvest ${t} Souls`, progressLabel: 'Harvested Souls', getIconPath: (l) => `${BASE_PATH}/T_souldrains_${l}.png` },
  { level: 3, title: 'Voidborn Reaper', target: 50, getDescription: (t) => `Harvest ${t} Souls`, progressLabel: 'Harvested Souls', getIconPath: (l) => `${BASE_PATH}/T_souldrains_${l}.png` },
  { level: 4, title: 'Soul Annihilator', target: 100, getDescription: (t) => `Harvest ${t} Souls`, progressLabel: 'Harvested Souls', getIconPath: (l) => `${BASE_PATH}/T_souldrains_${l}.png` },
]

export const ACHIEVEMENT_CONFIG: Record<
  AchievementCategory,
  { levels: AchievementLevel[]; getProgress: (stats: { slayedHumans: number; dungeonsCompleted: number; wavesCompleted: number; harvestedSouls: number }) => number }
> = {
  monsters: { levels: MONSTERS_LEVELS, getProgress: (s) => s.slayedHumans },
  dungeons: { levels: DUNGEONS_LEVELS, getProgress: (s) => s.dungeonsCompleted },
  waves: { levels: WAVES_LEVELS, getProgress: (s) => s.wavesCompleted },
  souls: { levels: SOULS_LEVELS, getProgress: (s) => s.harvestedSouls },
}

/** Get the current level config for a category based on progress */
export function getCurrentLevel(
  category: AchievementCategory,
  progress: number
): { level: AchievementLevel; progress: number; target: number; isCompleted: boolean } {
  const levels = ACHIEVEMENT_CONFIG[category].levels

  for (let i = 0; i < levels.length; i++) {
    if (progress < levels[i].target) {
      return {
        level: levels[i],
        progress,
        target: levels[i].target,
        isCompleted: false,
      }
    }
  }
  const last = levels[levels.length - 1]
  // For all categories, extend the visual progress bar beyond the last tier
  // so that players who go far beyond the final target don't see a permanently full bar.
  // Once the player exceeds the last defined target, we use 20,000 as the new max.
  const extendedTarget = progress > last.target ? 20000 : last.target

  return {
    level: last,
    progress,
    target: extendedTarget,
    isCompleted: true,
  }
}
