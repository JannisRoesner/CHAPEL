export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return

  const { loggedIn, fetch: fetchSession } = useUserSession()
  await fetchSession()

  // #region agent log
  if (import.meta.client) {
    fetch('http://127.0.0.1:7380/ingest/3d135e0c-32e8-471f-8fc6-fbcbac7c331e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b3a24b'},body:JSON.stringify({sessionId:'b3a24b',runId:'pre-fix',hypothesisId:'C',location:'auth.global.ts:after-fetchSession',message:'Auth middleware check',data:{path:to.path,loggedIn:loggedIn.value,redirecting:!loggedIn.value},timestamp:Date.now()})}).catch(()=>{});
  }
  // #endregion

  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
