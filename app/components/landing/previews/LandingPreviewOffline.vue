<template>
  <div class="space-y-5 pointer-events-none select-none">
    <div class="rounded-lg border border-default p-4 space-y-3">
      <div class="flex items-center justify-between">
        <p class="font-medium text-sm">
          Offline vorbereiten
        </p>
        <UBadge
          color="success"
          variant="subtle"
        >
          Bereit für Offline
        </UBadge>
      </div>
      <UProgress
        :model-value="100"
        :max="100"
      />
      <p class="text-xs text-muted">
        5 / 5 Tracks zwischengespeichert
      </p>
    </div>

    <div class="flex items-center gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
      <div class="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <FontAwesomeIcon
          icon="mobile-alt"
          class="text-primary"
        />
      </div>
      <div>
        <p class="font-medium text-sm">
          Zum Startbildschirm hinzufügen
        </p>
        <p class="text-xs text-muted mt-0.5">
          CHAPEL als installierbare App nutzen — auch ohne Netzwerk
        </p>
      </div>
    </div>
  </div>
</template>
