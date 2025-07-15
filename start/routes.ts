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

// Profile routes
router
  .group(() => {
    router.get('/profile', [ProfileController, 'index'])
    router.post('/profile/privacy', [ProfileController, 'updatePrivacy'])
    router.post('/profile/update-data', [ProfileController, 'updateName'])
    router.post('/profile/tournaments/:id/validate', [ProfileController, 'validateTournament'])
    router.post('/profile/tournaments/:id/refuse', [ProfileController, 'refuseTournament'])
  })
  .use(middleware.auth())
