!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const PowerScreen = {
    overlay: document.getElementById('power-screen'),
    shutdownButton: document.getElementById('power-screen-shutdown-button'),
    restartButton: document.getElementById('power-screen-restart-button'),

    isVisible: false,

    init: function () {
      this.shutdownButton.addEventListener('click', this.handleShutdownButton.bind(this));
      this.restartButton.addEventListener('click', this.handleRestartButton.bind(this));
    },

    show: function () {
      this.isVisible = true;
      this.overlay.classList.add('visible');
    },

    hide: function () {
      this.isVisible = false;
      this.overlay.classList.remove('visible');
    },

    toggle: function () {
      this.isVisible = !this.isVisible;
      this.overlay.classList.toggle('visible', this.isVisible);
    },

    handleShutdownButton: function () {
      ipcRenderer.send('shutdown', {});
    },

    handleRestartButton: function () {
      ipcRenderer.send('restart', {});
    }
  };

  PowerScreen.init();

  exports.PowerScreen = PowerScreen;
})(window);
