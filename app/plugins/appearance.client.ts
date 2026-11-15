/**
 * Wendet Farbschema und Modus aus dem Profil an – nur wenn sich die gespeicherten Werte
 * ändern (Login, Speichern), nicht bei jedem Neuladen der Sitzung beim Seitenwechsel.
 */
export default defineNuxtPlugin(() => {
  const { colorScheme, appearanceMode, applyFromSession } = useAppearance()
  watch([colorScheme, appearanceMode], () => applyFromSession(), { immediate: true })
})
