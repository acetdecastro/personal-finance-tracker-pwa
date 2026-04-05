const FOCUS_RING_CLS =
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const INLINE_ACTION_BUTTON_CLS = `flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition ${FOCUS_RING_CLS}`

export const SMALL_PRIMARY_BUTTON_CLS = `rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground ${FOCUS_RING_CLS}`

export const PRIMARY_LINK_BUTTON_CLS = `inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition active:scale-[0.98] ${FOCUS_RING_CLS}`

export const DISABLED_BUTTON_CLS = `flex-1 rounded-xl bg-muted py-2.5 text-sm font-semibold text-muted-foreground/70 ${FOCUS_RING_CLS}`

export const PRIMARY_FAB_CLS = `fixed bottom-24 right-5 z-30 flex size-14 items-center justify-center rounded-2xl bg-primary shadow-lg transition active:scale-90 ${FOCUS_RING_CLS}`
