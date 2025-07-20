import { usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

interface I18nPageProps {
  locale: string
  locales: string[]
  localeTranslations: Record<string, string>
  fallbackTranslations?: Record<string, string>
}

export function useI18n() {
  const page = usePage()

  const i18nProps = computed(() => page.props.i18n as I18nPageProps)

  const t = (key: string, replacements: Record<string, string | number> = {}): string => {
    if (!i18nProps.value || !i18nProps.value.localeTranslations) {
      return key
    }

    let message = i18nProps.value.localeTranslations[key]

    if (message === undefined && i18nProps.value.fallbackTranslations) {
      message = i18nProps.value.fallbackTranslations[key]
    }

    if (message === undefined) {
      return key
    }

    for (const placeholder in replacements) {
      message = message.replace(`{${placeholder}}`, String(replacements[placeholder]))
    }
    return message
  }

  const currentLocale = computed(() => i18nProps.value?.locale)

  return { t, currentLocale }
}
