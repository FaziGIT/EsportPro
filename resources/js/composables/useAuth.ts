import { usePage } from '@inertiajs/vue3'
import { computed } from 'vue'
import { UserRole } from '#enums/user_role'
import User from '#models/user'

export function useAuth() {
  const page = usePage()

  const user = computed(() => page.props.user as User | null)

  const isAuthenticated = computed(() => !!user.value)

  const isAdmin = computed(() => user.value?.role === UserRole.Admin)

  const isBanned = computed(() => user.value?.role === UserRole.Banned)

  return {
    user,
    isAuthenticated,
    isAdmin,
    isBanned
  }
}
