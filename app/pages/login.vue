<script setup lang="ts">
import { DEFAULT_ROUTE } from '#shared/constants/app'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const { fetch: fetchSession, loggedIn, user } = useUserSession()

async function login() {
  error.value = ''
  loading.value = true
  try {
    const loginResult = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    // #region agent log
    fetch('http://127.0.0.1:7380/ingest/3d135e0c-32e8-471f-8fc6-fbcbac7c331e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b3a24b'},body:JSON.stringify({sessionId:'b3a24b',runId:'pre-fix',hypothesisId:'A',location:'login.vue:after-login-api',message:'Login API succeeded',data:{userId:(loginResult as {user?:{id?:number}})?.user?.id,mustChangePassword:(loginResult as {user?:{mustChangePassword?:boolean}})?.user?.mustChangePassword},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    await fetchSession()
    // #region agent log
    fetch('http://127.0.0.1:7380/ingest/3d135e0c-32e8-471f-8fc6-fbcbac7c331e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b3a24b'},body:JSON.stringify({sessionId:'b3a24b',runId:'pre-fix',hypothesisId:'B',location:'login.vue:after-fetchSession',message:'fetchSession completed',data:{loggedIn:loggedIn.value,hasUser:!!user.value?.id,mustChangePassword:user.value?.mustChangePassword},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    await navigateTo(DEFAULT_ROUTE)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    // #region agent log
    fetch('http://127.0.0.1:7380/ingest/3d135e0c-32e8-471f-8fc6-fbcbac7c331e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b3a24b'},body:JSON.stringify({sessionId:'b3a24b',runId:'pre-fix',hypothesisId:'D',location:'login.vue:catch',message:'Login flow error',data:{statusMessage:err.statusMessage,message:err.data?.message},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    error.value = err.data?.message || err.statusMessage || 'Anmeldung fehlgeschlagen'
  } finally {
    loading.value = false
  }
}

definePageMeta({
  layout: false
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-default px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <UiAppLogo size="lg" />
      </template>

      <form
        class="space-y-4"
        @submit.prevent="login"
      >
        <UFormField label="E-Mail">
          <UInput
            v-model="email"
            type="email"
            autocomplete="username"
            required
          />
        </UFormField>
        <UFormField label="Passwort">
          <UInput
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </UFormField>
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          :title="error"
        />
        <UButton
          type="submit"
          block
          :loading="loading"
        >
          Anmelden
        </UButton>
      </form>
    </UCard>
  </div>
</template>
