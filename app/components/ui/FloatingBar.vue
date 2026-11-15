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

/* Hell: deckend weiß, klar abgesetzt durch Haarlinie + weichen, tiefen Schatten */
.floating-material {
  background: #fff;
  border: 0.5px solid rgb(0 0 0 / 0.1);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.9),
    0 1px 2px rgb(0 0 0 / 0.06),
    0 10px 30px -6px rgb(0 0 0 / 0.22);
}

/* Dunkel: Material eine Stufe heller als Karten (#2c2c2e), Lichtkante oben, Schatten nach unten */
.dark .floating-material {
  background: #3a3a3c;
  border-color: rgb(255 255 255 / 0.12);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.1),
    0 0 0 0.5px rgb(0 0 0 / 0.5),
    0 12px 36px -6px rgb(0 0 0 / 0.65);
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
    background: #fff;
    border: 1px solid rgb(0 0 0 / 0.5);
  }

  .dark .floating-material {
    border-color: rgb(255 255 255 / 0.5);
  }
}
</style>
