const NodeTypes = {
  script: 'script',
  value: 'value',
  function: 'function'
}

class Node {
  constructor(type, value, children) {
    this._type = type
    this._value = value
    this._children = children || []
  }

  get type() { return this._type }
  get value() { return this._value }
  get children() { return this._children }

  toString() {
    return JSON.stringify({
      type: this.type,
      value: this.value,
      children: this.children
    }, 0, 2)
  }
}

class ScriptNode extends Node {
  constructor(code, expressions) {
    super(NodeTypes.script, code, expressions)
  }
}

class ValueNode extends Node {
  constructor(value) {
    super(NodeTypes.value, value)
  }
}

class FunctionNode extends Node {
  constructor(name, args) {
    super(NodeTypes.function, name, args)
  }
}
