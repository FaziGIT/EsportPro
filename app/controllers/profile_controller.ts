import type { HttpContext } from '@adonisjs/core/http'
import Tournament from '#models/tournament'
import { DateTime } from 'luxon'
import { UserRole } from '#enums/user_role'
import Game from '#models/game'

interface GameStatistic {
  totalMatches: number
  wins: number
  totalHours: number
  gameName: string
}

/**
 * Convertit une valeur en DateTime, quelle que soit sa forme
 * @param dateValue La valeur de date à convertir
 * @returns Une instance DateTime valide
 */
function ensureDateTime(dateValue: any): DateTime {
  if (!dateValue) return DateTime.now()

  // Si c'est déjà un DateTime
  if (dateValue instanceof DateTime) return dateValue

  // Si c'est une chaîne de caractères
  if (typeof dateValue === 'string') return DateTime.fromISO(dateValue)

  // Si c'est un objet avec une méthode toISO (comme DateTime sérialisé)
  if (typeof dateValue === 'object' && dateValue && typeof dateValue.toISO === 'function') {
    return DateTime.fromISO(dateValue.toISO())
  }

  // Si c'est un objet avec une méthode toISOString (comme Date standard)
  if (typeof dateValue === 'object' && dateValue && typeof dateValue.toISOString === 'function') {
    return DateTime.fromISO(dateValue.toISOString())
  }

  // Si c'est un objet qui pourrait contenir des propriétés de date
  if (typeof dateValue === 'object' && dateValue) {
    try {
      const rawDate = dateValue as Record<string, any>
      if (typeof rawDate.iso === 'string') {
        return DateTime.fromISO(rawDate.iso)
      }

      // Reconstruction à partir des propriétés année, mois, jour, etc.
      return DateTime.fromObject({
        year: rawDate.year || 0,
        month: rawDate.month || 1,
        day: rawDate.day || 1,
        hour: rawDate.hour || 0,
        minute: rawDate.minute || 0,
        second: rawDate.second || 0,
      })
    } catch (e) {
      console.error('Erreur lors de la conversion de la date:', e)
    }
  }

  console.error('Format de date non reconnu:', dateValue)
  return DateTime.now()
}

export default class ProfileController {
  public async index({ inertia, auth }: HttpContext) {
    const user = auth.user
    let tournaments: Tournament[] = []
    let favoriteGames: Game[] = []
    let pendingTournaments: Tournament[] = []
    let createdTournaments: Tournament[] = []
    let finishedTournaments: Tournament[] = []
    let gameStats: Record<string, GameStatistic> = {}

    if (user) {
      await user.load('teams', (query) => {
        query.preload('tournament', (tournamentQuery) => {
          tournamentQuery.preload('game').preload('teams', (teamsQuery) => {
            teamsQuery.preload('players')
          })
        })
      })
      await user.load('favoriteGames')

      // Récupération de tous les tournois de l'utilisateur
      const allUserTournaments = user.teams
        .map((team) => team.tournament)
        .filter((tournament) => tournament !== null)

      console.log(`-----------------------------------`)
      console.log(`Nombre total de tournois: ${allUserTournaments.length}`)

      // Un tournoi est considéré comme terminé s'il a un winnerId ou si sa date de fin est passée
      finishedTournaments = allUserTournaments.filter((tournament) => {
        const isEnded = tournament.endDate < DateTime.now()
        const hasWinner = !!tournament.winnerId
        console.log(`Tournoi ${tournament.name}: date fin : ${isEnded}, a un gagnant: ${hasWinner}`)
        return isEnded || hasWinner
      })

      console.log(`Nombre de tournois terminés: ${finishedTournaments.length}`)

      // Les tournois en cours sont ceux qui ne sont pas terminés
      tournaments = allUserTournaments
        .filter((tournament) => !finishedTournaments.includes(tournament))
        .sort((a, b) => a.endDate.valueOf() - b.endDate.valueOf())

      // Calcul des statistiques par jeu
      const gameStatsMap: Record<string, GameStatistic> = {}

      allUserTournaments.forEach((tournament) => {
        if (!tournament.game) return

        const gameId = tournament.game.id
        if (!gameStatsMap[gameId]) {
          gameStatsMap[gameId] = {
            totalMatches: 0,
            wins: 0,
            totalHours: 0,
            gameName: tournament.game.name,
          }
        }

        // Incrémenter le nombre de matchs
        gameStatsMap[gameId].totalMatches++

        // Vérifier si l'utilisateur a gagné ce tournoi
        if (tournament.winnerId) {
          const userTeam = tournament.teams?.find((team) =>
            team.players?.some((player) => player?.id === user.id)
          )

          // Si l'équipe de l'utilisateur est l'équipe gagnante
          if (userTeam && tournament.winnerId === userTeam.id) {
            gameStatsMap[gameId].wins++
            console.log(`Tournoi gagné: ${tournament.name} pour le jeu ${tournament.game.name}`)
          }
        }

        // Calculer le temps de jeu
        try {
          // S'assurer d'avoir des dates valides
          if (tournament.startDate && tournament.endDate) {
            // Convertir les dates en objets DateTime
            const startDate = ensureDateTime(tournament.startDate)
            const endDate = ensureDateTime(tournament.endDate)

            console.log(
              `Dates converties - startDate: ${startDate.toISO()}, endDate: ${endDate.toISO()}`
            )

            if (startDate.isValid && endDate.isValid) {
              // Calculer la différence en minutes
              const diffInMinutes = endDate.diff(startDate, 'minutes').minutes
              const durationInHours = diffInMinutes / 60

              console.log(
                `Tournoi ${tournament.name} - Dates valides! Début: ${startDate.toISO()}, Fin: ${endDate.toISO()}, Durée en minutes: ${diffInMinutes}, Durée en heures: ${durationInHours}`
              )

              // Ajouter la durée aux statistiques
              if (durationInHours > 0) {
                // Initialiser si nécessaire
                if (gameStatsMap[gameId].totalHours === undefined) {
                  gameStatsMap[gameId].totalHours = 0
                }

                gameStatsMap[gameId].totalHours += durationInHours
                console.log(
                  `Ajout de ${durationInHours} heures au total de ${gameStatsMap[gameId].gameName}, nouveau total: ${gameStatsMap[gameId].totalHours}h`
                )
              }
            } else {
              console.log(
                `Dates invalides pour le tournoi ${tournament.name} après conversion: startDate valid=${startDate.isValid}, endDate valid=${endDate.isValid}`
              )
            }
          }
        } catch (error) {
          console.error('Error calculating duration:', error, tournament)
        }
      })

      gameStats = gameStatsMap

      // Vérification des valeurs calculées
      console.log('Statistiques des jeux calculées:')
      Object.entries(gameStats).forEach(([gameId, stats]) => {
        console.log(`Jeu ${stats.gameName} (${gameId}):`, {
          matches: stats.totalMatches,
          wins: stats.wins,
          hours: stats.totalHours,
        })
      })

      // Récupération des jeux favoris de l'utilisateur
      favoriteGames = user.favoriteGames.slice().sort((a, b) => a.name.localeCompare(b.name))

      // Récupération des tournois en attente de validation pour les admins
      if (user.role === UserRole.Admin) {
        pendingTournaments = await Tournament.query()
          .where('isValidated', false)
          .preload('game')
          .orderBy('created_at', 'asc')
      }

      // Récupération des tournois créés par l'utilisateur
      createdTournaments = await Tournament.query()
        .where('creatorId', user.id)
        .preload('game')
        .orderBy('created_at', 'desc')

      return inertia.render('profile/index', {
        user: user,
        tournaments: tournaments,
        favoriteGames: favoriteGames,
        pendingTournaments: pendingTournaments,
        createdTournaments: createdTournaments,
        finishedTournaments: finishedTournaments,
        gameStats: gameStats,
      })
    }

    return inertia.render('profile/index', {
      user: user,
      tournaments: tournaments,
      favoriteGames: favoriteGames,
      pendingTournaments: [],
      createdTournaments: [],
      finishedTournaments: [],
      gameStats: {},
    })
  }

  public async updatePrivacy({ request, auth, response }: HttpContext) {
    const user = auth.user
    const isPrivate = request.input('isPrivate')

    if (user) {
      user.isPrivate = isPrivate
      await user.save()
    }

    return response.redirect().back()
  }

  public async updateName({ request, auth, response }: HttpContext) {
    const user = auth.user
    const firstName = request.input('firstName')
    const lastName = request.input('lastName')

    if (user) {
      user.firstName = firstName
      user.lastName = lastName
      await user.save()
    }

    return response.redirect().back()
  }

  public async validateTournament({ params, response, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== UserRole.Admin) {
      return response.status(401).json({
        error: true,
        message: 'Unauthorized access',
      })
    }

    try {
      const tournament = await Tournament.find(params.id)
      if (!tournament) {
        return response.status(404).json({
          error: true,
          message: 'Tournament not found',
        })
      }

      tournament.isValidated = true
      await tournament.save()

      return response.json({
        success: true,
        message: 'Le tournoi a été validé avec succès',
      })
    } catch (error) {
      console.error('An error occurred while validating the tournament:', error)
      return response.status(500).json({
        error: true,
        message: 'An error occurred while validating the tournament',
      })
    }
  }

  public async refuseTournament({ params, response, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== UserRole.Admin) {
      return response.status(401).json({
        error: true,
        message: 'Unauthorized access',
      })
    }

    try {
      const tournament = await Tournament.query()
        .where('id', params.id)
        .preload('teams', (teamsQuery) => {
          teamsQuery.preload('players')
        })
        .first()

      if (!tournament) {
        return response.status(404).json({
          error: true,
          message: 'Tournament not found',
        })
      }

      // Vérifier si les équipes ont des joueurs
      const hasTeamsWithPlayers = tournament.teams.some(
        (team) => team.players && team.players.length > 0
      )

      if (hasTeamsWithPlayers) {
        return response.status(400).json({
          error: true,
          message: 'This tournament has teams with players and cannot be refused.',
        })
      }

      // Suppression des équipes vides associées au tournoi
      if (tournament.teams && tournament.teams.length > 0) {
        await tournament.related('teams').query().delete()
      }

      // Supprimer le tournoi
      await tournament.delete()

      return response.json({
        success: true,
        message: 'Tournament refused successfully',
      })
    } catch (error) {
      console.error('An error occurred while refusing the tournament:', error)
      return response.status(500).json({
        error: true,
        message: 'An error occurred while refusing the tournament',
      })
    }
  }
}
