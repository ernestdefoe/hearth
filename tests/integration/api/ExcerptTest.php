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

class ExcerptTest extends HearthTestCase
{
    #[Test]
    public function the_list_carries_a_plain_text_excerpt_without_quotes()
    {
        [$status, $body] = $this->get('/api/discussions');

        $this->assertSame(200, $status);
        $this->assertSame('Dough on Saturday.', $this->excerpts($body)['Cardamom buns']);
    }

    #[Test]
    public function a_hidden_first_post_is_never_an_excerpt_even_for_an_admin()
    {
        [, $body] = $this->get('/api/discussions', 1);
        $excerpts = $this->excerpts($body);

        $this->assertArrayHasKey('Hidden opener', $excerpts);
        $this->assertNull($excerpts['Hidden opener']);
        $this->assertStringNotContainsString('secret words', json_encode($body));
    }

    #[Test]
    public function a_single_discussion_carries_no_excerpt()
    {
        [, $body] = $this->get('/api/discussions/1');

        $this->assertArrayNotHasKey('hearthExcerpt', $body['data']['attributes']);
    }

    #[Test]
    public function the_forum_carries_the_settings_the_theme_reads()
    {
        $this->setting('ernestdefoe-hearth.house_rules', "  Be kind.\nShare recipes.  ");

        [, $body] = $this->get('/api');
        $attributes = $body['data']['attributes'];

        $this->assertSame("Be kind.\nShare recipes.", $attributes['hearthHouseRules']);
        $this->assertTrue($attributes['hearthWelcome']);
        $this->assertSame('north', $attributes['hearthSeasons']);
        $this->assertTrue($attributes['hearthShelf']);
        $this->assertTrue($attributes['hearthOwnRight']);
    }
}
