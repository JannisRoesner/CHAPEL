<script setup lang="ts">
import { renderMarkdown } from '~/utils/markdown'

const props = defineProps<{
  content: string
}>()

const html = computed(() => renderMarkdown(props.content))
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    v-if="html"
    class="markdown-content"
    v-html="html"
  />
  <!-- eslint-enable vue/no-v-html -->
</template>

<style scoped>
.markdown-content :deep(h1) {
  font-size: 1.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
  line-height: 1.25;
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.7;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.markdown-content :deep(ul) {
  list-style-type: disc;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
  line-height: 1.6;
}

.markdown-content :deep(a) {
  color: var(--ui-primary);
  text-decoration: underline;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid var(--ui-border);
  padding-left: 1rem;
  margin-bottom: 1rem;
  color: var(--ui-text-muted);
}

.markdown-content :deep(code) {
  font-family: ui-monospace, monospace;
  font-size: 0.875em;
  background: var(--ui-bg-elevated);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.markdown-content :deep(pre) {
  background: var(--ui-bg-elevated);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--ui-border);
  margin: 2rem 0;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--ui-border);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.markdown-content :deep(th) {
  font-weight: 600;
  background: var(--ui-bg-elevated);
}
</style>
