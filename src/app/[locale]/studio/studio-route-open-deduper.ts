/** Keeps React effect replay and same-route browser events out of route analytics. */
export class StudioRouteOpenDeduper {
  private initialLocationClaimed = false

  claimInitialLocation(): boolean {
    if (this.initialLocationClaimed) return false
    this.initialLocationClaimed = true
    return true
  }

  isHistoryTransition(currentRoute: string, nextRoute: string): boolean {
    return currentRoute !== nextRoute
  }
}
