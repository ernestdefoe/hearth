import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Link from 'flarum/common/components/Link';
import Button from 'flarum/common/components/Button';
import LogInModal from 'flarum/forum/components/LogInModal';
import SignUpModal from 'flarum/forum/components/SignUpModal';
import { Kettle, Lamp } from './art';
import { season } from './seasons';
import { t } from './util';

const HIDDEN_KEY = 'hearth.welcomeHidden';

function today(): string {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

/** "Good morning" … "Still up": the reader's own clock. */
export function partOfDay(hour = new Date().getHours()): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

/** Discussions on the loaded pages of the list with something unread. */
function unreadLoaded(): any[] {
  const state: any = app.discussions;
  if (!state?.getPages) return [];

  return state
    .getPages()
    .flatMap((page: any) => page.items || [])
    .filter((d: any) => d && d.isUnread?.());
}

/**
 * The welcome card above the discussion list: "Good afternoon, Mira." with
 * how many conversations have something new, and a button to the first one.
 * Guests get the forum's own welcome title and message, with sign-up.
 *
 * 🚨 Nothing is fetched: the count is read from the list already on screen.
 * A card that waits on a request is a card that jumps.
 */
export default class WelcomeCard extends Component {
  closed = false;

  view() {
    if (this.closed || this.hidden()) return null;

    const user = app.session.user;
    const evening = document.documentElement.getAttribute('data-theme')?.startsWith('dark');
    const s = season();
    const art = evening ? Lamp({ season: s }) : Kettle({ season: s });

    return (
      <section className={'HearthWelcome' + (s ? ' HearthWelcome--' + s : '')} aria-label={t('welcome.label')}>
        <div className="HearthWelcome-body">{user ? this.member(user) : this.guest()}</div>
        <div className="HearthWelcome-art">{art}</div>
        <Button
          className="Button Button--icon Button--link HearthWelcome-close"
          icon="fas fa-times"
          aria-label={t('welcome.hide')}
          onclick={() => this.hide()}
        />
      </section>
    );
  }

  member(user: any) {
    const unread = unreadLoaded();
    const loading = app.discussions?.isInitialLoading?.();
    const first = unread[0];
    const name = user.displayName();

    let line;
    if (loading) line = t('welcome.settling');
    else if (unread.length) line = t('welcome.unread_' + (evening() ? 'evening' : 'day'), { count: unread.length });
    else line = t('welcome.caught_up');

    return [
      <h2 className="HearthWelcome-title">{t('welcome.greeting_' + partOfDay(), { name })}</h2>,
      <p className="HearthWelcome-text">{line}</p>,
      first ? (
        <Link
          className="Button HearthWelcome-action"
          href={app.route.discussion(first, Math.min(first.lastPostNumber() || 1, (first.lastReadPostNumber() || 0) + 1))}
        >
          {t('welcome.catch_up')}
        </Link>
      ) : null,
    ];
  }

  guest() {
    const title = app.forum.attribute<string>('welcomeTitle')?.trim();
    const message = app.forum.attribute<string>('welcomeMessage')?.trim();
    const canSignUp = app.forum.attribute('allowSignUp');

    return [
      <h2 className="HearthWelcome-title">{title || t('welcome.guest_title')}</h2>,
      // The welcome message is the owner's own HTML, as core's hero renders it.
      <div className="HearthWelcome-text">{message ? m.trust(message) : t('welcome.guest_text')}</div>,
      <div className="HearthWelcome-actions">
        {canSignUp ? (
          <Button className="Button HearthWelcome-action" onclick={() => app.modal.show(SignUpModal)}>
            {t('welcome.sign_up')}
          </Button>
        ) : null}
        <Button className="Button Button--link HearthWelcome-login" onclick={() => app.modal.show(LogInModal)}>
          {t('welcome.log_in')}
        </Button>
      </div>,
    ];
  }

  /** Hidden for the rest of the day: it comes back tomorrow, like a greeting should. */
  hidden(): boolean {
    try {
      return localStorage.getItem(HIDDEN_KEY) === today();
    } catch (e) {
      return false;
    }
  }

  hide() {
    try {
      localStorage.setItem(HIDDEN_KEY, today());
    } catch (e) {
      // Storage blocked: hidden for this page only.
    }
    this.closed = true;
    m.redraw();
  }
}

function evening(): boolean {
  return partOfDay() === 'evening' || partOfDay() === 'night';
}
