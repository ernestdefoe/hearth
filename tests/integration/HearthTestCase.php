<?php

/*
 * This file is part of ernestdefoe/hearth.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Hearth\Tests\integration;

use Carbon\Carbon;
use Flarum\Discussion\Discussion;
use Flarum\Post\Post;
use Flarum\Testing\integration\RetrievesAuthorizedUsers;
use Flarum\Testing\integration\TestCase;
use Flarum\User\User;

/**
 * Users: 1 admin, 2 member.
 * Discussion 1 by 2: a first post with formatting and a quote.
 * Discussion 2 by 2: a HIDDEN first post (its text must never be an excerpt).
 */
abstract class HearthTestCase extends TestCase
{
    use RetrievesAuthorizedUsers;

    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('ernestdefoe-hearth');

        $now = Carbon::now();

        $this->prepareDatabase([
            User::class => [
                ['id' => 2, 'username' => 'normal', 'email' => 'normal@machine.local', 'is_email_confirmed' => 1],
            ],
            Discussion::class => [
                ['id' => 1, 'title' => 'Cardamom buns', 'created_at' => $now, 'last_posted_at' => $now, 'user_id' => 2, 'first_post_id' => 1, 'comment_count' => 1],
                ['id' => 2, 'title' => 'Hidden opener', 'created_at' => $now, 'last_posted_at' => $now->copy()->subMinute(), 'user_id' => 2, 'first_post_id' => 2, 'comment_count' => 1],
            ],
            Post::class => [
                ['id' => 1, 'discussion_id' => 1, 'number' => 1, 'created_at' => $now, 'user_id' => 2, 'type' => 'comment', 'content' => '<r><p>Dough on <STRONG><s>**</s>Saturday<e>**</e></STRONG>. <QUOTE><p>somebody else</p></QUOTE></p></r>'],
                ['id' => 2, 'discussion_id' => 2, 'number' => 1, 'created_at' => $now, 'user_id' => 2, 'type' => 'comment', 'content' => '<t><p>secret words</p></t>', 'hidden_at' => $now],
            ],
        ]);
    }

    /** @return array{0: int, 1: mixed} */
    protected function get(string $path, ?int $actor = null, array $query = []): array
    {
        $options = $actor ? ['authenticatedAs' => $actor] : [];
        $response = $this->send($this->request('GET', $path, $options)->withQueryParams($query));

        return [$response->getStatusCode(), json_decode((string) $response->getBody(), true)];
    }

    /** @return array<string, ?string> title => excerpt */
    protected function excerpts(array $body): array
    {
        $out = [];
        foreach ($body['data'] ?? [] as $row) {
            $out[$row['attributes']['title']] = $row['attributes']['hearthExcerpt'] ?? null;
        }

        return $out;
    }
}
