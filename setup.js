const readline = require('readline');
const fs = require('fs');

const { exec } = require('child_process');
// const exec = require('child_process').exec;

const packageJSON = require('./package');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const properName = name => name.toLowerCase().replace(/ +/g, '-');

const installPackages = async () => {
  console.log();
  console.log('Running "npm install" to setup project...');
  return new Promise((resolve, reject) => {
    exec('npm install', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log('"npm install" ran successfully.');
      resolve();
    });
  });
}

const deletePackageLock = () => {
  return new Promise((resolve, reject) => {
    console.log();
    const pathToFile = 'package-lock.json';
    if (fs.existsSync(pathToFile)) {
      fs.unlink(pathToFile, function(err) {
        if (err) {
          console.log('package-lock.json deleting failed, do it manually.');
        } else {
          console.log(`${pathToFile} deleted successfully.`)
          deleteNodeModules(resolve);
        }
      });
    } else {
      console.log(`${pathToFile} does not exist`);
      deleteNodeModules(resolve);
    }
  });
};

const deleteNodeModules = async (resolve) => {
  const pathToFolder = 'node_modules';
  if (fs.existsSync(pathToFolder)) {
    await deleteFolder(pathToFolder);
  } else {
    console.log(`${pathToFolder} does not exist`);
  }
  resolve();
};


const deleteFolder = (dir) => {
  return new Promise((resolve, reject) => {
    // delete directory recursively
    fs.rmdir(dir, { recursive: true }, (err) => {
      if (err) {
        console.log(`${dir} folder failed to be deleted, do it later manually.`);
        reject();
      } else {
        console.log(`${dir} folder deleted successfully.`);
        resolve();
      }
    });
  });
};

const rewritePackageJson = () => {
  return new Promise((resolve, reject) => {
    fs.writeFileSync('package.json', JSON.stringify(packageJSON));
    resolve();
  });
};

const validateName = resolve => {
  rl.question('Project Name: ', (answer) => {
    if(answer){
      packageJSON.name = properName(answer);
      resolve();
    } else {
      console.log('Project name cannot be empty!');
      validateName(resolve);
    }
  });
}

const setName = () => new Promise((resolve, reject) => validateName(resolve));

const setDescription = () => {
  return new Promise((resolve, reject) => {
    rl.question('Description: ', (answer) => {
      if(answer) {
        packageJSON.description = answer;
      } else {
        console.log("Package Description didn't change!");
      }
      resolve();
    });
  });
};

const setAuthor = () => {
  return new Promise((resolve, reject) => {
    rl.question('Author: ', (answer) => {
      if(answer) {
        packageJSON.author = answer;
      } else {
        console.log("Author name didn't change!");
      }
      resolve();
    });
  });
};

let confirmed = false;
const confirmation = () => {
  return new Promise((resolve, reject) => {
    console.log(packageJSON);
    rl.question('Is this OK? (yes) ', (answer) => {
      if(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y' || answer.toLowerCase() === '') {
        confirmed = true;
      }
      resolve();
    });
  });
};


const gitDeleteConfirmation = async () => {
  console.log();
  return new Promise((resolve, reject) => {
    const gitFolderPath = '.git';
    rl.question(`Do you also want to delete ${gitFolderPath} folder? (yes) `, (answer) => {
      if(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y' || answer.toLowerCase() === '') {
        deleteFolder(gitFolderPath);
      } else {
        console.log(`${gitFolderPath} folder is not deleted, do it later manually.`);
      }
      console.log();
      console.log('Project Setup Complete! Feel free to delete setup.js');
      resolve();
    });
  });
};


const setup = async () => {
  await setName();
  await setDescription();
  await setAuthor();
  await confirmation();
  if(!confirmed) {
    console.log('Aborted! Project setup incomplete, try again later.')
  } else {
    await deletePackageLock();
    await rewritePackageJson();
    await installPackages();
    await gitDeleteConfirmation();
  }
  rl.close();
};

setup();