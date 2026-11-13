<?php

/*
 * This file is part of ernestdefoe/hearth.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Hearth\Api;

use ErnestDefoe\Hearth\ActiveTheme;
use Flarum\Api\Context;
use Flarum\Api\Schema;
use Flarum\Discussion\Discussion;
use Flarum\Extension\ExtensionManager;
use Flarum\Post\CommentPost;
use s9e\TextFormatter\Utils;

/**
 * The one-line excerpt under each discussion title.
 */
class DiscussionResourceFields
{
    public const EXCERPT_LENGTH = 160;

    public function __invoke(): array
    {
        return [
            /*
             * Plain text, never markup: an excerpt is a hint, and letting post
             * formatting into a list row means one bad paste restyles the page.
             *
             * 🚨 Read from the `firstPost` the index endpoint eager-loads for
             * the whole page in one query (extend.php). A discussion without
             * the relation loaded gets no excerpt rather than a lazy load.
             */
            Schema\Str::make('hearthExcerpt')
                ->nullable()
                ->visible(fn (Discussion $discussion, Context $context): bool => $context->listing() && self::wanted($context))
                ->get(fn (Discussion $discussion): ?string => $this->excerpt($discussion)),
        ];
    }

    /**
     * Hearth's own excerpt is wanted when the visitor is on Hearth and
     * fof/synopsis is not enabled.
     *
     * 🚨 With fof/synopsis enabled, the forum already has an excerpt: the
     * owner's choice of first or last post and length, per tag, and each
     * member's "show excerpts" preference. Hearth draws synopsis's in its own
     * slot under the title (list.tsx) and does no excerpt work of its own: no
     * eager load, no field. Two excerpts per row was Lobby 1.0.0's bug.
     */
    public static function wanted(Context $context): bool
    {
        return ! resolve(ExtensionManager::class)->isEnabled('fof-synopsis')
            && resolve(ActiveTheme::class)->isHearth($context->request);
    }

    public function excerpt(Discussion $discussion): ?string
    {
        if (! $discussion->relationLoaded('firstPost')) {
            return null;
        }

        $post = $discussion->getRelation('firstPost');

        if (! $post instanceof CommentPost || ! is_string($post->parsed_content) || $post->parsed_content === '') {
            return null;
        }

        /*
         * The eager load goes through core's visibility scopes (every
         * Flarum 2 release applies each related resource's scope to an
         * endpoint's eagerLoad()), so a first post another extension hides
         * from this reader arrives as null: ExcerptTest proves it. A hidden
         * or unapproved first post still says nothing even to staff who
         * could open it: a list is not the place. Both are columns on the
         * loaded row, so the check costs no query.
         */
        if ($post->hidden_at !== null || $post->getAttribute('is_approved') === false || $post->getAttribute('is_approved') === 0) {
            return null;
        }

        $xml = $post->parsed_content;

        // Attachment markup carries filenames and sizes, which read as noise
        // in a sentence of prose. Quotes are somebody else's words. Spoilers
        // and collapsed details are hidden on purpose and stay hidden here.
        foreach (['UPL-IMAGE-PREVIEW', 'UPL-FILE', 'QUOTE', 'POSTMENTION', 'SPOILER', 'ISPOILER', 'DETAILS'] as $tag) {
            $xml = Utils::removeTag($xml, $tag);
        }

        $text = trim(preg_replace('/\s+/u', ' ', Utils::removeFormatting($xml)) ?? '');

        if ($text === '') {
            return null;
        }

        if (mb_strlen($text) <= self::EXCERPT_LENGTH) {
            return $text;
        }

        $cut = mb_substr($text, 0, self::EXCERPT_LENGTH);
        $space = mb_strrpos($cut, ' ');

        // One long token (a URL, a CJK run) must not collapse it to nothing.
        if ($space !== false && $space > self::EXCERPT_LENGTH * 0.6) {
            $cut = mb_substr($cut, 0, $space);
        }

        return rtrim($cut).'…';
    }
}
