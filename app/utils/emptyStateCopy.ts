/**
 * Unified empty-state copy for consistent UX across the app.
 */

export const EMPTY_STATE = {
  /** Shown when user must connect to see data */
  connectTitle: 'No data to display',
  connectSubtext: 'Please connect to view your profile',

  /** Shown when connected but user has no stats yet */
  noStatsTitle: 'No data to display',
  noStatsSubtext: 'Start playing to see your stats here!',

  /** Error state */
  errorTitle: 'Temporary error',
  errorSubtext: 'Please try again later.',
} as const
