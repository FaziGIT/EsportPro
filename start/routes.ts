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

const HomeController = () => import('#controllers/home_controller')
const LoginController = () => import('#controllers/login_controller')
const RegisterController = () => import('#controllers/register_controller')
const LogoutController = () => import('#controllers/logout_controller')
// router.on('/').renderInertia('home')
const TournamentsController = () => import('#controllers/tournaments_controller')
const GamesController = () => import('#controllers/games_controller')

router.get('/', [HomeController, 'index'])

router.get('/login', [LoginController, 'index'])
router.post('/login', [LoginController, 'store'])

router.get('/register', [RegisterController, 'index'])
router.post('/register', [RegisterController, 'store'])

router.post('/logout', [LogoutController]).use(middleware.auth())

router.get('/tournaments', [TournamentsController, 'index'])
router.get('/api/tournaments', [TournamentsController, 'api'])

router.get('/games', [GamesController, 'index'])
router.get('/api/games', [GamesController, 'api'])
