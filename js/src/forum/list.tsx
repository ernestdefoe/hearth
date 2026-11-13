import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import abbreviateNumber from 'flarum/common/utils/abbreviateNumber';
import { t } from './util';

/**
 * Discussion rows as cards: an excerpt under the title, and on the right a
 * "3 new" pill above the reply count, as in the design.
 */
export default function installList() {
  // The excerpt goes under the title, inside the row's own link, unless
  // something else (fof/synopsis, flarum/sticky's pinned excerpt, a search
  // result's matching post) already put one in the info line.
  extend(DiscussionListItem.prototype, 'mainView', function (this: any, vdom: any) {
    const excerpt = this.attrs.discussion.attribute('hearthExcerpt');
    if (!excerpt || this.attrs.params?.q || !Array.isArray(vdom?.children)) return;

    // Read from the info line already built, not by building it again.
    const info = vdom.children.find((c: any) => c?.attrs?.className === 'DiscussionListItem-info');
    const has = (c: any) => /\bitem-excerpt\b/.test(c?.attrs?.className || '');
    if (Array.isArray(info?.children) && info.children.some(has)) return;

    vdom.children.push(<p className="HearthExcerpt">{excerpt}</p>);
  });

  /*
   * Core shows EITHER the unread count or the reply count in one control. Here
   * both are shown: the amber "N new" pill (which, like core's, marks the
   * discussion read when tapped) and the total underneath.
   */
  extend(DiscussionListItem.prototype, 'statsItems', function (this: any, items: any) {
    const discussion = this.attrs.discussion;
    const unread = discussion.isUnread() && !this.showRepliesCount();
    const replies = discussion.replyCount() || 0;

    if (items.has('replyCount')) items.remove('replyCount');

    items.add(
      'hearthCounts',
      <div className="HearthCounts">
        {unread ? (
          <button
            type="button"
            className="HearthNew"
            title={t('list.mark_read')}
            onclick={(e: MouseEvent) => {
              e.preventDefault();
              this.markAsRead();
            }}
          >
            {t('list.new', { count: discussion.unreadCount(), formatted: abbreviateNumber(discussion.unreadCount()) })}
          </button>
        ) : null}
        <span className="HearthReplies">{t('list.replies', { count: replies, formatted: abbreviateNumber(replies) })}</span>
      </div>,
      70
    );
  });
}
