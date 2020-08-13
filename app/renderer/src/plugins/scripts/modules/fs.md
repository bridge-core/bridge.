# @bridge/fs

Module that allows plugins to interact with the user's file system.

## Node FS Module

This module exposes all functions Node's `fs.promises` module provides. You can read its documentation [here](https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_fs_promises_api).

## Additional Functions

### `writeJSON(filePath: string, data: any, beautify = false, fileVersion?: number): Promise<void>`

Write a JavaScript object to a file.

### `readJSON(filePath: string): Promise<any>`

Read a file as JSON and return the equivalent JavaScript object.
