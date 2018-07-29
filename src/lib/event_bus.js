const Events = {
  clipChanged: 'clip-changed',
  contextUpdated: 'context-updated'
}

// EventBus deferlow callback function
function publish_event(id) {
  if (!eventBus) return

  eventBus.pushDeferredEvent(id)
}

class EventBus {
  constructor() {
    this._last_instance_id = 0
    this._channels = {}
    this._events = {}
  }

  publish(id, payload) {
    // We need to stash the event payload so we can call out of
    // js and into a deferlow
    // TODO: there should be some way to do this via Task?
    const instanceId = this._last_instance_id++
    this._events[instanceId] = { id, payload }

    // Pipe out of js to a deferlow, then back in to js
    outlet(0, 'publish_event', instanceId)
  }

  pushDeferredEvent(instanceId) {
    // This should be called from the global publish_event
    // function after being sent thru max deferlow
    if (!this._events[instanceId]) return

    const { id, payload } = this._events[instanceId]
    delete this._events[instanceId]
    const callbacks = this._channels[id] || []

    callbacks.forEach(callback => {
      callback(payload)
    })
  }

  subscribe(id, callback) {
    if (!this._channels[id]) {
      this._channels[id] = []
    }

    this._channels[id].push(callback)
  }
}