(function() {
  module.exports = function(jasmine) {
    var CallbackCompletion, originalExecute;
    originalExecute = jasmine.WaitsForBlock.prototype.execute;
    jasmine.WaitsForBlock.prototype.execute = function(onComplete) {
      if (this.latchFunction.length > 0) {
        return this.waitForCallback(onComplete);
      } else {
        return originalExecute.call(this, onComplete);
      }
    };
    jasmine.WaitsForBlock.prototype.waitForCallback = function(onComplete) {
      var callbackCompletion, e, onTimeout, timeoutHandle,
        _this = this;
      onTimeout = function() {
        var _ref;
        _this.spec.fail({
          name: 'timeout',
          message: 'timed out after ' + _this.timeout + ' ms waiting for ' + ((_ref = _this.message) != null ? _ref : 'something to happen')
        });
        callbackCompletion.cancelled = true;
        _this.abort = true;
        return onComplete();
      };
      timeoutHandle = this.env.setTimeout(onTimeout, this.timeout);
      callbackCompletion = new CallbackCompletion(this.latchFunction.length, this.env, onComplete, timeoutHandle);
      try {
        return this.latchFunction.apply(this.spec, callbackCompletion.completionFunctions);
      } catch (_error) {
        e = _error;
        this.spec.fail(e);
        onComplete();
      }
    };
    return CallbackCompletion = (function() {
      function CallbackCompletion(count, env, onComplete, timeoutHandle) {
        var i, _i;
        this.count = count;
        this.env = env;
        this.onComplete = onComplete;
        this.timeoutHandle = timeoutHandle;
        this.completionStatuses = new Array(this.count);
        this.completionFunctions = new Array(this.count);
        for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
          this.completionStatuses[i] = false;
          this.completionFunctions[i] = this.buildCompletionFunction(i);
        }
      }

      CallbackCompletion.prototype.attemptCompletion = function() {
        var status, _i, _len, _ref;
        if (this.cancelled) {
          return;
        }
        _ref = this.completionStatuses;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          status = _ref[_i];
          if (status === false) {
            return;
          }
        }
        this.env.clearTimeout(this.timeoutHandle);
        return this.onComplete();
      };

      CallbackCompletion.prototype.buildCompletionFunction = function(i) {
        var alreadyCalled,
          _this = this;
        alreadyCalled = false;
        return function() {
          if (alreadyCalled) {
            return;
          }
          alreadyCalled = true;
          _this.completionStatuses[i] = true;
          return _this.attemptCompletion();
        };
      };

      return CallbackCompletion;

    })();
  };

}).call(this);
