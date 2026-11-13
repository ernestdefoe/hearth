# Hearth

A warm, cozy theme for small hobby communities on **Flarum 2**: bakers, knitters, gardeners, model-railway clubs. Paper tones, Young Serif headings over Nunito, pill navigation, rounded cards, chat-bubble posts, drawn illustrations, and an amber-lit **Evening** mode for dark.

Hearth keeps Flarum's own page structure. It changes how the forum looks, not where things are, so extensions keep working.

## What it does

- **A welcome card** above the discussion list: "Good afternoon, Mira." with how many conversations have something new since your last visit, and a **Catch up** button to the first of them. Guests see your welcome title and message there, with **Join in** and **Log in**. It can be hidden until the next day. With [Homecoming](https://github.com/ernestdefoe/homecoming) enabled, Hearth uses Homecoming's welcome strip instead and styles it to match.
- **Discussions as rounded cards**, each with the author's avatar, the tags as soft pastel chips, a two-line excerpt of the first post, an amber **"3 new"** pill (tap it to mark the discussion read) and the reply count. Pinned discussions sit on a warmer card.
- **Pill navigation.** The sidebar's links are pills, and your tags are a "pantry" of coloured dots. On phones, the tags are a row of pills under the welcome card that scrolls sideways.
- **Chat-bubble posts.** Each post is a bubble under its author's name. Your own posts are on the right, in a soft green. Consecutive replies from one person within ten minutes are grouped: one avatar and name, then the next bubble. Quotes are a warm inset panel with a quote mark, code blocks scroll inside the bubble (never the page), and renamed / tagged / pinned notes are one small centred line.
- **A discussion header** tinted with the first tag's colour, with "Started by … · … ago · N replies" and a jar on the right, filled with the tag's colour.
- **The Tags page as a pantry shelf**: each tag a jar in its colour with its icon on the label, its count, description, child tags and latest discussion, sitting on wooden shelves.
- **Drawn illustrations**: a kettle and loaf on the welcome card, a lit lamp in Evening, jars for tags. All inline SVG coloured from the theme, so nothing is downloaded.
- **Evening**: Flarum's dark mode, done as lamplight rather than black, with a soft warm glow at the top of the page. If members may choose their colour scheme and core's own theme selector is off, a **Daytime / Evening** switch sits in the header.
- **Gentle seasonal touches**: a small sprig on the welcome card (snowflakes, blossom, sun, a leaf) that follows the season, northern or southern hemisphere. They switch themselves off while [Festoon](https://github.com/ernestdefoe/festoon) is enabled.
- **House rules**: a few friendly lines on a dashed card under the tags. With **FoF Forum Widgets** you can place the card wherever you like instead.

## Settings

| Setting | What it does |
|---|---|
| Show the welcome card | The greeting above the discussion list. |
| Put each member's own posts on the right | Off keeps every post on the left. |
| Show tags as a shelf of jars | Off shows flarum/tags' usual tiles. |
| Seasonal touches | Northern hemisphere, southern hemisphere, or off. |
| House rules | Plain text; line breaks are kept. Empty means no card. |

## Works with

- **flarum/tags**: the pantry, the chips, the shelf and the header colours.
- **ernestdefoe/wardrobe**: run Hearth beside other themes and let members choose. A visitor on another theme pays for none of Hearth's server-side work.
- **ernestdefoe/homecoming**, **ernestdefoe/festoon**, **fof/forum-widgets-core**: as above.
- **fof/synopsis** and flarum/sticky's pinned excerpts: when either already shows an excerpt, Hearth adds none of its own.

## Install

```bash
composer require ernestdefoe/hearth
```

Then enable **Hearth** in the admin panel.

## Fonts

Young Serif and Nunito are self-hosted from the forum's own assets (no Google Fonts request), under the SIL Open Font License (see `assets/fonts`).

## Licence

MIT
