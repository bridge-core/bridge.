import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import Communicator from "./communicator.js";

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, loadingWindow, windowOptions = {
  height: 563,
  useContentSize: true,
  width: 1000,
  frame: false,
  minWidth: 600,
  minHeight: 350,
  show: false
};
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow(windowOptions);

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();

    if(loadingWindow) {
      mainWindow.setPosition(...loadingWindow.getPosition());
      loadingWindow.close();
    }
  });

  const menu_template = [
    {
      label: 'View',
      submenu: [
        {role: 'reload'}
      ]
    }
  ];
  mainWindow.setMenu(Menu.buildFromTemplate(menu_template));
}

function createSplashScreen() {
  loadingWindow = new BrowserWindow({
    height: 300,
    useContentSize: true,
    width: 300,
    frame: false,
    resizable: false
  });

  loadingWindow.loadURL(`file://${__static}/loading.html`);

  loadingWindow.on('closed', () => {
    loadingWindow = null;
  });

  loadingWindow.webContents.on('did-finish-load', () => {
    loadingWindow.show();
  });
}

app.on('ready', () => {
  createWindow();
  createSplashScreen();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
})


/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
