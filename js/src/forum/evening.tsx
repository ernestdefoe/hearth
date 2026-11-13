import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import HeaderSecondary from 'flarum/forum/components/HeaderSecondary';
import Button from 'flarum/common/components/Button';
import { t } from './util';

function isEvening(): boolean {
  return !!document.documentElement.getAttribute('data-theme')?.startsWith('dark');
}

/**
 * Daytime ⇄ Evening, one tap in the header. Only on forums whose owner lets
 * members choose (Appearance → colour scheme "auto"); otherwise the owner's
 * choice stands and there is nothing to switch. When the owner turned on
 * core's own theme selector, that one is in the header instead: one switch,
 * not two.
 *
 * It sets the same preference as Settings → colour scheme: saved to the
 * account for members, kept for the browser session for guests (where core
 * itself looks for it).
 */
export default function installEvening() {
  extend(HeaderSecondary.prototype, 'items', function (items) {
    if (!(app as any).allowUserColorScheme || app.forum.attribute('showThemeSelector')) return;

    const evening = isEvening();
    const label = t(evening ? 'evening.to_day' : 'evening.to_evening');

    items.add(
      'hearthEvening',
      <Button
        className="Button Button--flat HearthEvening"
        icon={evening ? 'fas fa-sun' : 'fas fa-moon'}
        aria-label={label}
        title={label}
        onclick={() => toggle(!evening)}
      >
        <span className="HearthEvening-label">{t(evening ? 'evening.day' : 'evening.evening')}</span>
      </Button>,
      // Just before the notifications and the session menu.
      15
    );
  });
}

function toggle(evening: boolean) {
  const scheme = evening ? 'dark' : 'light';
  const user = app.session.user;

  app.setColorScheme(scheme);

  if (user) {
    user.savePreferences({ colorScheme: scheme });
  } else {
    try {
      sessionStorage.setItem('colorScheme', scheme);
    } catch (e) {
      // Storage blocked: Evening lasts for this page.
    }
  }

  m.redraw();
}
