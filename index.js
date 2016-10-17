const { app, BrowserWindow, ipcMain } = require('electron')
const cp = require('child_process');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/index.html`)

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('get-random-number', event => {
  console.log('Getting random number…');

  getRandomNumber((error, number) => {
    if (error) {
      console.log(error);
      event.sender.send('error', error.message);
    } else {
      console.log(`Got random number: ${number}`);
      event.sender.send('set-random-number', number);
    }
  });
});

function getRandomNumber(callback) {
  const spawn = cp.spawn('python', ['exe-me.py'], {
    cwd: __dirname,
  });
  let stdout = '';
  let called = false;


  function doCallback(error, response) {
    if (!called) {
      called = true;
      callback.apply(null, error ? [error] : [null, response]);
    }
  }

  spawn.stdout.on('data', data => {
    stdout += data.toString();
  });
  spawn.on('error', error => {
    doCallback(error);
  });
  spawn.on('close', code => {
    if (code) {
      doCallback(new Error(`Exited with code ${code}`));
    } else {
      doCallback(null, stdout);
    }
  });
}

