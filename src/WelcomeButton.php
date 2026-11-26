<?php

/*
 * This file is part of ernestdefoe/hearth.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Hearth;

/**
 * The owner's own text and link for the welcome card's guest button ("Join
 * in"). Both are optional: empty text keeps Hearth's translation, and an
 * empty link keeps Flarum's sign-up dialog.
 *
 * 🚨 The link reaches every guest's page as an href, so it is allow-listed:
 * an http(s) URL or a path on this forum. Control characters are stripped
 * first (`\x01javascript:` would otherwise slip past a scheme check), and a
 * protocol-relative `//host` is refused like any other scheme.
 */
class WelcomeButton
{
    public const MAX_LABEL = 40;

    public static function url(mixed $value): string
    {
        $url = trim((string) preg_replace('/[\x00-\x20\x7F]+/u', '', (string) $value));

        if ($url === '' || strlen($url) > 2000) {
            return '';
        }

        if (preg_match('#^/(?![/\\\\])#', $url)) {
            return $url;
        }

        if (preg_match('#^https?://[^/\s?\#]+#i', $url) && filter_var($url, FILTER_VALIDATE_URL)) {
            return $url;
        }

        return '';
    }

    public static function label(mixed $value): string
    {
        $label = trim((string) preg_replace('/\s+/u', ' ', (string) $value));

        return mb_substr($label, 0, self::MAX_LABEL);
    }
}
