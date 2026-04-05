import { useEffect, useRef } from 'react'

type FocusableField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

function isVisible(element: HTMLElement): boolean {
  return element.offsetParent !== null || element.getClientRects().length > 0
}

function isEmptyField(element: FocusableField): boolean {
  if (element instanceof HTMLSelectElement) {
    return element.value === ''
  }

  return element.value.trim() === ''
}

export function useSmartFormAutofocus(enabled = true) {
  const formRef = useRef<HTMLFormElement | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      const form = formRef.current
      if (!form) {
        return
      }

      const activeElement = document.activeElement
      if (
        activeElement instanceof HTMLElement &&
        form.contains(activeElement)
      ) {
        return
      }

      const fields = Array.from(
        form.querySelectorAll<FocusableField>(
          'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])',
        ),
      ).filter((field) => isVisible(field) && !field.dataset.noAutofocus)

      if (fields.length === 0) {
        return
      }

      const targetField = fields.find(isEmptyField) ?? fields[0]
      targetField.focus({ preventScroll: true })
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [enabled])

  return formRef
}
