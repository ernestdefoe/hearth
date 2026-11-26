import { extend } from 'flarum/common/extend';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import abbreviateNumber from 'flarum/common/utils/abbreviateNumber';
import { t } from './util';

/**
 * The excerpt goes under the title, inside the row's own link, unless
 * something else (fof/synopsis, flarum/sticky's pinned excerpt, a search
 * result's matching post) already put one in the info line.
 */
function addExcerpt(this: any, vdom: any) {
  const excerpt = this.attrs.discussion.attribute('hearthExcerpt');
  if (!excerpt || this.attrs.params?.q || !Array.isArray(vdom?.children)) return;

  // Read from the info line already built, not by building it again.
  const info = vdom.children.find((c: any) => c?.attrs?.className === 'DiscussionListItem-info');
  const has = (c: any) => /\bitem-excerpt\b/.test(c?.attrs?.className || '');
  if (Array.isArray(info?.children) && info.children.some(has)) return;

  vdom.children.push(<p className="HearthExcerpt">{excerpt}</p>);
}

/** The amber "N new" pill (marks the discussion read, like core's) over the reply total. */
function counts(row: any) {
  const discussion = row.attrs.discussion;
  const unread = discussion.isUnread() && !row.showRepliesCount();
  const replies = discussion.replyCount() || 0;
  const markRead = (e: MouseEvent) => {
    e.preventDefault();
    row.markAsRead();
  };

  return (
    <div className="HearthCounts">
      {unread ? (
        <button type="button" className="HearthNew" title={t('list.mark_read')} onclick={markRead}>
          {t('list.new', { count: discussion.unreadCount(), formatted: abbreviateNumber(discussion.unreadCount()) })}
        </button>
      ) : null}
      <span className="HearthReplies">{t('list.replies', { count: replies, formatted: abbreviateNumber(replies) })}</span>
    </div>
  );
}

/**
 * Discussion rows as cards: an excerpt under the title, and on the right a
 * "3 new" pill above the reply count, as in the design. Core shows EITHER
 * the unread count or the reply count in one control; Hearth shows both.
 */
export default function installList() {
  extend(DiscussionListItem.prototype, 'mainView', addExcerpt);

  extend(DiscussionListItem.prototype, 'statsItems', function (this: any, items: any) {
    /*
     * 🚨 Only while the count is still core's own. An extension that put its
     * own content in that slot keeps it: Answers shows a question's answers
     * there, and Hearth's "N replies" (which counts comments too) replaced
     * it with a wrong number ("4 replies" on a question with one answer).
     */
    if (!items.has('replyCount') || items.get('replyCount')?.attrs?.className !== 'DiscussionListItem-count') return;

    items.remove('replyCount');
    items.add('hearthCounts', counts(this), 70);
  });
}
