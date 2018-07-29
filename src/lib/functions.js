class InvalidFunctionError extends Error {
  constructor(name) {
    super(`Function ${name} does not exist`)
  }
}

class Functions {
  constructor({ eventBus }) {
    this._eventBus = eventBus
    this._publish = context => this._eventBus.publish(Events.contextUpdated, context)
    this._functions = {
      'bars': {
        func: this.bars,
        args: [ 'length' ]
      },
      'sig': {
        func: this.signature,
        args: [ 'value' ]
      }
    }
  }

  execute(name, context, args) {
    const result = this._functions[name]
    const numArgs = args ? args.length : 0

    if (result) {
      if (numArgs >= result.args.length) {
        return result.func.apply(this, [context].concat(args))
      }
    } else {
      throw new InvalidFunctionError(name)
    }
  }

  bars(context, length) {
    context.length = Math.max(1.0, parseFloat(length))
    this._publish(context)
  }

  signature(context, value) {
    const parts = value.split('/')
    if (parts.length !== 2) {
      println(`Error: invalid type signature ${value}`)
      return
    }

    const numerator = parseInt(parts[0])
    const denominator = parseInt(parts[1])
    context.timeSignature = new TimeSignature({ numerator, denominator })
    this._publish(context)
  }
}