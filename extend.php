<?php

/*
 * This file is part of ernestdefoe/hearth.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

use ErnestDefoe\Hearth\ActiveTheme;
use ErnestDefoe\Hearth\Api;
use ErnestDefoe\Hearth\HearthServiceProvider;
use ErnestDefoe\Hearth\Http\DecideTheme;
use ErnestDefoe\Hearth\Palette;
use ErnestDefoe\Hearth\WardrobeProvider;
use ErnestDefoe\Hearth\WelcomeButton;
use Flarum\Api\Context;
use Flarum\Api\Endpoint;
use Flarum\Api\Resource;
use Flarum\Extend;
use Flarum\Frontend\Document;
use Illuminate\Contracts\Filesystem\Factory as Filesystems;
use Psr\Http\Message\ServerRequestInterface;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
        ->content(function (Document $document, ServerRequestInterface $request) {
            // A visitor on another Wardrobe theme gets none of this.
            if (! resolve(ActiveTheme::class)->isHearth($request)) {
                return;
            }

            /*
             * The two latin faces every page uses start loading with the
             * stylesheet instead of after it. latin-ext and the italic are
             * left to the browser: unicode-range fetches them only when a
             * page needs them.
             */
            $disk = resolve(Filesystems::class)->disk('flarum-assets');

            foreach (['young-serif-latin-400-normal', 'nunito-latin-wght-normal'] as $face) {
                $url = $disk->url("extensions/ernestdefoe-hearth/fonts/$face.woff2");
                $document->head[] = '<link rel="preload" href="'.e($url).'" as="font" type="font/woff2" crossorigin>';
            }

            // The owner's four colours, when they differ from Hearth's own.
            // Validated to #rrggbb in Palette; nothing else reaches the tag.
            if ($palette = resolve(Palette::class)->style()) {
                $document->head[] = $palette;
            }
        }),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),

    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\ServiceProvider())
        ->register(HearthServiceProvider::class),

    (new Extend\Middleware('forum'))
        ->add(DecideTheme::class),

    /*
     * 🚨 Every setting has a READER, named beside it. A setting with no
     * reader is a control that lies. String keys, not class constants:
     * extend.php must not autoload our own classes while composer updates.
     */
    (new Extend\Settings())
        // The four colours (accent, paper, evening_accent, evening_ground) are
        // read by Palette, which holds their defaults: no second copy here.
        // read by welcome.tsx: the welcome card above the discussion list
        ->default('ernestdefoe-hearth.welcome', true)
        ->serializeToForum('hearthWelcome', 'ernestdefoe-hearth.welcome', 'boolval')
        // read by welcome.tsx: the guest button's own text and link (empty = Hearth's
        // "Join in" and Flarum's sign-up dialog); checked in WelcomeButton
        ->default('ernestdefoe-hearth.welcome_button_label', '')
        ->serializeToForum('hearthWelcomeButtonLabel', 'ernestdefoe-hearth.welcome_button_label', fn ($value) => WelcomeButton::label($value))
        ->default('ernestdefoe-hearth.welcome_button_url', '')
        ->serializeToForum('hearthWelcomeButtonUrl', 'ernestdefoe-hearth.welcome_button_url', fn ($value) => WelcomeButton::url($value))
        // read by seasons.ts: north, south or off
        ->default('ernestdefoe-hearth.seasons', 'north')
        ->serializeToForum('hearthSeasons', 'ernestdefoe-hearth.seasons')
        // read by shelf.tsx: the Tags page as a shelf of jars
        ->default('ernestdefoe-hearth.shelf', true)
        ->serializeToForum('hearthShelf', 'ernestdefoe-hearth.shelf', 'boolval')
        // read by stream.tsx: your own posts on the right, like a chat
        ->default('ernestdefoe-hearth.own_right', true)
        ->serializeToForum('hearthOwnRight', 'ernestdefoe-hearth.own_right', 'boolval')
        // read by houseRules.tsx: the House rules card (plain text, Markdown-free)
        ->default('ernestdefoe-hearth.house_rules', '')
        ->serializeToForum('hearthHouseRules', 'ernestdefoe-hearth.house_rules', fn ($value) => trim((string) $value)),

    /*
     * The excerpt, unless fof/synopsis is enabled: then the forum already has
     * one, and Hearth registers neither the field nor its eager load.
     */
    (new Extend\Conditional())
        ->whenExtensionDisabled('fof-synopsis', fn () => [
            (new Extend\ApiResource(Resource\DiscussionResource::class))
                ->fields(Api\DiscussionResourceFields::class)
                /*
                 * The excerpt reads each row's first post. One eager load for the
                 * whole page, never a query per row, and only for a visitor on Hearth.
                 *
                 * 🚨 The WHOLE post, never a column subset: the eager load is shared,
                 * and another extension that includes `firstPost` would serialise the
                 * half-loaded model.
                 */
                ->endpoint('index', fn (Endpoint\Index $endpoint) => $endpoint->eagerLoad(
                    fn (array $included, Context $context) => resolve(Api\DiscussionResourceFields::class)->wanted($context) ? ['firstPost'] : []
                )),
        ]),

    // With Wardrobe, Hearth's server-side work is only done for visitors on Hearth.
    (new Extend\Conditional())
        ->whenExtensionEnabled('ernestdefoe-wardrobe', fn () => [
            (new Extend\ServiceProvider())->register(WardrobeProvider::class),
        ]),
];
