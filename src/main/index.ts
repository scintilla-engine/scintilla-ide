import { ipcMain, app } from 'electron';

import Application from './core/Application';
import EditorSettings from './core/EditorSettings';
import { initializeGlobal } from './core/config';
import { loadRecentProjects } from './project/projectValidation';

if (process.env.NODE_ENV === 'development') {
  console.log(__dirname);
  const sourceMapSupport = require('source-map-support'); // eslint-disable-line
  sourceMapSupport.install({
    environment: 'node',
  });
}

initializeGlobal();

const settings = EditorSettings.load();

const AppControl = new Application(settings);

app.once('ready', () => {

  AppControl.initialize();

  // function a() {
  //   const e = new Error();
  //   const trace = stackTrace.parse(e);
  //   console.log(e);
  // }

  // a();

  const initPromise = AppControl.startLauncher();
  const loaderPromise = loadRecentProjects(settings.recentProjects);

  Promise.all([initPromise, loaderPromise]).then((result) => {

    const projects = result[1];
    ipcMain.on('launcher_loaded', (event: Electron.IpcMainEvent) => {
      event.sender.send('projects-loaded', projects);
    });
  });

});
/*const initPromise = AppControl.initialize();
const loaderPromise = ProjectManagement.loadRecentProjects(settings.recentProjects);

Promise.all([initPromise, loaderPromise]).then((result) => {

    const projects = result[1];
    ipcMain.on('launcher_loaded', (event: Electron.Event) => {
        event.sender.send('projects-loaded', projects);
    });
});*/

if (process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true') {

  // require('electron-debug')();
  // const path = require('path');
  // const p = path.join(__dirname, '..', 'app', 'node_modules');
  // require('module').globalPaths.push(p);
}

// const installExtensions = async () => {
//     const installer = require('electron-devtools-installer');
//     const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
//     const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];
//     return Promise.all(
//         extensions.map(name => installer.default(installer[name], forceDownload))
//     ).catch(console.log);
// };