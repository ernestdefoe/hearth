import { extend } from 'flarum/common/extend';
import IndexSidebar from 'flarum/forum/components/IndexSidebar';
import { t } from './util';

/**
 * "The pantry" over the tag links in the sidebar, as in the design. Slotted
 * between flarum/tags' separator (-12) and its tags (-14), and only when that
 * separator is there, so a forum without tags gets no orphan heading.
 */
export default function installPantryHeading() {
  extend(IndexSidebar.prototype, 'navItems', function (items) {
    if (!items.has('separator')) return;

    items.add('hearthPantry', <span className="HearthPantry">{t('pantry')}</span>, -13);
  });
}
