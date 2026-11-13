import app from 'flarum/forum/app';
import { override } from 'flarum/common/extend';
import Link from 'flarum/common/components/Link';
import humanTime from 'flarum/common/helpers/humanTime';
import abbreviateNumber from 'flarum/common/utils/abbreviateNumber';
import { ShelfJar } from './art';
import { t } from './util';

/**
 * The Tags page as a pantry shelf: each tag is a jar in its own colour with
 * its icon on the label, its name and count below, its children as little
 * tags, and the latest discussion underneath. Rows sit on wooden shelves.
 *
 * Only the tile list is replaced; the page, its sidebar, its hero and the
 * cloud of unpositioned tags stay flarum/tags' own.
 */
export default function installShelf() {
  // 🚨 `ext:` + the package name: another extension's module path. Without it
  // the registry looks in core and the override silently never applies.
  override('ext:flarum/tags/forum/components/TagsPage' as any, 'tagTileListView' as any, function (this: any, original: any, ...args: unknown[]) {
    const pinned = args[0] as any[];
    if (app.forum.attribute('hearthShelf') === false) return original(pinned);

    return (
      <ul className="HearthShelf" aria-label={t('shelf.label')}>
        {pinned.map((tag) => jar(tag))}
      </ul>
    );
  });
}

function jar(tag: any) {
  const last = tag.lastPostedDiscussion?.();
  const children = (tag.children?.() || []).filter(Boolean).sort((a: any, b: any) => (a.position() ?? 0) - (b.position() ?? 0));
  const count = tag.discussionCount?.() || 0;

  return (
    <li className="HearthShelf-item" key={tag.id()}>
      <Link className="HearthShelf-jar" href={app.route.tag(tag)}>
        <span className="HearthShelf-art">
          {ShelfJar({ color: tag.color() || null })}
          {tag.icon() ? <i className={'HearthShelf-icon ' + tag.icon()} aria-hidden="true" /> : null}
        </span>
        <span className="HearthShelf-name">{tag.name()}</span>
        <span className="HearthShelf-count">{t('shelf.count', { count, formatted: abbreviateNumber(count) })}</span>
      </Link>
      {tag.description() ? <p className="HearthShelf-description">{tag.description()}</p> : null}
      {children.length ? (
        <div className="HearthShelf-children">
          {children.map((child: any) => (
            <Link className="HearthShelf-child" href={app.route.tag(child)}>
              {child.name()}
            </Link>
          ))}
        </div>
      ) : null}
      {last ? (
        <Link className="HearthShelf-last" href={app.route.discussion(last, last.lastPostNumber())}>
          <span className="HearthShelf-lastTitle">{last.title()}</span>
          {humanTime(last.lastPostedAt())}
        </Link>
      ) : null}
    </li>
  );
}
