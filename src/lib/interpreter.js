class Interpreter {
  constructor({ functions }) {
    this._functions = functions
  }

  execute(ast, context) {
    return this[`execute_${ast.type}`](ast, context)
  }

  execute_script(ast, context) {
    ast.children.forEach(child => {
      this.execute(child, context)
    })
  }

  execute_function(ast, context) {
    const args = []
    
    ast.children.forEach(child => {
      args.push(this.execute(child, context))
    })
    
    return this._functions.execute(ast.value, context, args)
  }

  execute_value(ast, context) {
    return ast.value
  }
}