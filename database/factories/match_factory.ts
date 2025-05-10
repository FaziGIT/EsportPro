import factory from '@adonisjs/lucid/factories'
import Match from '#models/match'
import Team from '#models/team'
import { TeamFactory } from '#database/factories/team_factory'
import Tournament from '#models/tournament'

// We don't care about creating Match, we want to create an tournament
export async function createTournamentBracket(tournamentId: string) {
  // Grab of create teams for the tournament
  let teams = await Team.query().where('tournamentId', tournamentId).limit(16)

  // If there are not enough teams, create new ones
  if (teams.length < 16) {
    const newTeams = await TeamFactory.merge({ tournamentId }).createMany(16 - teams.length)
    teams = [...teams, ...newTeams]
  }

  // Round of 16 - 8 matches
  const roundOf16Matches = []
  for (let i = 0; i < 8; i++) {
    const team1 = teams[i * 2]
    const team2 = teams[i * 2 + 1]

    const scoreTeam1 = Math.floor(Math.random() * 6)
    const scoreTeam2 = Math.floor(Math.random() * 6)

    // Be sure to have a winner
    const finalScoreTeam1 = scoreTeam1 === scoreTeam2 ? scoreTeam1 + 1 : scoreTeam1
    const winnerId = finalScoreTeam1 > scoreTeam2 ? team1.id : team2.id

    roundOf16Matches.push(
      await Match.create({
        team1Id: team1.id,
        team2Id: team2.id,
        scoreTeam1: finalScoreTeam1,
        scoreTeam2,
        winnerId,
        tournamentId,
      })
    )
  }

  // Quarter finals - 4 matches
  const quarterFinalMatches = []
  for (let i = 0; i < 4; i++) {
    const team1 = await Team.find(roundOf16Matches[i * 2].winnerId!)
    const team2 = await Team.find(roundOf16Matches[i * 2 + 1].winnerId!)

    const scoreTeam1 = Math.floor(Math.random() * 6)
    const scoreTeam2 = Math.floor(Math.random() * 6)

    // Be sure to have a winner
    const finalScoreTeam1 = scoreTeam1 === scoreTeam2 ? scoreTeam1 + 1 : scoreTeam1
    const winnerId = finalScoreTeam1 > scoreTeam2 ? team1!.id : team2!.id

    const match = await Match.create({
      team1Id: team1!.id,
      team2Id: team2!.id,
      scoreTeam1: finalScoreTeam1,
      scoreTeam2,
      winnerId,
      tournamentId,
    })

    // Save the previous matches
    await roundOf16Matches[i * 2].merge({ nextMatchId: match.id }).save()
    await roundOf16Matches[i * 2 + 1].merge({ nextMatchId: match.id }).save()

    quarterFinalMatches.push(match)
  }

  // Semi finals - 2 matches
  const semiFinalMatches = []
  for (let i = 0; i < 2; i++) {
    const team1 = await Team.find(quarterFinalMatches[i * 2].winnerId!)
    const team2 = await Team.find(quarterFinalMatches[i * 2 + 1].winnerId!)

    const scoreTeam1 = Math.floor(Math.random() * 6)
    const scoreTeam2 = Math.floor(Math.random() * 6)

    // Be sure to have a winner
    const finalScoreTeam1 = scoreTeam1 === scoreTeam2 ? scoreTeam1 + 1 : scoreTeam1
    const winnerId = finalScoreTeam1 > scoreTeam2 ? team1!.id : team2!.id

    const match = await Match.create({
      team1Id: team1!.id,
      team2Id: team2!.id,
      scoreTeam1: finalScoreTeam1,
      scoreTeam2,
      winnerId,
      tournamentId,
    })

    // Save the previous matches
    await quarterFinalMatches[i * 2].merge({ nextMatchId: match.id }).save()
    await quarterFinalMatches[i * 2 + 1].merge({ nextMatchId: match.id }).save()

    semiFinalMatches.push(match)
  }

  // Final
  const team1 = await Team.find(semiFinalMatches[0].winnerId!)
  const team2 = await Team.find(semiFinalMatches[1].winnerId!)

  const scoreTeam1 = Math.floor(Math.random() * 6)
  const scoreTeam2 = Math.floor(Math.random() * 6)

  // Be sure to have a winner
  const finalScoreTeam1 = scoreTeam1 === scoreTeam2 ? scoreTeam1 + 1 : scoreTeam1
  const winnerId = finalScoreTeam1 > scoreTeam2 ? team1!.id : team2!.id

  const finalMatch = await Match.create({
    team1Id: team1!.id,
    team2Id: team2!.id,
    scoreTeam1: finalScoreTeam1,
    scoreTeam2,
    winnerId,
    tournamentId,
  })

  // Mettre à jour les matchs précédents
  await semiFinalMatches[0].merge({ nextMatchId: finalMatch.id }).save()
  await semiFinalMatches[1].merge({ nextMatchId: finalMatch.id }).save()

  // Mettre à jour le tournoi avec le gagnant
  const tournament = await Tournament.find(tournamentId)
  if (tournament) {
    await tournament.merge({ winnerId }).save()

    // Marquer l'équipe gagnante comme gagnante
    const winnerTeam = await Team.find(winnerId)
    if (winnerTeam) {
      await winnerTeam.merge({ isWinner: true }).save()
    }
  }

  return {
    roundOf16: roundOf16Matches,
    quarterFinals: quarterFinalMatches,
    semiFinals: semiFinalMatches,
    final: finalMatch,
    winnerId,
  }
}
