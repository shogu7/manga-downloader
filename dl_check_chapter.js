const fs = require('fs');
const path = require('path');

const baseDir = 'Directories of your folder';

function checkFolders() {
  try {
    const files = fs.readdirSync(baseDir);
    const j = 170;

    let missingFolders = [];
    for (let i = 1; i <= j; i++) {
      const folderPath = path.join(baseDir, i.toString());
      
      if (!files.includes(i.toString())) {
        missingFolders.push(i);
      }
    }

    if (missingFolders.length === 0) {
      console.log(`All ${j} folders are present.`);
    } else {
      console.log(`The following folders are missing: ${missingFolders.join(', ')}`);
    }

  } catch (err) {
    console.error('Error while checking the folders:', err);
  }
}

checkFolders();

// Checks that the specified folder contains the correct number of subfolders.
