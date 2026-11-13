<?php

/*
 * This file is part of ernestdefoe/hearth.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Hearth\Tests\integration\api;

use Carbon\Carbon;
use Flarum\Discussion\Discussion;
use Flarum\Post\Post;
use Flarum\Testing\integration\RetrievesAuthorizedUsers;
use Flarum\Testing\integration\TestCase;
use Flarum\User\User;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;

/**
 * 🚨 The N+1 gate: the discussion list costs the same number of queries for
 * 1 row and for 20, guest and admin, and Hearth's share is the one eager load
 * of first posts for the excerpt.
 */
class QueryCountTest extends TestCase
{
    use RetrievesAuthorizedUsers;

    protected function seed(int $from, int $to): void
    {
        $now = Carbon::now();
        $users = $discussions = $posts = [];

        if ($from === 1) {
            for ($u = 2; $u <= 6; $u++) {
                $users[] = ['id' => $u, 'username' => "member$u", 'email' => "member$u@machine.local", 'is_email_confirmed' => 1];
            }
        }
        for ($d = $from; $d <= $to; $d++) {
            $author = 2 + ($d % 5);
            $discussions[] = ['id' => $d, 'title' => "Discussion $d", 'created_at' => $now->copy()->subMinutes($d), 'last_posted_at' => $now->copy()->subMinutes($d), 'user_id' => $author, 'first_post_id' => $d, 'comment_count' => 1, 'last_posted_user_id' => $author];
            $posts[] = ['id' => $d, 'discussion_id' => $d, 'number' => 1, 'created_at' => $now->copy()->subMinutes($d), 'user_id' => $author, 'type' => 'comment', 'content' => "<t><p>Opening post $d, long enough for an excerpt.</p></t>"];
        }

        $this->prepareDatabase([User::class => $users, Discussion::class => $discussions, Post::class => $posts]);
    }

    private function queries(?int $actor): int
    {
        $db = $this->database();
        $db->flushQueryLog();
        $db->enableQueryLog();

        $options = $actor ? ['authenticatedAs' => $actor] : [];
        $response = $this->send($this->request('GET', '/api/discussions', $options));
        $this->assertSame(200, $response->getStatusCode());

        $count = count($db->getQueryLog());
        $db->disableQueryLog();

        return $count;
    }

    public static function actors(): array
    {
        return ['guest' => [null], 'admin' => [1]];
    }

    #[Test]
    #[DataProvider('actors')]
    public function the_list_costs_the_same_for_one_row_and_twenty(?int $actor)
    {
        $this->extension('ernestdefoe-hearth');
        $this->seed(1, 1);
        // The first request of a process warms settings and caches; measure after it.
        $this->queries($actor);
        $one = $this->queries($actor);

        $this->seed(2, 20);
        $twenty = $this->queries($actor);

        $this->assertSame($one, $twenty, "1 row: $one queries, 20 rows: $twenty");
    }
}
