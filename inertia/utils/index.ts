export const getCsrfToken = () => {
  const meta = document.querySelector('meta[name="csrf_token"]')
  if (meta) {
    const content = meta.getAttribute('content')
    const match = content?.match(/value='([^']+)'/)
    if (match && match[1]) {
      return match[1]
    }
  }
  console.error('CSRF token not found in meta tag')
  return ''
}
