class TimeSignature {
  constructor({ numerator, denominator }) {
    this._numerator = numerator
    this._denominator = denominator
  }

  get numerator() { return this._numerator }
  get denominator() { return this._denominator }

  toString() {
    return `${this.numerator}/${this.denominator}`
  }
}