import { request } from "http";
import { writeFile, access } from "fs";
import { promises as fs } from "fs"
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
      try {
            let req = await get(file_url);
            await req.on('response', async (data) => {
                  total_bytes = Number(data.headers["content-length"]);
                  let buf = Buffer.alloc(total_bytes).write(data.read(data.readableLength));
                  print(total_bytes);
                  while(!req.writable){}
                  await fs.writeFile(path, buf, undefined);
            });
      }
      catch(e) {
            print(e);
      }
      
}
function print(txt: any) { console.log(txt)};