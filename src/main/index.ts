/* eslint-disable no-console */
import { ipcMain, app } from 'electron';

import Application from './core/Application';
import EditorSettings from './core/EditorSettings';
import initializeGlobal from './core/config';
import loadRecentProjects from './project/loadRecentProjects';
import initializeProject from './events/ProjectAPI';
import initializeDialogs from './events/DialogsAPI';

if (__PURPUR_DEV__) {
  // Logger.log(
  //   `Directory: ${__dirname}. Port: ${process.env.ELECTRON_WEBPACK_WDS_PORT}`
  // );
  // const sourceMapSupport = require('source-map-support'); // eslint-disable-line
  // sourceMapSupport.install({
  //   environment: 'node',
  // });
}

initializeGlobal();

const settings = EditorSettings.load();
const AppControl = new Application(settings);

app.once('ready', () => {
  AppControl.initialize();

  initializeProject(AppControl);
  initializeDialogs(AppControl);

  const initPromise = AppControl.startLauncher();
  const loaderPromise = loadRecentProjects(settings.recentProjects);

  Promise.all([initPromise, loaderPromise]).then((result) => {
    const projects = result[1];
    const win = result[0];
    // for some reason HMR, some middleware or anything else is blocking the first render
    // we force to reload the web contents:
    if (__PURPUR_DEV__) {
      win.webContents.reload();
    }
    win.webContents.on(
      'console-message',
      (
        _event: Electron.IpcMainEvent,
        level: number,
        message: string,
        line: number,
        sourceId: string
      ) => {
        let msg = '[WINDOW]';
        let fn = console.log;
        if (level >= 3) {
          msg += ' [ERROR]';
          fn = console.error;
        } else {
          msg += ' [LOG]';
        }
        msg = `${msg} ${message}\nat ${line} from ${sourceId}\n`;
        fn(msg);
      }
    );

    ipcMain.on('@renderer/show', () => {
      win.show();
      win.focus();
      win.webContents.openDevTools({ mode: 'undocked' });
    });

    ipcMain.handle('@renderer/ready', (event: Electron.IpcMainEvent) => {
      return projects;
    });
  });
});
