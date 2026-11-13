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

class PaletteTest extends HearthTestCase
{
    private function page(): string
    {
        return (string) $this->send($this->request('GET', '/'))->getBody();
    }

    #[Test]
    public function the_defaults_add_no_style_tag()
    {
        $this->assertStringNotContainsString('hearth-palette', $this->page());
    }

    #[Test]
    public function the_owners_colors_reach_the_page_with_readable_button_text()
    {
        $this->setting('ernestdefoe-hearth.accent', '#a4502f');
        $this->setting('ernestdefoe-hearth.paper', '#F3ECEF');
        $this->setting('ernestdefoe-hearth.evening_accent', '#9DB8DD');
        $this->setting('ernestdefoe-hearth.evening_ground', '#191C22');

        $html = $this->page();

        $this->assertStringContainsString('<style id="hearth-palette">:root:root{--hearth-accent:#A4502F;--hearth-paper:#F3ECEF;--hearth-evening-accent:#9DB8DD;--hearth-ground:#191C22;--hearth-on-accent:#FFFFFF}', $html);
        $this->assertStringContainsString(':root:root[data-theme^="dark"]{--hearth-on-sage:#1F1814}', $html);
    }

    #[Test]
    public function anything_but_a_hex_color_falls_back_and_never_reaches_the_page()
    {
        $this->setting('ernestdefoe-hearth.accent', 'red;}</style><script>alert(1)</script>');
        $this->setting('ernestdefoe-hearth.paper', '#F5EEE2"');

        $html = $this->page();

        $this->assertStringNotContainsString('alert(1)', $html);
        $this->assertStringNotContainsString('hearth-palette', $html);
    }

    #[Test]
    public function a_dark_paper_or_a_light_evening_ground_falls_back_so_text_stays_readable()
    {
        $this->setting('ernestdefoe-hearth.paper', '#222222');
        $this->setting('ernestdefoe-hearth.evening_ground', '#FFFFFF');

        $this->assertStringNotContainsString('hearth-palette', $this->page());
    }
}
