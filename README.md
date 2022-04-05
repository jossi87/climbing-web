// How to run the project
// requirements : Yarn, Npm

// Yarn installation: 
1. Go to https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable and follow the installation process.
2. In the workspace folder, open cmd line and just run "yarn" and it will install all dependencies for the dev environment.
3.a Run "yarn dev" to start the dev server
3.b Run "yarn build" to build the project for production.

// NOTE: While installing new dependecies, it is necessary to use "yarn add -D" if its a dev dependency or just "yarn add" if its not. 
    Do not use npm install, this will create a new package-lock.json which will interfere with the yarn.lock.
