import { request } from "http";
import { writeFile, access } from "fs";
import { browser_window } from "../constants";
import { get } from "https";
import { promisify } from 'util'
import { Buffer } from "buffer";
import { remove } from "fs-extra";


export function startListening () {
      window.addEventListener("online", listener);
}

export function listener (this: Window, ev: Event) {
      
}

export async function downloadFile(file_url: string, path: string) {
      // create the objects/pointers we need
      let received_bytes = 0;
      let total_bytes = 0;
      access(path, err => {
            if(err){}
            else remove(path);
      })
      let req = await get(file_url);
      req.on('response', data => {
            total_bytes = Number(data.headers["content-length"]);
            let buf = Buffer.alloc(total_bytes).write(data.read(data.readableLength));
            print(total_bytes)
            writeFile(path, buf, undefined);
      });
      function print(txt: any) {console.log(txt);}

      /*//inside a try for closing the connection and the file stream in case of an error
      try {
            req.on('response', (data) => {
                  // Change the total bytes value to get progress later.
                  total_bytes = parseInt(data.headers['content-length']);
                  
            });

            req.on('data', function (chunk) {
                  // Update the received bytes
                  received_bytes += chunk.length;
                  
                  let percentage = (received_bytes * 100) / total_bytes;
                  browser_window.setProgressBar(percentage / 100);
                  console.log(percentage + "% | " + received_bytes + " bytes out of " + total_bytes + " bytes.");
            });

            req.on('end', function () {
                  //just to be sure that the stream is closed
                  try {out.close();}catch(e){}
                  console.log("File succesfully downloaded");
            });
      }
      catch(e) {
            out.close();
            req.abort();
      }*/
}