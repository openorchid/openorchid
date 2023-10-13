!(function () {
  'use strict';

  // Define a function to handle the mutation
  function handleMutation(mutations) {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'WEBVIEW') {
          // Set attributes for the newly added webview
          node.setAttribute('useragent', navigator.userAgent);
          node.setAttribute('preload', 'openorchid://preload.js');
          node.setAttribute('nodeintegration', true);
          node.setAttribute('nodeintegrationinsubframes', true);

          [
            'did-start-loading',
            'did-start-navigation',
            'did-stop-loading',
            'dom-ready'
          ].forEach((eventType) => {
            webview.addEventListener(eventType, () => {
              const xhr = new XMLHttpRequest();
              xhr.open('GET', 'openorchid://dom/html.css', true);
              xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                  const cssContent = xhr.responseText;
                  webview.insertCSS(cssContent);
                } else if (xhr.readyState === 4) {
                  console.error(
                    'Failed to fetch CSS:',
                    xhr.status,
                    xhr.statusText
                  );
                }
              };
              xhr.send();

              const xhr1 = new XMLHttpRequest();
              xhr1.open('GET', 'openorchid://dom/index.js', true);
              xhr1.onreadystatechange = function () {
                if (xhr1.readyState === 4 && xhr1.status === 200) {
                  const jsContent = xhr1.responseText;
                  webview.executeJavaScript(jsContent);
                } else if (xhr1.readyState === 4) {
                  console.error(
                    'Failed to fetch JS:',
                    xhr1.status,
                    xhr1.statusText
                  );
                }
              };
              xhr1.send();

              if (/^http:\/\/.*\.localhost:8081\//.test(webview.getURL())) {
                webview.nodeintegration = true;
              } else {
                webview.nodeintegration = false;
              }
            });
          });
        }
      });
    });
  }

  // Create a new instance of MutationObserver and set up the observer
  const observer = new MutationObserver(handleMutation);

  // Select the target node (body in this case)
  const targetNode = document.body;

  // Options for the observer (we're interested in childList mutations)
  const config = { childList: true, subtree: true };

  // Start observing the target node with the specified options
  observer.observe(targetNode, config);
})();