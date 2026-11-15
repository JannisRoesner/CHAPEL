<script setup lang="ts">
/** Schwebende Aktionsleiste (Material-Glas), bleibt beim Scrollen sichtbar – oberhalb der Mobil-Navigation. */
</script>

<template>
  <div class="floating-bar pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4">
    <div
      class="pointer-events-auto flex items-center gap-1.5 rounded-full border border-default/70 bg-default/75 p-1.5 shadow-lg shadow-black/10 backdrop-blur-xl backdrop-saturate-150 max-w-full"
      role="toolbar"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.floating-bar {
  bottom: calc(5.75rem + env(safe-area-inset-bottom));
  animation: bar-in 360ms cubic-bezier(0.2, 0.9, 0.3, 1) both;
}

@media (min-width: 768px) {
  .floating-bar {
    bottom: calc(1.5rem + env(safe-area-inset-bottom));
  }
}

@keyframes bar-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .floating-bar {
    animation: none;
  }
}
</style>
