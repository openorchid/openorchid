!(function () {
  'use strict';

  const fs = require('fs');
  const path = require('path');
  const isDev = require('electron-is-dev');

  require('dotenv').config();

  let defaultsDir = path.join(process.cwd(), 'defaults');
  if (isDev) {
    defaultsDir = path.join(process.cwd(), 'customization', 'defaults');
  }

  fs.mkdirSync(process.env.ORCHID_APP_PROFILE, { recursive: true });

  fs.readdir(defaultsDir, (error, files) => {
    if (error) {
      return;
    }
    files.forEach((file) => {
      if (fs.existsSync(path.join(process.env.ORCHID_APP_PROFILE, file))) {
        return;
      }
      fs.copyFileSync(
        path.join(defaultsDir, file),
        path.join(process.env.ORCHID_APP_PROFILE, file)
      );
    });
  }, { recursive: true });
})();
