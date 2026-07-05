import type { ChapelEvent } from '#shared/types/chapel'

const orgPeers = new Set<{ publish: (channel: string, message: string) => void }>()

export function registerWsPeer(peer: { publish: (channel: string, message: string) => void }) {
  orgPeers.add(peer)
}

export function unregisterWsPeer(peer: { publish: (channel: string, message: string) => void }) {
  orgPeers.delete(peer)
}

export function broadcastEvent(event: ChapelEvent) {
  const message = JSON.stringify(event)
  for (const peer of orgPeers) {
    try {
      peer.publish(getOrgChannel(), message)
    } catch {
      // ignore disconnected peers
    }
  }
}

export function getOrgChannel() {
  return 'chapel:org'
}
