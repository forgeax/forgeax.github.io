/* Scroll-triggered silk reveals — Linear-style section entrances */
(function () {
  if (!window.IntersectionObserver) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    document.querySelectorAll(".reveal-on-scroll").forEach(function (el) {
      el.classList.add("is-inview");
    });
    return;
  }
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-inview");
          io.unobserve(e.target);
        }
      });
    },
    { root: null, rootMargin: "0px 0px -5% 0px", threshold: 0.08 }
  );
  document.querySelectorAll(".reveal-on-scroll").forEach(function (el) {
    io.observe(el);
  });
})();
