class ParserError extends Error {
  constructor(message) {
    super(message)
  }
}

class Parser {
  parse(code) {
    const results = []

    code.split("\n").forEach(line => {
      const result = this.parseLine(line)

      if (result) {
        results.push(result)
      }
    })

    return new ScriptNode(code, results)
  }

  parseLine(line) {
    const parts = line.split(/\s+/).filter(Boolean)
    if (!parts) return null

    const args = []

    for (let i = 1; i < parts.length; i++) {
      args.push(
        new ValueNode(parts[i])
      )
    }

    return new FunctionNode(parts[0].toLowerCase(), args)
  }
}