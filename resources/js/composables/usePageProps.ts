import { usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

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

  const userTournaments = computed(() => getProp('userTournaments') || [])
  const userGames = computed(() => getProp('userGames') || [])

  return {
    userTournaments,
    userGames,
  }
}

export function useGameData() {
  const { getProp } = usePageProps()

  const game = computed(() => getProp('game'))
  const tournaments = computed(() => getProp('tournaments') || [])

  return {
    game,
    tournaments,
  }
}

export function useTournamentData() {
  const { getProp } = usePageProps()

  const tournament = computed(() => getProp('tournament'))
  const teams = computed(() => getProp('teams') || [])
  const matches = computed(() => getProp('matches') || [])

  return {
    tournament,
    teams,
    matches,
  }
}
