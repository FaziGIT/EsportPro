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

transmit.registerRoutes()

// Public routes
router.get('/', [HomeController, 'index'])

// Authentication routes
router.get('/login', [LoginController, 'index'])
router.post('/login', [LoginController, 'store'])
router.get('/register', [RegisterController, 'index'])
router.post('/register', [RegisterController, 'store'])
router.post('/logout', [LogoutController]).use(middleware.auth())

// Chat routes (authenticated)
router.get('/chat/channels', [ChatController, 'getUserChannelsWithMessages']).use(middleware.auth())
router.post('/chat/all/message', [ChatController, 'message']).use(middleware.auth())
router.get('/chat/messages/old', [ChatController, 'getOldMessages']).use(middleware.auth())

// Tournament routes
router.get('/tournaments', [TournamentsController, 'index'])
router.get('/api/tournaments', [TournamentsController, 'api'])
router.get('/tournaments/:id', [TournamentsController, 'show'])
router.post('/tournaments/:id/join', [TournamentsController, 'join']).use(middleware.auth())

// Team routes
router.put('/teams/:id', [TournamentsController, 'updateTeam']).use(middleware.auth())

// Game routes
router.get('/games', [GamesController, 'index'])
router.get('/api/games', [GamesController, 'api'])
