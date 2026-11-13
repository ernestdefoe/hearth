import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
import Link from 'flarum/common/components/Link';
import { t } from './util';

/**
 * On phones the sidebar is a dropdown, so the pantry (the primary tags) is a
 * row of pills under the welcome card that scrolls sideways. Hidden from
 * tablets up by CSS, where the sidebar shows the same links.
 */
export default function installPantryPills() {
  extend(IndexPage.prototype, 'contentItems', function (items) {
    if (!('flarum-tags' in (flarum.extensions || {}))) return;

    const current = app.search.state?.params?.().tags;
    const tags = app.store
      .all<any>('tags')
      .filter((tag) => tag.position() !== null && !tag.isChild())
      .sort((a, b) => a.position() - b.position());

    if (!tags.length) return;

    items.add(
      'hearthPills',
      <nav className="HearthPills" aria-label={t('pills.label')}>
        <Link className={'HearthPill' + (!current ? ' HearthPill--on' : '')} href={app.route('index')}>
          {t('pills.all')}
        </Link>
        {tags.map((tag) => (
          <Link
            className={'HearthPill' + (current === tag.slug() ? ' HearthPill--on' : '')}
            href={app.route.tag(tag)}
            style={tag.color() ? { '--hearth-dot': tag.color() } : undefined}
          >
            <span className="HearthPill-dot" aria-hidden="true" />
            {tag.name()}
          </Link>
        ))}
      </nav>,
      105
    );
  });
}
