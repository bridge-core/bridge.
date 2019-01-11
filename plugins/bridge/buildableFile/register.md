#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.BuildableFile.register(file_def)
Bridge.BuildableFile.register(file_def) registers a new buildable file type inside the file creation menu of bridge.

### ```Window``` Object
| Key | Type | Description
| --- | --- | ---
| options | ```Object<BuildableFileOptions>``` | General definitions of a buildable file
| sidebar_element | ```Object<SidebarElement>``` | Definition of the sidebar element
| templates | ```Array<Template>``` | (optional) Array containing available templates of your buildable file


### ```BuildableFileOptions``` Object
The ```BuildableFileOptions``` provides general information on how a file should be build by bridge.

| Key | Type | Description
| --- | --- | ---
| display_name | ```String``` | Name of your file type
| extension | ```String``` | File extension
| path | ```String``` | (optional) Default path of the file (root: behavior pack); e.g. "entities/" would create the file inside the "entities" folder

### ```SidebarElement``` Object
Information about the ```SidebarElement``` object can be found [here](https://github.com/solvedDev/bridge./blob/master/plugins/bridge/general/sidebar_element.md). Defining an opacity and action has no effect since both get overwritten with default values to make the ```SidebarElement``` function correctly.

### ```Template``` Object
A ```Template``` object has exactly two attributes: ```display_name``` and ```content```. A registered template appears inside the template dropdown.

| Key | Type | Description
| --- | --- | ---
| display_name | ```String``` | Name of the template
| content | ```Object\|String``` | Template content


### Example
```javascript
Bridge.BuildableFile.register({
	options: {
	    display_name: "Tag",
	    extension: "json",
	    path: "tags/"
	},
  	sidebar_element: {
	    icon: "mdi-tag",
	    title: "Tag"
	},
  	templates: [{
    	    display_name: "Empty Tag",
      	    content: {
                "include": [ "minecraft:cow", "minecraft:pig" ],
                "minecraft:entity": {
                    "import": [ "entities/modules/passive_common.json" ],
                    "components": {
                        "minecraft:type_family": {
                            "family": [ "passive" ]
                        }
                    }
                },
                "run_commands": {

                }
      	    }
        }]
});
```
