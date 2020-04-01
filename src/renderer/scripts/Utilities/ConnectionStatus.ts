import { request } from "http";
import { writeFile, access } from "fs";
import fs from "fs"
import { browser_window } from "../constants";
import { promisify } from 'util'
import { Buffer } from "buffer";
import { remove } from "fs-extra";
import { DownloadItem, webContents, session } from "electron";


export function startListening () {
      window.addEventListener("online", listener);
}

export function listener (this: Window, ev: Event) {
      
}

export async function downloadFile(file_url: string, path: string) {
      try {
            let contents = browser_window.webContents;
            contents.downloadURL(file_url)
            contents.session.on("will-download", (event, item, webContents) =>{
                  event.preventDefault();
                  // Set the save path, making Electron not to prompt a save dialog.
                  path = path + item.getFilename();
                  print(path)
                  item.savePath = path;
                  item.setSavePath(path)
                  
                  browser_window.setProgressBar(0);
                  let total = item.getTotalBytes(), filename = item.getFilename();
                  item.on('updated', (event, state) => {
                        if (state === 'progressing') {
                              if (item.isPaused()) {
                                    if(item.canResume()) item.resume();
                              } else {
                                    if (total != 0) {
                                          let percentage = (item.getReceivedBytes() * 100) / total;
                                          browser_window.setProgressBar(percentage);
                                    }
                                    console.log(`Received bytes: ${item.getReceivedBytes()}`);
                              }
                        }
                  });
                  item.once('done', (event, state) => {
                        if (state === 'completed') {
                              return filename;
                        } else {
                              throw new Error(`${state}`);
                        }
                  });
            });
      }
      catch(e) {
            print(e);
      }
      
}
function print(txt: any) { console.log(txt)};