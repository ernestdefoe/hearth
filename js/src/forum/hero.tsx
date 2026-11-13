import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import humanTime from 'flarum/common/helpers/humanTime';
import username from 'flarum/common/helpers/username';
import { Jar } from './art';
import { t } from './util';

/**
 * A discussion's header: a soft card tinted with its first tag's colour, who
 * started it and how many replies, and a jar on the right in the tag's colour.
 * flarum/tags already puts the colour on the hero as --hero-bg; Hearth only
 * changes how it is used (a tint, not a solid block).
 */
export default function installHero() {
  extend('flarum/forum/components/DiscussionHero' as any, 'items' as any, function (this: any, items: any) {
    const discussion = this.attrs.discussion;
    const user = discussion.user();
    const replies = discussion.replyCount() || 0;

    items.add(
      'hearthByline',
      <div className="HearthHero-byline">{t('hero.byline', { name: username(user), ago: humanTime(discussion.createdAt()), count: replies })}</div>,
      -10
    );
  });

  extend('flarum/forum/components/DiscussionHero' as any, 'bodyItems' as any, function (this: any, items: any) {
    const tag = (this.attrs.discussion.tags?.() || []).find((tag: any) => tag && !tag.isChild?.());

    items.add('hearthArt', <div className="HearthHero-art">{Jar({ color: tag?.color?.() || null, face: true })}</div>, -10);
  });
}
