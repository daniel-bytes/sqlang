class Context {
  constructor({ length, timeSignature, notes }) {
    this.length = length || 1
    this.timeSignature = timeSignature || new TimeSignature({ numerator: 4, denominator: 4 })
    this.notes = notes || []
  }

  toString() {
    return JSON.stringify({
      length: this.length,
      timeSignature: this.timeSignature.toString(),
      notes: this.notes.length
    })
  }
}