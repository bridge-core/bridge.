import { app, BrowserWindow, ipcMain, Menu } from "electron";
import "./communicator.js";
import "./Discord";

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path").join(__dirname, "/static").replace(/\\/g, "\\\\")
}

let mainWindow, loadingWindow, windowOptions = {
  height: 600,
  useContentSize: true,
  width: 1000,
  frame: false,
  minWidth: 900,
  minHeight: 600,
  show: false
};
const winURL = process.env.NODE_ENV === "development"
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`;

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow(windowOptions);

  mainWindow.loadURL(winURL);

  mainWindow.on("closed", () => {
    mainWindow = null;
    if(loadingWindow) {
      loadingWindow.close();
    }
  });

  mainWindow.webContents.on("did-finish-load", () => {
    if(loadingWindow) {
      mainWindow.setPosition(...loadingWindow.getPosition());
      // mainWindow.toggleDevTools();
      loadingWindow.close();
      mainWindow.show();
    }
  });

  if(process.env.NODE_ENV === "development") mainWindow.setMenu(Menu.buildFromTemplate([
    {
      label: "View",
      submenu: [
        { role: "reload" }
      ]
    }
  ]));
  if(process.env.NODE_ENV !== "development") mainWindow.setMenu(null);
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

  loadingWindow.on("closed", () => {
    loadingWindow = null;
  });

  loadingWindow.webContents.on("did-finish-load", () => {
    loadingWindow.show();
    if(process.argv[1]) openFile(process.argv[1]);
  });
}

function openFile(file) {
  mainWindow.webContents.send("openFile", file)
}

const quit = app.makeSingleInstance((argv) => {
  // Someone tried to run a second instance, we should focus our window.
  if(loadingWindow) {
    if(loadingWindow.isMinimized()) loadingWindow.restore();
    loadingWindow.focus();
  } else if(mainWindow) {
    if(mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }

  console.log(argv);
  openFile(argv[1]);
});

if (quit && process.argv.length >= 2 && process.env.NODE_ENV !== "development") {
  app.quit();
} else {
  app.on("ready", () => {
    createWindow();
    createSplashScreen();
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("toggleDevTools", function() { mainWindow.toggleDevTools(); });

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from "electron-updater"

autoUpdater.on("update-downloaded", () => {
  autoUpdater.quitAndInstall()
})

app.on("ready", () => {
  if (process.env.NODE_ENV === "production") autoUpdater.checkForUpdates()
})
 */
