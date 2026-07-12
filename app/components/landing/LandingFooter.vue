<template>
  <footer class="border-t border-default bg-elevated/30">
    <div class="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
      <UiCopyrightNotice show-tagline />
      <p>
        Lizenziert unter
        <a
          href="https://www.gnu.org/licenses/agpl-3.0.html"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline"
        >
          AGPL-3.0
        </a>
      </p>
      <LegalFooterLinks />
    </div>
  </footer>
</template>
