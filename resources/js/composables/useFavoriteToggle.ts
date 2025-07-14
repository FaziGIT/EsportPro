import { computed, ref, Ref } from 'vue'
import { router } from '@inertiajs/vue3'
import { getCsrfToken } from '../../../inertia/utils/index.js'
import type User from '#models/user'

export function useFavoriteToggle(gameId: string, favoriteOfUsers: Ref<User[] | undefined>, userId?: string) {
    const localOverride = ref<boolean | null>(null)

    const serverState = computed(() => {
        return favoriteOfUsers.value?.some((user: User) => user.id === String(userId)) || false
    })

    const isFavorite = computed(() => {
        return localOverride.value !== null ? localOverride.value : serverState.value
    })

    const toggleFavorite = async (): Promise<boolean> => {
        try {
            localOverride.value = !isFavorite.value

            const response = await fetch(`/games/${gameId}/toggle-favorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            })

            if (response.ok) {
                router.reload({ only: ['userGames'] })
                return true
            } else {
                localOverride.value = null
                return false
            }
        } catch (error) {
            console.error('Erreur toggle favorite:', error)
            localOverride.value = null
            return false
        }
    }

    return {
        isFavorite,
        toggleFavorite,
    }
} 
