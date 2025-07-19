import Tournament from '#models/tournament'
import Game from '#models/game'
import { DateTime } from 'luxon'
import { HttpContext } from '@adonisjs/core/http'

export default class SitemapController {
  public async generate({ response }: HttpContext) {
    const tournaments = await Tournament.all()
    const games = await Game.all()

    const tournamentUrls = tournaments.map(
      (t) => `
      <url>
        <loc>https://esportpro.cloud/tournaments/${t.id}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
        <lastmod>${
          t.updatedAt instanceof DateTime
            ? t.updatedAt.toISODate()
            : new Date().toISOString().split('T')[0]
        }</lastmod>

      </url>
    `
    )

    const gameUrls = games.map(
      (g) => `
      <url>
        <loc>https://esportpro.cloud/games/${g.id}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
        <lastmod>${
          g.updatedAt instanceof DateTime
            ? g.updatedAt.toISODate()
            : new Date().toISOString().split('T')[0]
        }</lastmod>

      </url>
    `
    )

    const staticUrls = [
      {
        loc: 'https://esportpro.cloud/',
        changefreq: 'daily',
        priority: '1.0',
      },
      {
        loc: 'https://esportpro.cloud/search',
        changefreq: 'weekly',
        priority: '0.8',
      },
      {
        loc: 'https://esportpro.cloud/tournaments',
        changefreq: 'weekly',
        priority: '0.8',
      },
      {
        loc: 'https://esportpro.cloud/games',
        changefreq: 'monthly',
        priority: '0.7',
      },
      {
        loc: 'https://esportpro.cloud/login',
        changefreq: 'yearly',
        priority: '0.3',
      },
      {
        loc: 'https://esportpro.cloud/register',
        changefreq: 'yearly',
        priority: '0.3',
      },
    ]

    const staticXml = staticUrls.map(
      (u) => `
      <url>
        <loc>${u.loc}</loc>
        <changefreq>${u.changefreq}</changefreq>
        <priority>${u.priority}</priority>
      </url>
    `
    )

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticXml, ...tournamentUrls, ...gameUrls].join('\n')}
</urlset>`

    response.header('Content-Type', 'application/xml')
    return response.send(xml)
  }
}
