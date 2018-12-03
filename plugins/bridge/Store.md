## Bridge.Store
The ```Bridge.Store``` module allows you to permanently store data inside a file. 
Files you save land inside the "bridge/plugin_storage" folder.

### Bridge.Store.save(```name```, ```data```, ```cb```)
Asynchronously saves data inside a file.

| Argument | Type | Description
| --- | --- | ---
| name | ```String``` | File name
| data | ```String``` | Data to store inside the file
| cb | ```Function``` | Function to call on completion. The function receives an ```error``` string as its argument

### Bridge.Store.load(```name```, ```cb```)
Asynchronously loads data of a file.

| Argument | Type | Description
| --- | --- | ---
| name | ```String``` | File name
| cb | ```Function``` | Function to call on completion. The function receives an ```error``` string and the file ````data``` as its arguments
