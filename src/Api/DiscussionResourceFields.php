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
use Flarum\Post\CommentPost;
use s9e\TextFormatter\Utils;

/**
 * The one-line excerpt under each discussion title.
 */
class DiscussionResourceFields
{
    public const EXCERPT_LENGTH = 160;

    public function __construct(protected ActiveTheme $theme)
    {
    }

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
                ->visible(fn (Discussion $discussion, Context $context): bool => $context->listing() && $this->wanted($context))
                ->get(fn (Discussion $discussion): ?string => $this->excerpt($discussion)),
        ];
    }

    /**
     * Hearth's own excerpt is wanted when the visitor is on Hearth.
     *
     * 🚨 With fof/synopsis enabled the forum already has an excerpt (the
     * owner's choice of post and length, per tag, and each member's "show
     * excerpts" preference), so extend.php registers neither this field nor
     * its eager load then (Extend\Conditional). Hearth draws synopsis's in its
     * own slot under the title (list.tsx). Two excerpts per row was Lobby
     * 1.0.0's bug.
     */
    public function wanted(Context $context): bool
    {
        return $this->theme->isHearth($context->request);
    }

    public function excerpt(Discussion $discussion): ?string
    {
        $post = $discussion->relationLoaded('firstPost') ? $discussion->getRelation('firstPost') : null;

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

        $text = $this->plainText($post->parsed_content);

        return $text === '' ? null : $this->shorten($text);
    }

    /**
     * The post's own words as one line of plain text. Attachment markup
     * carries filenames and sizes, which read as noise in a sentence of
     * prose; quotes are somebody else's words; spoilers and collapsed
     * details are hidden on purpose and stay hidden here.
     */
    private function plainText(string $xml): string
    {
        foreach (['UPL-IMAGE-PREVIEW', 'UPL-FILE', 'QUOTE', 'POSTMENTION', 'SPOILER', 'ISPOILER', 'DETAILS'] as $tag) {
            $xml = Utils::removeTag($xml, $tag);
        }

        return trim(preg_replace('/\s+/u', ' ', Utils::removeFormatting($xml)) ?? '');
    }

    /** Cut at a word near EXCERPT_LENGTH, with an ellipsis. */
    private function shorten(string $text): string
    {
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
