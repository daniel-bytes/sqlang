class Note {
  // See http://compusition.com/writings/js-live-api-midi-clips-writing
  // regarding conversions for numeric values below
  constructor({ pitch, start, duration, velocity, isMuted }) {
    const minDuration = 1/128
    this._pitch = Math.min(127, Math.max(0, parseInt(pitch)))
    this._start = start <= 0.0 ? "0.0" : start.toFixed(4)
    this._duration = duration <= minDuration ? minDuration : duration.toFixed(4)
    this._velocity = Math.min(127, Math.max(0, parseInt(velocity)))
    this._is_muted = !!isMuted
  }

  get pitch() { return this._pitch }
  get start() { return this._start }
  get duration() { return this._duration }
  get velocity() { return this._velocity }
  get isMuted() { return this._is_muted }
}