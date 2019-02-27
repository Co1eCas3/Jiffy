const anims = {};

(anims.trans_props = `.JIFFY__trans-props {
    animation-duration: .5s;
    animation-delay: 0s;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
    animation-play-state: running;
  }`),
  (anims.slide = {
    name: "slide",
    hasDir: true,
    rules: {
      right: `@keyframes slide-right {
      from { transform: translateX(0) }
      to { transform: translateX(120%) }
    }`,
      left: `@keyframes slide-left {
      from { transform: translateX(0) }
      to { transform: translateX(-120%) }
    }`
    }
  });

anims.blur = {
  name: "blur",
  hasDir: false,
  rule: `@keyframes blur {
    from { filter: blur(0); }
    to { filter: blur(20px); }
  }`
};

anims.cartwheel = {
  name: "cartwheel",
  hasDir: true,
  rules: {
    left: `@keyframes cartwheel-left {
      from {
        transform: rotate(0deg);
        transform-origin: left bottom;
      }
      to {
        transform: rotate(-90deg);
        transform-origin: left bottom;
      }
    }`,
    right: `@keyframes cartwheel-right {
      from {
        transform: rotate(0deg);
        transform-origin: right bottom;
      }
      to {
        transform: rotate(90deg);
        transform-origin: right bottom;
      }
    }`
  }
};
