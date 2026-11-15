/**
 * Drag & Drop-Sortierung für vertikale Listen – Pointer Events (Maus, Touch, Stift).
 *
 * - Gezogen wird über einen Griff (`onHandlePointerDown`), der `touch-action: none` trägt,
 *   damit die Seite auf iPhone/iPad sonst normal scrollt.
 * - Das gezogene Element folgt dem Finger 1:1 (inkl. Greif-Offset), die übrigen weichen aus.
 * - Am Bildschirmrand wird automatisch gescrollt.
 * - Tastatur: Griff fokussieren, Pfeil hoch/runter verschiebt.
 */
export function useSortableList(options: {
  container: Ref<HTMLElement | null>
  count: () => number
  move: (from: number, to: number) => void
}) {
  const dragIndex = ref<number | null>(null)
  const overIndex = ref<number | null>(null)
  const dragOffset = ref(0)
  const dropping = ref<number | null>(null)

  let rects: Array<{ top: number, height: number }> = []
  let gap = 0
  let startPageY = 0
  let lastClientY = 0
  let pointerId: number | null = null
  let rafId = 0
  let handleEl: HTMLElement | null = null

  function measure() {
    const children = Array.from(options.container.value?.children ?? []) as HTMLElement[]
    rects = children.map((el) => {
      const r = el.getBoundingClientRect()
      return { top: r.top + window.scrollY, height: r.height }
    })
    gap = rects.length > 1 ? rects[1]!.top - rects[0]!.top - rects[0]!.height : 0
  }

  function computeOver() {
    const from = dragIndex.value
    if (from == null) return
    const dragged = rects[from]!
    const center = dragged.top + dragged.height / 2 + dragOffset.value
    let index = 0
    rects.forEach((r, i) => {
      if (i !== from && r.top + r.height / 2 < center) index++
    })
    overIndex.value = index
  }

  function tick() {
    if (dragIndex.value == null) return
    const edge = 96
    const bottomEdge = window.innerHeight - 180
    let speed = 0
    if (lastClientY < edge) speed = -Math.ceil((edge - lastClientY) / 6)
    else if (lastClientY > bottomEdge) speed = Math.ceil((lastClientY - bottomEdge) / 6)
    if (speed) window.scrollBy(0, speed)
    dragOffset.value = lastClientY + window.scrollY - startPageY
    computeOver()
    rafId = requestAnimationFrame(tick)
  }

  function onHandlePointerDown(event: PointerEvent, index: number) {
    if (event.button !== 0 || dragIndex.value != null) return
    event.preventDefault()
    measure()
    handleEl = event.currentTarget as HTMLElement
    handleEl.setPointerCapture(event.pointerId)
    pointerId = event.pointerId
    dragIndex.value = index
    overIndex.value = index
    dragOffset.value = 0
    startPageY = event.clientY + window.scrollY
    lastClientY = event.clientY
    navigator.vibrate?.(8)
    handleEl.addEventListener('pointermove', onPointerMove)
    handleEl.addEventListener('pointerup', onPointerUp)
    handleEl.addEventListener('pointercancel', onPointerUp)
    rafId = requestAnimationFrame(tick)
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    lastClientY = event.clientY
  }

  function onPointerUp(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    cancelAnimationFrame(rafId)
    if (event.type === 'pointerup') {
      dragOffset.value = event.clientY + window.scrollY - startPageY
      computeOver()
    }
    handleEl?.removeEventListener('pointermove', onPointerMove)
    handleEl?.removeEventListener('pointerup', onPointerUp)
    handleEl?.removeEventListener('pointercancel', onPointerUp)
    pointerId = null

    const from = dragIndex.value
    const to = overIndex.value
    if (from == null || to == null) return reset()

    // FLIP: gezogenes Element startet an seiner aktuellen Bildschirmposition
    const visualTop = rects[from]!.top + dragOffset.value
    dragIndex.value = null
    overIndex.value = null
    dragOffset.value = 0
    if (from !== to) options.move(from, to)

    void nextTick(() => {
      const el = options.container.value?.children[to] as HTMLElement | undefined
      if (!el) return
      const delta = visualTop - (el.getBoundingClientRect().top + window.scrollY)
      dropping.value = to
      el.animate(
        [{ transform: `translateY(${delta}px) scale(1.02)` }, { transform: 'none' }],
        { duration: 320, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)' }
      ).finished.finally(() => {
        if (dropping.value === to) dropping.value = null
      })
    })
  }

  function reset() {
    dragIndex.value = null
    overIndex.value = null
    dragOffset.value = 0
  }

  function onHandleKeydown(event: KeyboardEvent, index: number) {
    const delta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0
    if (!delta) return
    const to = index + delta
    if (to < 0 || to >= options.count()) return
    event.preventDefault()
    options.move(index, to)
    void nextTick(() => {
      const handles = options.container.value?.querySelectorAll<HTMLElement>('[data-drag-handle]')
      handles?.[to]?.focus()
    })
  }

  /** Inline-Style für Element `index` während eines Drags. */
  function itemStyle(index: number) {
    const from = dragIndex.value
    const to = overIndex.value
    if (from == null || to == null) return undefined
    if (index === from) {
      return { transform: `translateY(${dragOffset.value}px) scale(1.02)`, zIndex: 20, transition: 'none' }
    }
    const shift = rects[from]!.height + gap
    if (from < to && index > from && index <= to) return { transform: `translateY(${-shift}px)` }
    if (from > to && index >= to && index < from) return { transform: `translateY(${shift}px)` }
    return { transform: 'translateY(0)' }
  }

  onBeforeUnmount(() => cancelAnimationFrame(rafId))

  return { dragIndex, dropping, onHandlePointerDown, onHandleKeydown, itemStyle }
}
