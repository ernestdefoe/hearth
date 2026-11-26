import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import extractText from 'flarum/common/utils/extractText';

const t = (key: string, params: Record<string, any> = {}) => app.translator.trans(`ernestdefoe-hearth.admin.colors.${key}`, params);

/** The first preset of each row is Hearth's default (src/Palette.php holds the same). */
export interface Preset {
  /** Locale key under admin.colors.presets */
  name: string;
  hex: string;
}

interface Attrs {
  /** The setting's own key, for the field ids. */
  name: string;
  label: any;
  help: any;
  presets: Preset[];
  /** A settings stream: () => value, (value) => set. */
  stream: (value?: string) => string;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * One of Hearth's four colours: named presets as swatches, a colour picker,
 * and the hex for anyone who has a colour in mind. All three write the same
 * setting; the server checks it again (src/Palette.php) before it reaches
 * the page.
 */
export default class ColorRow extends Component<Attrs> {
  view() {
    const { name, label, help, presets, stream } = this.attrs;
    const fallback = presets[0].hex;
    const raw = String(stream() || '');
    const current = HEX.test(raw) ? raw.toUpperCase() : fallback;
    const id = 'hearth-color-' + name;
    // Translations come back as vnodes; attributes need plain text.
    const text = extractText(label);

    return (
      <div className="Form-group HearthColorRow">
        <label htmlFor={id}>{label}</label>
        <div className="helpText">{help}</div>
        <div className="HearthColorRow-controls">
          {this.swatches(text, current)}
          <input
            id={id}
            type="color"
            className="HearthColorRow-picker"
            value={current.toLowerCase()}
            aria-label={extractText(t('custom_label', { label: text }))}
            oninput={(e: InputEvent) => stream(((e.target as HTMLInputElement).value || '').toUpperCase())}
          />
          <input
            type="text"
            className="FormControl HearthColorRow-hex"
            value={raw}
            maxlength={7}
            spellcheck={false}
            aria-label={extractText(t('hex_label', { label: text }))}
            placeholder={fallback}
            oninput={(e: InputEvent) => stream((e.target as HTMLInputElement).value.trim())}
          />
        </div>
        {raw && !HEX.test(raw) ? <div className="HearthColorRow-error">{t('invalid', { fallback })}</div> : null}
      </div>
    );
  }

  /** The named presets as swatches; the one in use is pressed. */
  swatches(label: string, current: string) {
    return (
      <div className="HearthColorRow-swatches" role="group" aria-label={extractText(t('presets_label', { label }))}>
        {this.attrs.presets.map((preset) => {
          const on = preset.hex.toUpperCase() === current;
          const presetName = extractText(t('presets.' + preset.name));

          return (
            <button
              type="button"
              className={'HearthColorRow-swatch' + (on ? ' is-on' : '')}
              aria-pressed={on ? 'true' : 'false'}
              title={presetName + ' ' + preset.hex}
              onclick={() => this.attrs.stream(preset.hex)}
            >
              <span className="HearthColorRow-chip" style={{ background: preset.hex }} aria-hidden="true" />
              <span className="HearthColorRow-name">{presetName}</span>
            </button>
          );
        })}
      </div>
    );
  }
}
