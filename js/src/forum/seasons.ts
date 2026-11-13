import app from 'flarum/forum/app';
import { enabled } from './util';

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

const NORTH: Season[] = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
const FLIP: Record<Season, Season> = { winter: 'summer', spring: 'autumn', summer: 'winter', autumn: 'spring' };

/**
 * Today's season for the little sprig on Hearth's drawings, or null when the
 * owner turned seasons off or Festoon is dressing the forum: Festoon's
 * holidays are the louder voice, and two sets of decorations is one too many.
 *
 * 🚨 Read from the reader's own clock: a season is a month, so a forum's
 * timezone and the reader's never disagree by more than a day at the edge.
 */
export function season(now = new Date()): Season | null {
  const setting = app.forum.attribute<string>('hearthSeasons') || 'north';
  if (setting === 'off' || enabled('ernestdefoe-festoon')) return null;

  const north = NORTH[now.getMonth()];

  return setting === 'south' ? FLIP[north] : north;
}
