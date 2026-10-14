// js/timeline.js
// Used by index.html.
// The sideways timeline already scrolls with touch, trackpad, shift + mouse wheel and arrow keys
// (because it has overflow-x: auto in the CSS). This small script adds one more thing:
// with a mouse you can press, hold and drag the timeline left or right.

var scroller = document.getElementById("timeline-scroll");

if (scroller) {
  // The timeline runs oldest (left) to newest (right). Start at the right end so the latest items show first.
  // Done again after everything has loaded, because fonts can change the width.
  function scrollToNewest() {
    scroller.scrollLeft = scroller.scrollWidth;
  }
  scrollToNewest();
  window.addEventListener("load", scrollToNewest);

  var isDown = false;    // is the mouse button held down?
  var startX = 0;         // where the mouse was when we started
  var startScroll = 0;    // how far the box was already scrolled
  var moved = false;      // did the mouse really move (a drag), or was it just a click?

  scroller.addEventListener("pointerdown", function (event) {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return; // touch already scrolls by itself
    }
    isDown = true;
    moved = false;
    startX = event.clientX;
    startScroll = scroller.scrollLeft;
  });

  window.addEventListener("pointermove", function (event) {
    if (!isDown) {
      return;
    }
    var distance = event.clientX - startX;
    if (Math.abs(distance) > 5) {
      moved = true;
      scroller.classList.add("is-dragging");
    }
    if (moved) {
      scroller.scrollLeft = startScroll - distance;
    }
  });

  window.addEventListener("pointerup", function () {
    isDown = false;
    scroller.classList.remove("is-dragging");
  });

  // If the user dragged, do not treat the release as a click (for example on "Club programs")
  scroller.addEventListener("click", function (event) {
    if (moved) {
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    }
  }, true);
}
