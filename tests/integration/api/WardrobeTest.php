<?php

/*
 * This file is part of ernestdefoe/hearth.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Hearth\Tests\integration\api;

use ErnestDefoe\Hearth\Tests\integration\HearthTestCase;
use PHPUnit\Framework\Attributes\Test;

/**
 * Under ernestdefoe/wardrobe, a visitor on another theme pays for none of
 * Hearth's server-side work (font preloads, the excerpt eager load), and a
 * visitor on Hearth gets all of it.
 *
 * Wardrobe accepts any enabled extension id as a theme, so flarum-tags
 * stands in for "another theme" here.
 */
class WardrobeTest extends HearthTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('flarum-tags', 'ernestdefoe-wardrobe', 'ernestdefoe-hearth');
        $this->setting('wardrobe.themes', json_encode(['flarum-tags', 'ernestdefoe-hearth']));
        $this->setting('wardrobe.default', 'flarum-tags');
    }

    private function page(?string $cookie): string
    {
        $request = $this->request('GET', '/');

        if ($cookie) {
            $request = $request->withCookieParams(['wardrobe_theme' => $cookie]);
        }

        return (string) $this->send($request)->getBody();
    }

    #[Test]
    public function a_guest_on_another_theme_gets_none_of_hearth()
    {
        $html = $this->page(null);

        $this->assertStringNotContainsString('young-serif-latin-400-normal.woff2', $html);
        $this->assertStringNotContainsString('hearthExcerpt', $html);
    }

    #[Test]
    public function a_guest_who_chose_hearth_gets_all_of_it_including_the_boot_payload()
    {
        $html = $this->page('ernestdefoe-hearth');

        $this->assertStringContainsString('young-serif-latin-400-normal.woff2', $html);
        $this->assertStringContainsString('nunito-latin-wght-normal.woff2', $html);
        $this->assertStringContainsString('hearthExcerpt', $html);
    }
}
