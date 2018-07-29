'use strict';

outlets = 2;
inlets = 1;

var eventBus = null;
var context = null;
var functions = null;
var interpreter = null;
var parser = null;
var liveSet = null;
var lastCode = null;
var ready = false;

function init() {
  eventBus = new EventBus();

  eventBus.subscribe(Events.clipChanged, function (clip) {
    context = clip.createContext();
  });

  eventBus.subscribe(Events.contextUpdated, function (ctx) {
    if (liveSet.clip) {
      liveSet.clip.loadContext(ctx);
    }
  });

  liveSet = new LiveSet({ eventBus: eventBus });
  functions = new Functions({ eventBus: eventBus });
  interpreter = new Interpreter({ functions: functions });
  parser = new Parser();

  if (liveSet.clip && liveSet.clip.isValid) {
    println("Creating initial context");
    context = liveSet.clip.createContext();
  }

  ready = true;
}

function text(code) {
  code = (code || '').trim();

  if (!code || !ready) return;

  try {
    var ast = parser.parse(code);
    interpreter.execute(ast, context);
  } catch (e) {
    println('ERROR: ' + e);
  }
  //println(`result: ${result}`)
}

function textchanged(value) {
  outlet(1, 'bang');
}

function write() {
  if (!ready) {
    println("Not ready");
    return;
  }

  if (!context) {
    println("No selected clip");
    return;
  }

  if (liveSet.clip && liveSet.clip.isValid) {
    liveSet.clip.loadContext(context);
  } else {
    println("Error: Invalid clip");
  }
}
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeTypes = {
  script: 'script',
  value: 'value',
  function: 'function'
};

var Node = function () {
  function Node(type, value, children) {
    _classCallCheck(this, Node);

    this._type = type;
    this._value = value;
    this._children = children || [];
  }

  _createClass(Node, [{
    key: 'toString',
    value: function toString() {
      return JSON.stringify({
        type: this.type,
        value: this.value,
        children: this.children
      }, 0, 2);
    }
  }, {
    key: 'type',
    get: function get() {
      return this._type;
    }
  }, {
    key: 'value',
    get: function get() {
      return this._value;
    }
  }, {
    key: 'children',
    get: function get() {
      return this._children;
    }
  }]);

  return Node;
}();

var ScriptNode = function (_Node) {
  _inherits(ScriptNode, _Node);

  function ScriptNode(code, expressions) {
    _classCallCheck(this, ScriptNode);

    return _possibleConstructorReturn(this, (ScriptNode.__proto__ || Object.getPrototypeOf(ScriptNode)).call(this, NodeTypes.script, code, expressions));
  }

  return ScriptNode;
}(Node);

var ValueNode = function (_Node2) {
  _inherits(ValueNode, _Node2);

  function ValueNode(value) {
    _classCallCheck(this, ValueNode);

    return _possibleConstructorReturn(this, (ValueNode.__proto__ || Object.getPrototypeOf(ValueNode)).call(this, NodeTypes.value, value));
  }

  return ValueNode;
}(Node);

var FunctionNode = function (_Node3) {
  _inherits(FunctionNode, _Node3);

  function FunctionNode(name, args) {
    _classCallCheck(this, FunctionNode);

    return _possibleConstructorReturn(this, (FunctionNode.__proto__ || Object.getPrototypeOf(FunctionNode)).call(this, NodeTypes.function, name, args));
  }

  return FunctionNode;
}(Node);
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Context = function () {
  function Context(_ref) {
    var length = _ref.length,
        timeSignature = _ref.timeSignature,
        notes = _ref.notes;

    _classCallCheck(this, Context);

    this.length = length || 1;
    this.timeSignature = timeSignature || new TimeSignature({ numerator: 4, denominator: 4 });
    this.notes = notes || [];
  }

  _createClass(Context, [{
    key: "toString",
    value: function toString() {
      return JSON.stringify({
        length: this.length,
        timeSignature: this.timeSignature.toString(),
        notes: this.notes.length
      });
    }
  }]);

  return Context;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Events = {
  clipChanged: 'clip-changed',
  contextUpdated: 'context-updated'

  // EventBus deferlow callback function
};function publish_event(id) {
  if (!eventBus) return;

  eventBus.pushDeferredEvent(id);
}

var EventBus = function () {
  function EventBus() {
    _classCallCheck(this, EventBus);

    this._last_instance_id = 0;
    this._channels = {};
    this._events = {};
  }

  _createClass(EventBus, [{
    key: 'publish',
    value: function publish(id, payload) {
      // We need to stash the event payload so we can call out of
      // js and into a deferlow
      // TODO: there should be some way to do this via Task?
      var instanceId = this._last_instance_id++;
      this._events[instanceId] = { id: id, payload: payload

        // Pipe out of js to a deferlow, then back in to js
      };outlet(0, 'publish_event', instanceId);
    }
  }, {
    key: 'pushDeferredEvent',
    value: function pushDeferredEvent(instanceId) {
      // This should be called from the global publish_event
      // function after being sent thru max deferlow
      if (!this._events[instanceId]) return;

      var _events$instanceId = this._events[instanceId],
          id = _events$instanceId.id,
          payload = _events$instanceId.payload;

      delete this._events[instanceId];
      var callbacks = this._channels[id] || [];

      callbacks.forEach(function (callback) {
        callback(payload);
      });
    }
  }, {
    key: 'subscribe',
    value: function subscribe(id, callback) {
      if (!this._channels[id]) {
        this._channels[id] = [];
      }

      this._channels[id].push(callback);
    }
  }]);

  return EventBus;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InvalidFunctionError = function (_Error) {
  _inherits(InvalidFunctionError, _Error);

  function InvalidFunctionError(name) {
    _classCallCheck(this, InvalidFunctionError);

    return _possibleConstructorReturn(this, (InvalidFunctionError.__proto__ || Object.getPrototypeOf(InvalidFunctionError)).call(this, 'Function ' + name + ' does not exist'));
  }

  return InvalidFunctionError;
}(Error);

var Functions = function () {
  function Functions(_ref) {
    var _this2 = this;

    var eventBus = _ref.eventBus;

    _classCallCheck(this, Functions);

    this._eventBus = eventBus;
    this._publish = function (context) {
      return _this2._eventBus.publish(Events.contextUpdated, context);
    };
    this._functions = {
      'bars': {
        func: this.bars,
        args: ['length']
      },
      'sig': {
        func: this.signature,
        args: ['value']
      }
    };
  }

  _createClass(Functions, [{
    key: 'execute',
    value: function execute(name, context, args) {
      var result = this._functions[name];
      var numArgs = args ? args.length : 0;

      if (result) {
        if (numArgs >= result.args.length) {
          return result.func.apply(this, [context].concat(args));
        }
      } else {
        throw new InvalidFunctionError(name);
      }
    }
  }, {
    key: 'bars',
    value: function bars(context, length) {
      context.length = Math.max(1.0, parseFloat(length));
      this._publish(context);
    }
  }, {
    key: 'signature',
    value: function signature(context, value) {
      var parts = value.split('/');
      if (parts.length !== 2) {
        println('Error: invalid type signature ' + value);
        return;
      }

      var numerator = parseInt(parts[0]);
      var denominator = parseInt(parts[1]);
      context.timeSignature = new TimeSignature({ numerator: numerator, denominator: denominator });
      this._publish(context);
    }
  }]);

  return Functions;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Interpreter = function () {
  function Interpreter(_ref) {
    var functions = _ref.functions;

    _classCallCheck(this, Interpreter);

    this._functions = functions;
  }

  _createClass(Interpreter, [{
    key: "execute",
    value: function execute(ast, context) {
      return this["execute_" + ast.type](ast, context);
    }
  }, {
    key: "execute_script",
    value: function execute_script(ast, context) {
      var _this = this;

      ast.children.forEach(function (child) {
        _this.execute(child, context);
      });
    }
  }, {
    key: "execute_function",
    value: function execute_function(ast, context) {
      var _this2 = this;

      var args = [];

      ast.children.forEach(function (child) {
        args.push(_this2.execute(child, context));
      });

      return this._functions.execute(ast.value, context, args);
    }
  }, {
    key: "execute_value",
    value: function execute_value(ast, context) {
      return ast.value;
    }
  }]);

  return Interpreter;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Note = function () {
  // See http://compusition.com/writings/js-live-api-midi-clips-writing
  // regarding conversions for numeric values below
  function Note(_ref) {
    var pitch = _ref.pitch,
        start = _ref.start,
        duration = _ref.duration,
        velocity = _ref.velocity,
        isMuted = _ref.isMuted;

    _classCallCheck(this, Note);

    var minDuration = 1 / 128;
    this._pitch = Math.min(127, Math.max(0, parseInt(pitch)));
    this._start = start <= 0.0 ? "0.0" : start.toFixed(4);
    this._duration = duration <= minDuration ? minDuration : duration.toFixed(4);
    this._velocity = Math.min(127, Math.max(0, parseInt(velocity)));
    this._is_muted = !!isMuted;
  }

  _createClass(Note, [{
    key: "pitch",
    get: function get() {
      return this._pitch;
    }
  }, {
    key: "start",
    get: function get() {
      return this._start;
    }
  }, {
    key: "duration",
    get: function get() {
      return this._duration;
    }
  }, {
    key: "velocity",
    get: function get() {
      return this._velocity;
    }
  }, {
    key: "isMuted",
    get: function get() {
      return this._is_muted;
    }
  }]);

  return Note;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ParserError = function (_Error) {
  _inherits(ParserError, _Error);

  function ParserError(message) {
    _classCallCheck(this, ParserError);

    return _possibleConstructorReturn(this, (ParserError.__proto__ || Object.getPrototypeOf(ParserError)).call(this, message));
  }

  return ParserError;
}(Error);

var Parser = function () {
  function Parser() {
    _classCallCheck(this, Parser);
  }

  _createClass(Parser, [{
    key: "parse",
    value: function parse(code) {
      var _this2 = this;

      var results = [];

      code.split("\n").forEach(function (line) {
        var result = _this2.parseLine(line);

        if (result) {
          results.push(result);
        }
      });

      return new ScriptNode(code, results);
    }
  }, {
    key: "parseLine",
    value: function parseLine(line) {
      var parts = line.split(/\s+/).filter(Boolean);
      if (!parts) return null;

      var args = [];

      for (var i = 1; i < parts.length; i++) {
        args.push(new ValueNode(parts[i]));
      }

      return new FunctionNode(parts[0].toLowerCase(), args);
    }
  }]);

  return Parser;
}();
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function println(args) {
  post(args);
  post("\n");
}

function debug(args) {
  println("debug: ");

  if ((typeof args === "undefined" ? "undefined" : _typeof(args)) === 'object') {
    for (var prop in args) {
      println("- " + prop + ": " + args[prop]);
    }
  } else {
    println("- " + args);
  }
}
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TimeSignature = function () {
  function TimeSignature(_ref) {
    var numerator = _ref.numerator,
        denominator = _ref.denominator;

    _classCallCheck(this, TimeSignature);

    this._numerator = numerator;
    this._denominator = denominator;
  }

  _createClass(TimeSignature, [{
    key: "toString",
    value: function toString() {
      return this.numerator + "/" + this.denominator;
    }
  }, {
    key: "numerator",
    get: function get() {
      return this._numerator;
    }
  }, {
    key: "denominator",
    get: function get() {
      return this._denominator;
    }
  }]);

  return TimeSignature;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Clip = function () {
  function Clip(_ref) {
    var liveApiObject = _ref.liveApiObject;

    _classCallCheck(this, Clip);

    this._clip = liveApiObject;
    this.MULT = 4.0;
  }

  _createClass(Clip, [{
    key: "loadContext",
    value: function loadContext(context) {
      this.setLength(context.length);
      this.setTimeSignature(context.timeSignature);
      this.setNotes(context.notes);
    }
  }, {
    key: "createContext",
    value: function createContext() {
      return new Context({
        length: this.length,
        timeSignature: this.timeSignature,
        notes: this.notes
      });
    }
  }, {
    key: "setNotes",
    value: function setNotes(notes) {
      var _this = this;

      if (this.isInvalid) return;

      this._clip.call("select_all_notes");
      this._clip.call("replace_selected_notes");
      this._clip.call("notes", notes.length);

      notes.forEach(function (note) {
        _this._clip.call("note", note.pitch, note.start, note.duration, note.velocity, note.isMuted);
      });

      this._clip.call("done");
      this._clip.call("deselect_all_notes");
    }
  }, {
    key: "setTimeSignature",
    value: function setTimeSignature(timeSignature) {
      this._clip.set("signature_numerator", timeSignature.numerator);
      this._clip.set("signature_denominator", timeSignature.denominator);
    }
  }, {
    key: "setLength",
    value: function setLength(value) {
      this._clip.set("loop_end", value * this.MULT);
    }
  }, {
    key: "toString",
    value: function toString() {
      return JSON.stringify({
        id: this.id,
        name: this.name,
        isValid: this.isValid,
        isLooping: this.isLooping,
        length: this.length
        //notes: this._clip.call("get_selected_notes")
      });
    }
  }, {
    key: "id",
    get: function get() {
      return this._clip.id;
    },
    set: function set(id) {
      this._clip.id = id;
    }
  }, {
    key: "isValid",
    get: function get() {
      return this._clip.id > 0 && this._clip.get("is_midi_clip") == 1;
    }
  }, {
    key: "isInvalid",
    get: function get() {
      return !this.isValid;
    }
  }, {
    key: "isLooping",
    get: function get() {
      return this._clip.get("looping")[0] == 1;
    }
  }, {
    key: "length",
    get: function get() {
      return this._clip.get("loop_end")[0] * this.MULT;
    }
  }, {
    key: "name",
    get: function get() {
      return this._clip.get("name")[0];
    }
  }, {
    key: "timeSignature",
    get: function get() {
      return new TimeSignature({
        numerator: parseInt(this._clip.get("signature_numerator")[0]),
        denominator: parseInt(this._clip.get("signature_denominator")[0])
      });
    }
  }, {
    key: "notes",
    get: function get() {
      this._clip.call("select_all_notes");
      var values = this._clip.call("get_selected_notes");
      var results = [];

      for (var i = 2, len = values.length - 1; i < len; i += 6) {
        results.push(new Note({
          pitch: values[i + 1],
          start: values[i + 2],
          duration: values[i + 3],
          velocity: values[i + 4],
          isMuted: values[i + 5]
        }));
      }

      return results;
    }
  }]);

  return Clip;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LiveSet = function () {
  function LiveSet(_ref) {
    var _this = this;

    var eventBus = _ref.eventBus;

    _classCallCheck(this, LiveSet);

    this._event_bus = eventBus;

    this._publish = function () {
      if (_this._initialized && _this._clip) {
        _this._event_bus.publish(Events.clipChanged, _this._clip);
      }
    };

    //this._track = new LiveAPI(() => {}, "this_device canonical_parent")
    this._clip = new Clip({
      liveApiObject: new LiveAPI(function (args) {}, "live_set view detail_clip")
    });

    this._detail_clip_observer = new LiveAPI(function (args) {
      if (!_this._initialized || args.length < 3) return;

      _this._clip.id = args[2];
      _this._publish();
    }, "live_set view");

    this._detail_clip_observer.property = "detail_clip";
    this._initialized = true;
    this._publish();
  }

  _createClass(LiveSet, [{
    key: "clip",
    get: function get() {
      return this._clip;
    }
  }]);

  return LiveSet;
}();
