import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { UserRole } from '#enums/user_role'

export default class CheckUserBanMiddleware {
  redirectTo = '/unauthorized'

  public async handle(ctx: HttpContext, next: NextFn) {
    const { auth, response, request, session } = ctx

    // Ne pas bloquer la route si c'est déjà la page /unauthorized
    if (request.url() === this.redirectTo) {
      return next()
    }

    // Vérifie que l'utilisateur est connecté
    const isLoggedIn = await auth.check()
    if (isLoggedIn) {
      const user = auth.user

      // Si l'utilisateur est banni, le déconnecter puis rediriger
      if (user && user.role === UserRole.Banned) {
        try {
          // Déconnecter l'utilisateur en utilisant la méthode correcte
          await auth.use().logout()
          session.forget('auth_user')

          // Rediriger vers la page unauthorized
          return response.redirect().toPath(this.redirectTo)
        } catch (error) {
          return response.redirect().toPath(this.redirectTo)
        }
      }
    }
    return next()
  }
}
