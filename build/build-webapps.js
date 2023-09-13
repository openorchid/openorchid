const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { glob } = require('glob');

module.exports = function (sourcePath, outputDir) {
  const ignoredFiles = ['node_modules', 'package-lock.json'];

  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  } else {
    fs.rmdirSync(outputDir, { recursive: true, force: true });
    fs.mkdirSync(outputDir);
  }

  // Read the list of webapps in the source directory
  glob(sourcePath, async (error, webapps) => {
    if (error) {
      console.error(error);
      return;
    }

    // Loop through each webapp and create a zip file
    webapps.forEach((webapp) => {
      const zip = new AdmZip();

      const outputwebappPath = path.join(outputDir, path.dirname(webapp));
      if (!fs.existsSync(outputwebappPath)) {
        fs.mkdirSync(outputwebappPath);
      }

      const webappFiles = fs.readdirSync(path.join(webapp));
      webappFiles.forEach((file) => {
        if (ignoredFiles.indexOf(file) === -1) {
          const sourcePathCopy = path.join(webapp, file);
          const destPath = path.join(outputDir, webapp, file);
          fs.copyFileSync(sourcePathCopy, destPath);
        }
      });

      // Add all files and subdirectories from the webapp directory except 'node_modules' to the zip
      const filesToZip = fs.readdirSync(webapp);
      filesToZip.forEach((file) => {
        if (ignoredFiles.indexOf(file) === -1) {
          const sourcePath = path.join(webapp, file);
          if (fs.statSync(sourcePath).isDirectory()) {
            zip.addLocalFolder(sourcePath, file);
          } else {
            zip.addLocalFile(sourcePath, path.dirname(file));
          }
        }
      });

      // Save the zip file to the output directory
      const outputPath = path.join(outputDir, webapp, 'webapp.zip');
      zip.writeZip(outputPath);

      console.log(`webapp '${webapp}' zipped to '${outputPath}'`);
    });

    console.log('All webapps zipped successfully.');
  });
};