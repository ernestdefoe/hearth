<?php

/*
 * This file is part of ernestdefoe/hearth.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Hearth;

use Flarum\Settings\SettingsRepositoryInterface;

/**
 * The owner's four colours, as the CSS that sets them.
 *
 * Every other colour in Hearth (cards, lines, tints, hovers, the bubbles of
 * your own posts, the buttons) is derived from these four in the stylesheet
 * with color-mix(), so one pick recolours everything.
 *
 * 🚨 A value only reaches the page as `#rrggbb`, checked here: anything else
 * (a typo, a value pasted with quotes or a `</style>`) falls back to the
 * default. Paper must be light and the Evening ground dark, or Hearth's text
 * colours would stop being readable on them; a value on the wrong side falls
 * back too.
 */
class Palette
{
    /** @var array<string, array{0: string, 1: string}> setting => [default, CSS property] */
    public const COLORS = [
        'accent' => ['#4F6F4B', '--hearth-accent'],
        'paper' => ['#F5EEE2', '--hearth-paper'],
        'evening_accent' => ['#A9C4A0', '--hearth-evening-accent'],
        'evening_ground' => ['#1F1814', '--hearth-ground'],
    ];

    public function __construct(protected SettingsRepositoryInterface $settings)
    {
    }

    /** @return array<string, string> setting => a safe #rrggbb */
    public function colors(): array
    {
        $colors = [];

        foreach (self::COLORS as $key => [$default]) {
            $value = $this->settings->get("ernestdefoe-hearth.$key");
            $colors[$key] = self::valid($key, is_string($value) ? $value : '') ?? $default;
        }

        return $colors;
    }

    public static function valid(string $key, string $value): ?string
    {
        $value = trim($value);

        if (! preg_match('/^#[0-9a-fA-F]{6}$/', $value)) {
            return null;
        }

        $luminance = self::luminance($value);

        return match ($key) {
            'paper' => $luminance >= 0.6 ? strtoupper($value) : null,
            'evening_ground' => $luminance <= 0.05 ? strtoupper($value) : null,
            default => strtoupper($value),
        };
    }

    /**
     * The `<style>` for the page, or '' when every colour is the default (the
     * stylesheet already carries those).
     */
    public function style(): string
    {
        $colors = $this->colors();
        $rules = [];
        $evening = [];

        foreach (self::COLORS as $key => [$default, $property]) {
            if ($colors[$key] !== $default) {
                $rules[] = "$property:{$colors[$key]}";
            }
        }

        // The text on a button follows the button: light on a dark accent,
        // dark on a light one.
        if ($colors['accent'] !== self::COLORS['accent'][0]) {
            $rules[] = '--hearth-on-accent:'.self::onColor($colors['accent']);
        }
        if ($colors['evening_accent'] !== self::COLORS['evening_accent'][0]) {
            $evening[] = '--hearth-on-sage:'.self::onColor($colors['evening_accent']);
        }

        if (! $rules && ! $evening) {
            return '';
        }

        // :root:root outranks the stylesheet's :root, wherever the tag lands.
        $css = $rules ? ':root:root{'.implode(';', $rules).'}' : '';
        $css .= $evening ? ':root:root[data-theme^="dark"]{'.implode(';', $evening).'}' : '';

        return '<style id="hearth-palette">'.$css.'</style>';
    }

    /** Relative luminance (WCAG), 0 = black, 1 = white. */
    public static function luminance(string $hex): float
    {
        $channels = array_map(function (string $pair): float {
            $c = hexdec($pair) / 255;

            return $c <= 0.03928 ? $c / 12.92 : (($c + 0.055) / 1.055) ** 2.4;
        }, str_split(substr($hex, 1), 2));

        return 0.2126 * $channels[0] + 0.7152 * $channels[1] + 0.0722 * $channels[2];
    }

    /** White or Hearth's ink, whichever reads better on this colour. */
    public static function onColor(string $hex): string
    {
        $l = self::luminance($hex);
        $onWhite = 1.05 / ($l + 0.05);
        $onInk = ($l + 0.05) / (self::luminance('#1F1814') + 0.05);

        return $onWhite >= $onInk ? '#FFFFFF' : '#1F1814';
    }
}
