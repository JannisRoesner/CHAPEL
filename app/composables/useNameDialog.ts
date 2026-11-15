interface NameDialogOptions {
  title: string
  description?: string
  initialName?: string
  confirmLabel?: string
  multiline?: boolean
  optional?: boolean
  placeholder?: string
}

/** Zustand + Ablauf für `UiNameDialog` (Umbenennen, Duplizieren). */
export function useNameDialog() {
  const toast = useToast()
  const state = reactive({
    open: false,
    loading: false,
    title: '',
    description: undefined as string | undefined,
    initialName: '',
    confirmLabel: 'Speichern',
    multiline: false,
    optional: false,
    placeholder: undefined as string | undefined
  })
  let handler: ((name: string) => Promise<void>) | null = null

  function ask(options: NameDialogOptions, onConfirm: (name: string) => Promise<void>) {
    Object.assign(state, {
      description: undefined,
      initialName: '',
      confirmLabel: 'Speichern',
      multiline: false,
      optional: false,
      placeholder: undefined,
      ...options,
      open: true,
      loading: false
    })
    handler = onConfirm
  }

  async function confirm(name: string) {
    if (!handler) return
    state.loading = true
    try {
      await handler(name)
      state.open = false
    } catch (error) {
      const message = error as { statusMessage?: string, data?: { statusMessage?: string } }
      toast.add({
        title: 'Aktion fehlgeschlagen',
        description: message.data?.statusMessage || message.statusMessage,
        color: 'error'
      })
    } finally {
      state.loading = false
    }
  }

  return { state, ask, confirm }
}
