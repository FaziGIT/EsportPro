import { usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

interface ValidationErrors {
    [key: string]: string | string[]
}

export function useErrors() {
    const page = usePage()

    const errors = computed(() => page.props.errors as ValidationErrors | null)

    const hasErrors = computed(() => errors.value && Object.keys(errors.value).length > 0)

    const getError = (field: string): string | null => {
        if (!errors.value || !errors.value[field]) return null

        const error = errors.value[field]
        return Array.isArray(error) ? error[0] : error
    }

    const hasError = (field: string): boolean => {
        return !!(errors.value && errors.value[field])
    }

    return {
        errors,
        hasErrors,
        getError,
        hasError
    }
} 
