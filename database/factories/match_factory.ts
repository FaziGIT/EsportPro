import Match from '#models/match'
import Team from '#models/team'
import { TeamFactory } from '#database/factories/team_factory'
import Tournament from '#models/tournament'
import { FormatType } from '#enums/format_type'

// Utility functions
const isPowerOfTwo = (n: number): boolean => n > 0 && (n & (n - 1)) === 0

const getNextPowerOfTwo = (n: number): number => {
  if (isPowerOfTwo(n)) return n
  let power = 1
  while (power < n) {
    power *= 2
  }
  return power
}

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const generateRealisticScore = (format: FormatType): { score1: number; score2: number } => {
  const maxScore = format === FormatType.BO1 ? 1 : format === FormatType.BO3 ? 2 : 3
  const winnerScore = maxScore
  const loserScore = Math.floor(Math.random() * maxScore)

  return Math.random() > 0.5
    ? { score1: winnerScore, score2: loserScore }
    : { score1: loserScore, score2: winnerScore }
}

export async function createTournamentBracket(tournamentId: string) {
  const tournament = await Tournament.findOrFail(tournamentId)
  const requiredTeams = getNextPowerOfTwo(tournament.numberParticipants)

  // Get or create teams for this tournament
  let teams = await Team.query().where('tournamentId', tournamentId)

  if (teams.length < requiredTeams) {
    const newTeams = await TeamFactory.merge({
      tournamentId,
      isWinner: false,
    }).createMany(requiredTeams - teams.length)
    teams = [...teams, ...newTeams]
  }

  // Limit and shuffle teams
  teams = shuffleArray(teams.slice(0, requiredTeams))

  const rounds: Match[][] = []
  let currentRoundTeams = teams

  // Create rounds until final
  while (currentRoundTeams.length > 1) {
    const roundMatches: Match[] = []

    // Create matches for this round
    for (let i = 0; i < currentRoundTeams.length; i += 2) {
      const team1 = currentRoundTeams[i]
      const team2 = currentRoundTeams[i + 1]

      const { score1, score2 } = generateRealisticScore(tournament.format)
      const winnerId = score1 > score2 ? team1.id : team2.id

      const match = await Match.create({
        team1Id: team1.id,
        team2Id: team2.id,
        scoreTeam1: score1,
        scoreTeam2: score2,
        winnerId,
        tournamentId,
      })

      roundMatches.push(match)
    }

    rounds.push(roundMatches)

    // Prepare teams for next round (winners)
    const winners = await Promise.all(roundMatches.map((match) => Team.findOrFail(match.winnerId!)))
    currentRoundTeams = winners
  }

  // Connect matches between rounds
  for (let i = 0; i < rounds.length - 1; i++) {
    const currentRound = rounds[i]
    const nextRound = rounds[i + 1]

    for (const [j, nextMatch] of nextRound.entries()) {
      const match1 = currentRound[j * 2]
      const match2 = currentRound[j * 2 + 1]

      await match1.merge({ nextMatchId: nextMatch.id }).save()
      await match2.merge({ nextMatchId: nextMatch.id }).save()
    }
  }

  // Update tournament with final winner
  if (rounds.length > 0 && rounds[rounds.length - 1].length > 0) {
    const finalMatch = rounds[rounds.length - 1][0]
    await tournament.merge({ winnerId: finalMatch.winnerId }).save()

    // Mark winning team
    const winnerTeam = await Team.findOrFail(finalMatch.winnerId!)
    await winnerTeam.merge({ isWinner: true }).save()
  }

  return {
    rounds,
    winnerId: tournament.winnerId,
    totalRounds: rounds.length,
  }
}
