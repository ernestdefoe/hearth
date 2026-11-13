<?php

/*
 * This file is part of ernestdefoe/hearth.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Hearth\Http;

use ErnestDefoe\Hearth\ActiveTheme;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

/**
 * Decides, from the real page request, whether this visitor is on Hearth,
 * before the forum page builds its payload through API sub-requests that
 * cannot see the visitor's cookies. See ActiveTheme.
 */
class DecideTheme implements MiddlewareInterface
{
    public function __construct(protected ActiveTheme $theme)
    {
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $this->theme->decideForPage($request);

        return $handler->handle($request);
    }
}
