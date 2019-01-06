#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.open(file)
Bridge.open(file) opens the file given as an argument inside bride.

### File Object
| Key | Type | Description
| --- | --- | ---
| content | ```String``` | Content of the file to open
| file_name | ```String``` | Name of the file to open
| path | ```String``` | Path of the file to open (relative to the behavior pack root)

### Example
```javascript
Bridge.open({
    content: "Hello World!",
    file_name: "my_file.txt",
    path: "entities/my_file.txt"
});
```
