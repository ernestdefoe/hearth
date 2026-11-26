<?php

/*
 * This file is part of ernestdefoe/hearth.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Hearth;

use Flarum\Foundation\AbstractServiceProvider;

/**
 * Registered only while Wardrobe is enabled (extend.php, Extend\Conditional):
 * tells ActiveTheme to ask Wardrobe which theme each visitor is on.
 */
class WardrobeProvider extends AbstractServiceProvider
{
    public function register(): void
    {
        $this->container->resolving(ActiveTheme::class, fn (ActiveTheme $theme) => $theme->useWardrobe());
    }
}
