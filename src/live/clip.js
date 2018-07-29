class Clip {
  constructor({ liveApiObject }) {
    this._clip = liveApiObject
    this.MULT = 4.0
  }

  get id() {
    return this._clip.id
  }

  set id(id) {
    this._clip.id = id
  }

  get isValid() {
    return this._clip.id > 0 && 
        this._clip.get("is_midi_clip") == 1
  }

  get isInvalid() {
    return !this.isValid
  }

  get isLooping() {
    return this._clip.get("looping")[0] == 1
  }

  get length() {
    return this._clip.get("loop_end")[0] * this.MULT
  }

  get name() {
    return this._clip.get("name")[0]
  }

  get timeSignature() {
    return new TimeSignature({
      numerator: parseInt(this._clip.get("signature_numerator")[0]),
      denominator: parseInt(this._clip.get("signature_denominator")[0])
    })
  }

  get notes() {
    this._clip.call("select_all_notes")
    const values = this._clip.call("get_selected_notes")
    const results = []

    for (let i = 2, len = values.length - 1; i < len; i += 6) {
      results.push(
        new Note({
          pitch: values[i + 1],
          start: values[i + 2],
          duration: values[i + 3],
          velocity: values[i + 4],
          isMuted: values[i + 5]
        })
      )
    }

    return results
  }

  loadContext(context) {
    this.setLength(context.length)
    this.setTimeSignature(context.timeSignature)
    this.setNotes(context.notes)
  }

  createContext() {
    return new Context({
      length: this.length,
      timeSignature: this.timeSignature,
      notes: this.notes
    })
  }

  setNotes(notes) {
    if (this.isInvalid) return

    this._clip.call("select_all_notes")
    this._clip.call("replace_selected_notes")
    this._clip.call("notes", notes.length)

    notes.forEach(note => {
      this._clip.call("note", note.pitch, note.start, note.duration, note.velocity, note.isMuted)
    })
    
    this._clip.call("done")
    this._clip.call("deselect_all_notes")
  }

  setTimeSignature(timeSignature) {
    this._clip.set("signature_numerator", timeSignature.numerator)
    this._clip.set("signature_denominator", timeSignature.denominator)
  }

  setLength(value) {
    this._clip.set("loop_end", value * this.MULT)
  }

  toString() {
    return JSON.stringify({ 
      id: this.id,
      name: this.name,
      isValid: this.isValid,
      isLooping: this.isLooping,
      length: this.length,
      //notes: this._clip.call("get_selected_notes")
    })
  }
}