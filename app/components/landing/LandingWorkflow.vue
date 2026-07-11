<script setup lang="ts">
import { LANDING_WORKFLOW_STEPS } from '#shared/constants/landingDemo'
</script>

<template>
  <section
    id="ablauf"
    class="py-16 md:py-24 bg-elevated/30"
    aria-labelledby="workflow-heading"
  >
    <div class="max-w-6xl mx-auto px-4">
      <h2
        id="workflow-heading"
        class="text-3xl md:text-4xl font-bold text-center mb-4"
      >
        Vom Upload zur Wiedergabe
      </h2>
      <p class="text-muted text-center mb-12 max-w-2xl mx-auto">
        Jeder Gottesdienst durchläuft einen klaren, nachvollziehbaren Weg in vier Schritten.
      </p>

      <ol class="grid md:grid-cols-4 gap-8 md:gap-4 relative">
        <li
          v-for="(step, index) in LANDING_WORKFLOW_STEPS"
          :key="step.step"
          class="relative flex flex-col items-center text-center"
        >
          <div
            v-if="index < LANDING_WORKFLOW_STEPS.length - 1"
            class="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-muted"
            aria-hidden="true"
          />

          <div class="relative z-10 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mb-4">
            {{ step.step }}
          </div>

          <h3 class="font-semibold text-lg mb-2">
            {{ step.title }}
          </h3>
          <p class="text-sm text-muted leading-relaxed">
            {{ step.description }}
          </p>
        </li>
      </ol>
    </div>
  </section>
</template>
