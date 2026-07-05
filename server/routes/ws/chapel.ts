import { getOrgChannel, registerWsPeer, unregisterWsPeer } from '../../utils/broadcast'

export default defineWebSocketHandler({
  open(peer) {
    peer.subscribe(getOrgChannel())
    registerWsPeer(peer)
  },
  close(peer) {
    peer.unsubscribe(getOrgChannel())
    unregisterWsPeer(peer)
  }
})
