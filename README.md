# Jasmine Waits-For-Callback Extension

This module extends jasmine `waitsFor` blocks with a useful feature for async
testing. Normally, jasmine will poll the latch function you pass to `waitsFor`
and only advance the test when the function returns true.

With this extension loaded, if the function you pass to `waitsFor` declares one
or more parameters, it will be passed a callback for each of its parameters.
Instead of polling, jasmine will now wait until all the callbacks have been
called.

```coffee
# In your spec helper
require('jasmine-waits-for-callback')(jasmine) # pass the module your global jasmine object

# In your specs

describe "async process", ->
  it "runs to completion", ->
    waitsFor "multiple async calls", (doneWith1, doneWith2) ->
      startWebServer "localhost:3000", doneWith1
      makeRequest "google.com", doneWith2
  
    runs ->
      # this won't happen until doneWith1 and doneWith2 are both called
```
