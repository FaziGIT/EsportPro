/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import transmit from '@adonisjs/transmit/services/main'

// Controller imports
const HomeController = () => import('#controllers/home_controller')
const LoginController = () => import('#controllers/login_controller')
const RegisterController = () => import('#controllers/register_controller')
const LogoutController = () => import('#controllers/logout_controller')
const ChatController = () => import('#controllers/chat_controller')
const TournamentsController = () => import('#controllers/tournaments_controller')
const GamesController = () => import('#controllers/games_controller')
const ProfileController = () => import('#controllers/profile_controller')

const ErrorsController = () => import('#controllers/errors_controller')

transmit.registerRoutes()

// Public routes
router.get('/', [HomeController, 'index'])
router.get('/search', [HomeController, 'search'])

// Authentication routes
router.get('/login', [LoginController, 'index'])
router.post('/login', [LoginController, 'store'])
router.get('/register', [RegisterController, 'index'])
router.post('/register', [RegisterController, 'store'])
router.post('/logout', [LogoutController]).use(middleware.auth())

// Chat routes (authenticated)
router
  .group(() => {
    router.get('/chat/channels', [ChatController, 'getUserChannelsWithMessages'])
    router.post('/chat/all/message', [ChatController, 'message'])
    router.get('/chat/messages/old', [ChatController, 'getOldMessages'])
  })
  .use(middleware.auth())

// Tournament routes
router.get('/tournaments', [TournamentsController, 'index'])
router.get('/api/tournaments', [TournamentsController, 'api'])
router.get('/tournaments/:id/image', [TournamentsController, 'getImageFromTournament'])
router.post('/tournaments/new', [TournamentsController, 'store']).use(middleware.auth())

router.get('/tournaments/:id', [TournamentsController, 'show'])
router.put('/tournaments/:id/edit', [TournamentsController, 'update']).use(middleware.auth())
router.post('/tournaments/:id/join', [TournamentsController, 'join']).use(middleware.auth())
router.post('/tournaments/:id/leave', [TournamentsController, 'leave']).use(middleware.auth())
router.post('/tournaments/:id/launch', [TournamentsController, 'launch']).use(middleware.auth())
router
  .put('/tournaments/:id/matches/:matchId/score', [TournamentsController, 'updateMatchScore'])
  .use(middleware.auth())
router
  .delete('/tournaments/:id/delete', [TournamentsController, 'deleteTournament'])
  .use(middleware.auth())

// Team routes
router.put('/teams/:id', [TournamentsController, 'updateTeam']).use(middleware.auth())

// Game routes
router.get('/games', [GamesController, 'index'])
router.get('/api/games', [GamesController, 'api'])
router.get('/games/:id/image', [GamesController, 'getImageFromGame'])
router.get('/games/:id', [GamesController, 'show'])
router.post('/games/new', [GamesController, 'store']).use(middleware.auth())
router.put('/games/:id/edit', [GamesController, 'update']).use(middleware.auth())
router
  .post('/games/:id/toggle-favorite', [GamesController, 'toggleFavorite'])
  .use(middleware.auth())
router.delete('/games/:id/delete', [GamesController, 'deleteGame']).use(middleware.auth())

// Profile routes
router
  .group(() => {
    router.get('/profile', [ProfileController, 'index'])
    router.post('/profile/privacy', [ProfileController, 'updatePrivacy'])
    router.post('/profile/update-data', [ProfileController, 'updateName'])
    router.post('/profile/tournaments/:id/validate', [ProfileController, 'validateTournament'])
    router.post('/profile/tournaments/:id/refuse', [ProfileController, 'refuseTournament'])
    router.post('/profile/update-user-role/:id/:role', [ProfileController, 'updateUserRole'])
    router.post('/profile/ban-user/:id/ban', [ProfileController, 'banUser'])
    router.post('/profile/unban-user/:id/unban', [ProfileController, 'unbanUser'])
    router.delete('/profile/delete-account', [ProfileController, 'deleteAccount'])
    router.get('/profile/user/:pseudo', [ProfileController, 'viewProfile'])
  })
  .use(middleware.auth())

// Error routes
router.get('/unauthorized', [ErrorsController, 'unauthorized'])

// Site maps dynamique pour les jeux et les tournois
import Tournament from '#models/tournament'
import Game from '#models/game'
import { DateTime } from 'luxon'

router.get('/sitemap.xml', async ({ response }) => {
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
})
