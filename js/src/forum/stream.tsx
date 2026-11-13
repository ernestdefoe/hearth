import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';

/** Consecutive replies by one person within this window read as one turn. */
const GROUP_WINDOW = 10 * 60 * 1000;

/**
 * Chat-bubble posts: whose turn it is and whether it continues the last one.
 *
 * - `HearthPost--mine` on the reader's own posts (drawn on the right when the
 *   owner keeps "your posts on the right" on);
 * - `HearthPost--cont` on a reply that follows the same person's within ten
 *   minutes: no second avatar and name, just the next bubble;
 * - `HearthPost--event` on renamed / tagged / pinned notes, drawn as one
 *   small centred line.
 *
 * 🚨 Done in PostStream's VIEW, every render, as a pure function of each post
 * and the one before it. A post that arrives without a page load (realtime,
 * the reader's own reply, "load more") goes through exactly the same code as
 * one that was there at first paint. Only classes change: the stream's keys,
 * indices and scroll anchoring stay core's.
 */
export default function installStream() {
  // 🚨 By PATH, not by import: core code-splits PostStream, so at boot the
  // module is not loaded and an imported reference would be undefined.
  extend('flarum/forum/components/PostStream' as any, 'view' as any, function (this: any, vdom: any) {
    const items: any[] = vdom?.children;
    if (!Array.isArray(items)) return;

    const me = app.session.user;
    const right = app.forum.attribute('hearthOwnRight') !== false;
    const posts: any[] = this.stream.posts();
    const start: number = this.stream.visibleStart;

    // Core wraps the first post's item in a fragment when it has items after
    // it; find the real item either way.
    const itemFor = (vnode: any) => (vnode && vnode.tag === '[' ? vnode.children?.find((c: any) => c?.attrs?.['data-index'] !== undefined) : vnode);

    for (const vnode of items) {
      const item = itemFor(vnode);
      const index = item?.attrs?.['data-index'];
      if (index === undefined || !item.attrs['data-id']) continue;

      const post = posts[index - start];
      if (!post) continue;

      const prev = index - start > 0 ? posts[index - start - 1] : null;
      const classes: string[] = [];

      if (post.contentType() !== 'comment') {
        classes.push('HearthPost--event');
      } else {
        classes.push('HearthPost');

        if (right && me && post.user() === me) classes.push('HearthPost--mine');

        // A gap of days gets core's own "N days later" notice, which must keep
        // its header; so does the first post and anything after an event.
        const gap = Array.isArray(item.children) && item.children.some((c: any) => c?.attrs?.className === 'PostStream-timeGap');

        if (
          !gap &&
          prev &&
          post.number() !== 1 &&
          prev.contentType() === 'comment' &&
          !prev.isHidden() &&
          !post.isHidden() &&
          prev.user() &&
          prev.user() === post.user() &&
          post.createdAt().getTime() - prev.createdAt().getTime() <= GROUP_WINDOW
        ) {
          classes.push('HearthPost--cont');
        }
      }

      item.attrs.className = (item.attrs.className || '') + ' ' + classes.join(' ');
    }
  });
}
