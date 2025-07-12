import { usePage } from '@inertiajs/vue3'
import { computed } from 'vue'
import Game from '#models/game'
import Tournament from '#models/tournament'
import Team from '#models/team'
import Match from '#models/match'

export function usePageProps<T = any>() {
  const page = usePage()

  const props = computed(() => page.props as T)

  const getProp = <K extends keyof T>(key: K): T[K] => {
    return props.value[key]
  }

  return {
    props,
    getProp,
  }
}

export function useUserData() {
  const { getProp } = usePageProps()

  const userTournaments = computed(() => getProp('userTournaments') as Tournament[])
  const userGames = computed(() => getProp('userGames') as Game[])

  return {
    userTournaments,
    userGames,
  }
}

export function useGameData() {
  const { getProp } = usePageProps()

  const game = computed(() => getProp('game') as Game)
  const tournaments = computed(() => getProp('tournaments') as Tournament[])

  return {
    game,
    tournaments,
  }
}

export function useTournamentData() {
  const { getProp } = usePageProps()

  const tournament = computed(() => getProp('tournament') as Tournament)
  const teams = computed(() => getProp('teams') as Team[])
  const matches = computed(() => getProp('matches') as Match[])

  return {
    tournament,
    teams,
    matches,
  }
}
