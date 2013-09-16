module.exports = (jasmine) ->
  originalExecute = jasmine.WaitsForBlock::execute

  jasmine.WaitsForBlock::execute = (onComplete) ->
    if @latchFunction.length > 0
      @waitForCallback(onComplete)
    else
      originalExecute.call(this, onComplete)

  jasmine.WaitsForBlock::waitForCallback = (onComplete) ->
    onTimeout = =>
      @spec.fail
        name: 'timeout',
        message: 'timed out after ' + @timeout + ' ms waiting for ' + (@message ? 'something to happen')
      callbackCompletion.cancelled = true
      @abort = true
      onComplete()

    timeoutHandle = @env.setTimeout(onTimeout, @timeout)
    callbackCompletion = new CallbackCompletion(@latchFunction.length, @env, onComplete, timeoutHandle)

    try
      @latchFunction.apply(@spec, callbackCompletion.completionFunctions)
    catch e
      @spec.fail(e)
      onComplete()
      return

  class CallbackCompletion
    constructor: (@count, @env, @onComplete, @timeoutHandle) ->
      @completionStatuses = new Array(@count)
      @completionFunctions = new Array(@count)
      for i in [0...count]
        @completionStatuses[i] = false
        @completionFunctions[i] = @buildCompletionFunction(i)

    attemptCompletion: ->
      return if @cancelled
      for status in @completionStatuses
        return if status is false
      @env.clearTimeout(@timeoutHandle)
      @onComplete()

    buildCompletionFunction: (i) ->
      alreadyCalled = false
      =>
        return if alreadyCalled
        alreadyCalled = true
        @completionStatuses[i] = true
        @attemptCompletion()
