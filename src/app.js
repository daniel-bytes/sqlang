outlets = 2
inlets = 1

let eventBus = null
let context = null
let functions = null
let interpreter = null
let parser = null
let liveSet = null
let lastCode = null
let ready = false

function init() {
  eventBus = new EventBus()

  eventBus.subscribe(Events.clipChanged, clip => {
    context = clip.createContext()
  })

  eventBus.subscribe(Events.contextUpdated, ctx => {
    if (liveSet.clip) {
      liveSet.clip.loadContext(ctx)
    }
  })

  liveSet = new LiveSet({ eventBus })
  functions = new Functions({ eventBus })
  interpreter = new Interpreter({ functions })
  parser = new Parser()
  
  if (liveSet.clip && liveSet.clip.isValid) {
    println("Creating initial context")
    context = liveSet.clip.createContext()
  }

  ready = true
}

function text(code) {
  code = (code || '').trim()

  if (!code || !ready) return

  try {
    const ast = parser.parse(code)
    interpreter.execute(ast, context)
  } catch(e) {
    println(`ERROR: ${e}`)
  }
  //println(`result: ${result}`)
}

function textchanged(value) {
  outlet(1, 'bang')
}

function write() {
  if (!ready) {
    println("Not ready")
    return
  }

  if (!context) {
    println("No selected clip")
    return
  }

  if (liveSet.clip && liveSet.clip.isValid) {
    liveSet.clip.loadContext(context)
  } else {
    println("Error: Invalid clip")
  }
}

