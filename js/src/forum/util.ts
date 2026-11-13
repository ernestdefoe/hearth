import app from 'flarum/forum/app';

/** Another extension's forum bundle is loaded, so that extension is on. */
export function enabled(id: string): boolean {
  return !!flarum?.extensions && id in flarum.extensions;
}

export const t = (key: string, params: Record<string, any> = {}) => app.translator.trans(`ernestdefoe-hearth.forum.${key}`, params);
