import app from 'flarum/admin/app';
import Admin from 'flarum/common/extenders/Admin';
import ColorRow, { type Preset } from './ColorRow';

const t = (key: string) => app.translator.trans(`ernestdefoe-hearth.admin.settings.${key}`);

/*
 * 🚨 An Admin extender, not `app.extensionData` (gone in Flarum 2), and
 * exported from here ONLY: this file imports flarum/admin/app.
 *
 * 🚨 Every setting has a reader, named in extend.php beside its default.
 * Select options are keyed by words, never numbers (numeric keys get re-sorted).
 */
const c = (key: string) => app.translator.trans(`ernestdefoe-hearth.admin.colors.${key}`);

/** The colours from the design canvas's Theme colors, named. */
const COLORS: { key: string; fallback: string; presets: Preset[] }[] = [
  {
    key: 'accent',
    fallback: '#4F6F4B',
    presets: [
      { name: 'sage', hex: '#4F6F4B' },
      { name: 'clay', hex: '#A4502F' },
      { name: 'lake', hex: '#3F5F8A' },
      { name: 'plum', hex: '#7A4E7E' },
    ],
  },
  {
    key: 'paper',
    fallback: '#F5EEE2',
    presets: [
      { name: 'oat', hex: '#F5EEE2' },
      { name: 'linen', hex: '#F7F1EA' },
      { name: 'fern', hex: '#EEF0E6' },
      { name: 'rose', hex: '#F3ECEF' },
    ],
  },
  {
    key: 'evening_accent',
    fallback: '#A9C4A0',
    presets: [
      { name: 'sage', hex: '#A9C4A0' },
      { name: 'clay', hex: '#E3A07F' },
      { name: 'lake', hex: '#9DB8DD' },
      { name: 'plum', hex: '#C5A3C9' },
    ],
  },
  {
    key: 'evening_ground',
    fallback: '#1F1814',
    presets: [
      { name: 'ember', hex: '#1F1814' },
      { name: 'moss', hex: '#1A1D18' },
      { name: 'ink', hex: '#191C22' },
      { name: 'damson', hex: '#1F181D' },
    ],
  },
];

export const extend = [
  new Admin()
    // Read by src/Palette.php: the four base colours every other colour is derived from.
    .customSetting(function (this: any) {
      return (
        <div className="HearthColors">
          <h3 className="HearthColors-title">{c('title')}</h3>
          <p className="helpText">{c('intro')}</p>
          {COLORS.map((color) => (
            <ColorRow
              name={color.key}
              label={c(color.key + '_label')}
              help={c(color.key + '_help')}
              presets={color.presets}
              fallback={color.fallback}
              stream={this.setting('ernestdefoe-hearth.' + color.key, color.fallback)}
            />
          ))}
        </div>
      );
    }, 100)
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
