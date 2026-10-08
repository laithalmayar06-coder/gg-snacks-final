/** One transition at a time; manual input replaces the pending destination. */
export function createWorldSelection(initial = 0) {
  let active = initial
  let target: number | null = null
  let pending: number | null = null
  return {
    get requested() { return pending ?? target ?? active },
    request(index: number, manual = true) {
      if (target !== null) {
        if (manual) pending = index
        return false
      }
      if (!manual && pending !== null) return false
      pending = null
      if (index === active) return false
      target = index
      return true
    },
    commit(index: number) { active = index },
    finish() { target = null },
    takePending() {
      if (target !== null) return null
      const next = pending
      pending = null
      return next
    },
  }
}
