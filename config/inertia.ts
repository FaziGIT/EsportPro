import { UserRole } from '#enums/user_role'
import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import Game from '#models/game'
import Tournament from '#models/tournament'
import Team from '#models/team'

const inertiaConfig = defineConfig({
  rootView: 'inertia_layout',

  sharedData: {
    user: (ctx) => ctx.inertia.always(() => ctx.auth.user),
    i18n: (ctx) => {
      return {
        ...ctx.i18n,
        locale: ctx.i18n.locale,
      }
    },
    isAdmin: (ctx) => ctx.auth.user?.role === UserRole.Admin,
    userGames: (ctx) =>
      ctx.inertia.always(async () => {
        if (!ctx.auth.user) return []

        await ctx.auth.user.load('favoriteGames', (gamesQuery: any) => {
          gamesQuery.select(['id', 'name'])
        })
        return ctx.auth.user.favoriteGames.map((game: Game) => ({
          id: game.id,
          name: game.name,
        }))
      }),
    userTournaments: (ctx) =>
      ctx.inertia.always(async () => {
        if (!ctx.auth.user) return []

        await ctx.auth.user.load('teams', (teamsQuery: any) => {
          teamsQuery.preload('tournament', (tournamentQuery: any) => {
            tournamentQuery.select(['id', 'name'])
          })
        })

        const tournaments = ctx.auth.user.teams
          .map((team: Team) => team.tournament)
          .filter(
            (tournament: Tournament, index: number, self: Tournament[]) =>
              index === self.findIndex((t: Tournament) => t.id === tournament.id)
          )

        return tournaments.map((tournament: Tournament) => ({
          id: tournament.id,
          name: tournament.name,
        }))
      }),

    ssr: {
      enabled: true,
      entrypoint: 'inertia/app/ssr.ts',
    },
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
