import { spawn } from 'child_process';

import { ElectronEnv } from '../types';
import { Logger } from '../devLogger';
import stripFinalNewLine from '../commons/stripFinalNewLine';


export default function startElectronProcess(logger: Logger, electronEnv: ElectronEnv) {

  // eslint-disable-next-line
  const electron = require("electron").toString();
  logger.info('Starting Electron...');

  return new Promise((resolve, reject) => {

    const electronProcess = spawn(`${electron}`,
      [
        ".", "--color" //  `--inspect=5858`,
      ],
      {
        env: electronEnv,
        // stdio: ['ignore', 'inherit', 'inherit'],
        // stdio: ['ignore', 'inherit', 'inherit'],
      });

    // logger.log(`Started at ${electronEnv.ELECTRON_WEBPACK_WDS_PORT}`);

    electronProcess.on("close", (code, signal) => {
      let msg = `Exited with code ${code}`;
      if (signal) {
        msg = msg.concat(` and signal ${JSON.stringify(signal)}`)
      }
      msg = msg.concat('.');
      resolve();
    });

    electronProcess.stdout!!.on('data', (data: Buffer) => {
      logger.log(stripFinalNewLine(data.toString()));
    });

    electronProcess.stderr!!.on('data', (data: Buffer) => {
      logger.error('ERROR', data.toString());
    });

    electronProcess.on("error", (err) => {
      logger.error(`Error occurred `, err);
      reject(err)
    })

    // process.on('SIGTERM', () => {
    //   logger.log('Stopping dev server');
    //   devMiddleware.close();
    //   rendererServerResult.server.close((err) => {
    //     logger.error(`Server exited with error`, err);
    //     resolve();
    //   })
    // });

    // electronPromise.then((electron) => {
    //   return electron.default;
    // }).then((electron) => {


    // });
  });
}
