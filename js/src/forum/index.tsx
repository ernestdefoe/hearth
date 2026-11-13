import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
import WelcomeCard from './welcome';
import installList from './list';
import installStream from './stream';
import installHero from './hero';
import installShelf from './shelf';
import installEvening from './evening';
import installHouseRules from './houseRules';
import installPantryPills from './pantryPills';
import { enabled } from './util';

export { default as WelcomeCard } from './welcome';
export { HouseRules } from './houseRules';

// NOTE: the admin extender is exported from js/src/admin and NOWHERE else: it
// imports flarum/admin/app, which does not exist on the forum.

/** Hearth's welcome card stands in for core's welcome hero on the plain index. */
function ownsWelcome(): boolean {
  // Homecoming's welcome strip is the same greeting with more in it: with it
  // on, Hearth draws none of its own (and Homecoming's strip is styled to fit).
  if (enabled('ernestdefoe-homecoming')) return false;
  if (app.forum.attribute('hearthWelcome') === false) return false;

  const params = app.search.state?.params?.() || {};

  return !params.tags && !params.q;
}

/*
 * Priority -100 so this runs AFTER other extensions' initializers: Hearth
 * wraps what flarum/tags and others have already added (the tag hero, the
 * sidebar) instead of being wrapped by them.
 */
app.initializers.add(
  'ernestdefoe-hearth',
  () => {
    override(IndexPage.prototype, 'hero', function (original) {
      return ownsWelcome() ? null : original();
    });

    extend(IndexPage.prototype, 'contentItems', function (items) {
      if (ownsWelcome()) items.add('hearthWelcome', <WelcomeCard />, 110);
    });

    installList();
    installStream();
    installHero();
    installShelf();
    installEvening();
    installHouseRules();
    installPantryPills();
  },
  -100
);
