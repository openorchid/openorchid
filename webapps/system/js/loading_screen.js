!(function (exports) {
  'use strict';

  const LoadingScreen = {
    element: document.getElementById('loading-screen'),

    svgDom: `
      <svg viewBox="0 0 16 16" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <style>
          path {
            animation: spinner 2s ease-in-out infinite;
            stroke-dasharray: 1,200;
            stroke-dashoffset: 0;
            fill: none;
            stroke-width: 2;
            stroke-miterlimit: 10;
            stroke-linecap: round;
            transform-origin: 50% 50%;
            stroke: #fff;
          }

          @keyframes spinner {
            0% {
              stroke-dasharray: 0,200;
              stroke-dashoffset: 0;
              transform: rotate(0deg);
            }
            100% {
              stroke-dasharray: 130,200;
              stroke-dashoffset: -43;
              transform: rotate(-360deg);
            }
          }
        </style>
        <path d="M8 1A1 1 0 008 15 1 1 0 008 1"></path>
      </svg>
    `,

    show: function () {
      this.element.innerHTML = this.svgDom;
      this.element.classList.add('visible');
    },

    hide: function () {
      this.element.classList.remove('visible');
      this.element.addEventListener('transitionend', () => {
        this.element.innerHTML = '';
      });
    }
  };

  exports.LoadingScreen = LoadingScreen;
})(window);

