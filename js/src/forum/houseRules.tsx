import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import IndexSidebar from 'flarum/forum/components/IndexSidebar';
import { fof, hasFofWidgets, placed } from '../common/fofWidgets';
import { t } from './util';

const EXT = 'ernestdefoe-hearth';
const KEY = 'houseRules';

function rules(): string {
  return app.forum.attribute<string>('hearthHouseRules') || '';
}

/** The owner's house rules on a dashed card. Plain text, line breaks kept. */
export function HouseRules({ className = '' }: { className?: string }) {
  const text = rules();
  if (!text) return null;

  return (
    <section className={'HearthCard HearthCard--dashed HearthHouseRules ' + className}>
      <h3 className="HearthCard-title">{t('house_rules.title')}</h3>
      <p className="HearthCard-text">{text}</p>
    </section>
  );
}

/**
 * Under the pantry in the index sidebar, unless FoF Forum Widgets places the
 * card somewhere: then only that copy shows.
 */
export default function installHouseRules() {
  extend(IndexSidebar.prototype, 'items', function (items) {
    // The discussion list's sidebar only: the Tags page shares IndexSidebar
    // but lays it out as a row of tabs, where a card has no place.
    if (!rules() || app.current.get('routeName') === 'tags' || (hasFofWidgets() && placed(app, EXT, KEY))) return;

    items.add('hearthHouseRules', HouseRules({}), -100);
  });

  registerWidget();
}

function registerWidget() {
  if (!hasFofWidgets()) return;

  try {
    const Widgets = fof('common/extend/Widgets');
    const WidgetBase = fof('common/components/Widget');
    if (!Widgets || !WidgetBase || !(app as any).widgets) return;

    class HouseRulesWidget extends WidgetBase {
      className() {
        return 'HearthWidget HearthWidget--rules';
      }
      icon() {
        return 'fas fa-mug-hot';
      }
      title() {
        return null;
      }
      content() {
        return HouseRules({ className: 'HearthHouseRules--widget' });
      }
    }

    new Widgets()
      .add({
        key: KEY,
        component: HouseRulesWidget,
        title: () => t('house_rules.title'),
        icon: 'fas fa-mug-hot',
        // Opt-in: shown only where the admin placed it, and only with text.
        isDisabled: () => !placed(app, EXT, KEY) || !rules(),
        isUnique: true,
        placement: 'end',
        position: 0,
      })
      .extend(app, EXT);
  } catch (e) {
    // A widget host whose internals moved must not take the forum down.
    console.warn('[hearth] widget registration failed', e);
  }
}
