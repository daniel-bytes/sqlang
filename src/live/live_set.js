class LiveSet {
  constructor({ eventBus }) {
    this._event_bus = eventBus

    this._publish = () => {
      if (this._initialized && this._clip) {
        this._event_bus.publish(Events.clipChanged, this._clip)
      }
    }

    //this._track = new LiveAPI(() => {}, "this_device canonical_parent")
    this._clip = new Clip({
      liveApiObject: new LiveAPI(args => {}, "live_set view detail_clip")
    })

    this._detail_clip_observer = new LiveAPI(args => {
      if (!this._initialized || args.length < 3) return

      this._clip.id = args[2]
      this._publish()
    }, 
    "live_set view")

    this._detail_clip_observer.property = "detail_clip"
    this._initialized = true
    this._publish()
  }

  get clip() {
    return this._clip
  }
}