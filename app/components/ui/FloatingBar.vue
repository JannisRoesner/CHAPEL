<script setup lang="ts">
/**
 * Schwebende Aktionsleiste, bleibt beim Scrollen sichtbar – oberhalb der Mobil-Navigation.
 * Deckende Fläche (kein Glas): eine Stufe heller als der Untergrund, Lichtkante oben und
 * tiefer Schatten, damit sie sich von Karten und Rahmen abhebt.
 */
</script>

<template>
  <div class="floating-bar pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4">
    <div
      class="floating-material pointer-events-auto flex max-w-full items-center gap-1.5 rounded-full p-1.5"
      role="toolbar"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.floating-bar {
  bottom: calc(5.75rem + env(safe-area-inset-bottom));
  animation: bar-in 420ms cubic-bezier(0.2, 0.9, 0.3, 1) both;
}

@media (min-width: 768px) {
  .floating-bar {
    bottom: calc(1.5rem + env(safe-area-inset-bottom));
  }
}

/*
 * Klar vom Seitenhintergrund abgesetzt (auch für ältere Augen): getönte, deckende Fläche
 * in der Akzentfarbe, sichtbarer Rand und tiefer Schatten – im Hell- und Dunkelmodus.
 */
.floating-material {
  background: color-mix(in oklab, var(--ui-primary) 14%, #fff);
  border: 1.5px solid color-mix(in oklab, var(--ui-primary) 50%, #fff);
  box-shadow:
    0 2px 4px rgb(0 0 0 / 0.08),
    0 12px 32px -6px rgb(0 0 0 / 0.3);
}

.dark .floating-material {
  background: color-mix(in oklab, var(--ui-primary) 22%, #3a3a3c);
  border-color: color-mix(in oklab, var(--ui-primary) 55%, #3a3a3c);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.08),
    0 12px 36px -6px rgb(0 0 0 / 0.7);
}

/* Text etwas kräftiger statt flachem Grau */
.floating-material :deep(button),
.floating-material :deep(a) {
  font-weight: 600;
}

.floating-material :deep(.text-default),
.floating-material :deep([class*="text-neutral"]) {
  color: var(--ui-text-highlighted);
}

@keyframes bar-in {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
}

@media (prefers-reduced-motion: reduce) {
  .floating-bar {
    animation: none;
  }
}

@media (prefers-contrast: more) {
  .floating-material {
    border: 2px solid var(--ui-text-highlighted);
  }

}
</style>
