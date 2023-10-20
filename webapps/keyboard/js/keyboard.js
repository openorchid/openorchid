!(function (exports) {
  'use strict';

  const Keyboards = {
    suggestions: document.getElementById('suggestions'),
    keys: null,
    toolbar: document.getElementById('toolbar'),

    currentLanguage: 'en',

    init: function () {
      this.keys = document.getElementById('keys');

      this.createLayoutKeyset({
        isCapsLock: false
      });
    },

    createLayoutKeyset: function ({ isCapsLock = false, targetPage = 0 }) {
      const data = Keyboards[this.currentLanguage];
      let keys = data.keys;
      if (data.pages && data.pages[targetPage]) {
        keys = data.pages[targetPage].keys;
      }

      const symbolsButton = {
        value: targetPage === 0 ? '123' : data.shortLabel,
        keyCode: KeyEvent.DOM_VK_ALT,
        targetPage: targetPage === 0 ? 1 : 0,
        ratio: 2,
        className: 'special'
      };

      const quickSymbolButton = {
        value: '.'
      };

      this.keys.innerHTML = '';

      keys.forEach((row, index) => {
        const keyRow = document.createElement('div');
        keyRow.classList.add('keyboard-row');
        this.keys.appendChild(keyRow);

        if (index === keys.length - 1) {
          row = [symbolsButton, quickSymbolButton, ...row];
        }

        row.forEach((key) => {
          const keyButton = document.createElement('button');
          keyButton.classList.add('key');
          if (key.className) {
            keyButton.classList.add(key.className);
          }
          keyRow.appendChild(keyButton);

          const displayValue = key.value;
          switch (displayValue) {
            case '⇪':
              keyButton.classList.add('special');
              keyButton.classList.add('shift');
              if (isCapsLock) {
                keyButton.classList.add('active');
              }
              break;

            case '⌫':
              keyButton.classList.add('special');
              keyButton.classList.add('backspace');
              break;

            case '↵':
              keyButton.classList.add('return');
              break;

            default:
              break;
          }

          if (isCapsLock) {
            keyButton.innerHTML = displayValue.startsWith('&')
              ? displayValue
              : displayValue.toUpperCase();
          } else {
            keyButton.innerHTML = displayValue;
          }
          if (key.ratio) {
            keyButton.style.flex = key.ratio;
          }

          keyButton.addEventListener('click', () => {
            if (key.keyCode === KeyEvent.DOM_VK_CAPS_LOCK) {
              this.createLayoutKeyset({
                isCapsLock: !isCapsLock
              });
            } else if (key.keyCode === KeyEvent.DOM_VK_ALT) {
              this.createLayoutKeyset({
                targetPage: key.targetPage
              });
            }
          });
        });
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    Keyboards.init();
  });

  exports.Keyboards = Keyboards;
})(window);
