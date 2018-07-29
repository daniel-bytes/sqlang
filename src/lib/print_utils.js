function println(args) {
  post(args)
  post("\n")
}

function debug(args) {
  println("debug: ")

  if (typeof args === 'object') {  
    for (let prop in args) {
      println(`- ${prop}: ${args[prop]}`)
    }
  } else {
    println(`- ${args}`)
  }
}