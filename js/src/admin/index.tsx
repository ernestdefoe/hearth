import app from 'flarum/admin/app';
import Admin from 'flarum/common/extenders/Admin';

const t = (key: string) => app.translator.trans(`ernestdefoe-hearth.admin.settings.${key}`);

/*
 * 🚨 An Admin extender, not `app.extensionData` (gone in Flarum 2), and
 * exported from here ONLY: this file imports flarum/admin/app.
 *
 * 🚨 Every setting has a reader, named in extend.php beside its default.
 * Select options are keyed by words, never numbers (numeric keys get re-sorted).
 */
export const extend = [
  new Admin()
    .setting(() => ({
      setting: 'ernestdefoe-hearth.welcome',
      label: t('welcome_label'),
      help: t('welcome_help'),
      type: 'boolean',
      default: true,
    }))
    .setting(() => ({
      setting: 'ernestdefoe-hearth.own_right',
      label: t('own_right_label'),
      help: t('own_right_help'),
      type: 'boolean',
      default: true,
    }))
    .setting(() => ({
      setting: 'ernestdefoe-hearth.shelf',
      label: t('shelf_label'),
      help: t('shelf_help'),
      type: 'boolean',
      default: true,
    }))
    .setting(() => ({
      setting: 'ernestdefoe-hearth.seasons',
      label: t('seasons_label'),
      help: t('seasons_help'),
      type: 'select',
      options: {
        north: t('seasons_north'),
        south: t('seasons_south'),
        off: t('seasons_off'),
      },
      default: 'north',
    }))
    .setting(() => ({
      setting: 'ernestdefoe-hearth.house_rules',
      label: t('house_rules_label'),
      help: t('house_rules_help'),
      type: 'textarea',
    })),
];
