/** Blendet beim Wechsel Hell/Dunkel kurz Farbübergänge ein (kein harter Helligkeitssprung). */
export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(() => colorMode.value, () => {
    if (reduceMotion.matches) return
    const root = document.documentElement
    root.classList.add('theme-transition')
    clearTimeout(timer)
    timer = setTimeout(() => root.classList.remove('theme-transition'), 300)
  })
})
