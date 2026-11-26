<?php

/*
 * This file is part of ernestdefoe/hearth.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Hearth\Tests\integration\api;

use ErnestDefoe\Hearth\Tests\integration\HearthTestCase;
use ErnestDefoe\Hearth\WelcomeButton;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;

/**
 * The welcome card's guest button: the owner's own text and link reach the
 * forum payload, and only an http(s) URL or a path on this forum can become
 * the link (Discuss d/40361/3 asked how to change it).
 */
class WelcomeButtonTest extends HearthTestCase
{
    /** @return array<string, mixed> */
    private function forum(): array
    {
        [, $body] = $this->get('/api');

        return $body['data']['attributes'];
    }

    #[Test]
    public function by_default_the_button_keeps_hearths_text_and_the_sign_up_dialog()
    {
        $attributes = $this->forum();

        $this->assertSame('', $attributes['hearthWelcomeButtonLabel']);
        $this->assertSame('', $attributes['hearthWelcomeButtonUrl']);
    }

    #[Test]
    public function the_owners_text_and_link_reach_the_forum()
    {
        $this->setting('ernestdefoe-hearth.welcome_button_label', '  Wọlé   wá  ');
        $this->setting('ernestdefoe-hearth.welcome_button_url', 'https://example.com/apply?from=forum');

        $attributes = $this->forum();

        $this->assertSame('Wọlé wá', $attributes['hearthWelcomeButtonLabel']);
        $this->assertSame('https://example.com/apply?from=forum', $attributes['hearthWelcomeButtonUrl']);
    }

    /** @return array<string, array{0: string, 1: string}> */
    public static function urls(): array
    {
        return [
            'https' => ['https://example.com/join', 'https://example.com/join'],
            'http' => ['http://example.com', 'http://example.com'],
            'a path on this forum' => ['/p/join', '/p/join'],
            'surrounding spaces' => ['  /signup  ', '/signup'],
            'javascript' => ['javascript:alert(1)', ''],
            'javascript behind a control character' => ["\x01javascript:alert(1)", ''],
            'javascript split by a tab' => ["java\tscript:alert(1)", ''],
            'data' => ['data:text/html,<script>alert(1)</script>', ''],
            'protocol-relative' => ['//evil.example/', ''],
            'backslash path' => ['/\\evil.example', ''],
            'no host' => ['https://', ''],
            'bare word' => ['register', ''],
            'empty' => ['', ''],
        ];
    }

    #[Test]
    #[DataProvider('urls')]
    public function only_an_http_link_or_a_path_on_this_forum_is_kept(string $input, string $expected)
    {
        $this->assertSame($expected, WelcomeButton::url($input));
    }

    #[Test]
    public function a_long_label_is_cut_to_forty_characters()
    {
        $this->assertSame(40, mb_strlen(WelcomeButton::label(str_repeat('ẹ', 60))));
    }
}
