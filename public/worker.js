self.importScripts('linenavigator.min.js');

addEventListener("message", function(event) {
  const navigator = new LineNavigator(event.data);
  console.log("START");
  navigator.readLines(0, 1, function callback(err, index, lines, isEof, progress) {
    if (err) {
      console.err(err);
      return;
    }
    if (isEof) {
      console.log("END");
      return;
    }
    navigator.readLines(index + 1, 1, callback)
  });
}, false);
