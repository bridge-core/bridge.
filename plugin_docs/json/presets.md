# Presets
### General
Presets are groups of files which can be created through the preset interface by only entering an identifier and clicking "CREATE!". They help quickly setting up new items, entities or similiar features.

### Plugin Integration
Plugins can also add new presets by providing them inside a ```<PLUGIN NAME>/presets``` folder. Create a folder per preset you want to add. Each folder should contain a manifest.json file and templates of all files your preset should create.

### Manifest Format
#### Main
| Name | Type | Description 
| --- | --- | ---
| ```display_name``` | ```String``` | Name to display inside the preset window
| ```description``` | ```String``` | Preset description
| ```icon``` | ```String``` | Icon to show inside of the preset window
| ```bp_map\|rp_map``` | ```FileFolderMap``` | JSON files to create
| ```expand_bp_files\|expand_rp_files``` | ```FileMap``` | Files to add data to
| ```copy_rp_files``` | ```SimpleFileFolderMap``` | Files to just copy over

#### ```FileFolderMap```
| Key | Value
| --- | ---
| ```String``` Path to file inside of current preset folder | ```String``` Destination folder
#### ```FileFolderMap```
| Key | Value
| --- | ---
| ```String``` Path to file inside of current preset folder | ```String``` Full destination file path
#### ```FileFolderMap```
| Key | Value
| --- | ---
| ```String``` Path to file inside of current preset folder | ```String``` Destination folder

### Manifest Example
```javascript
{
    "display_name": "Humanoid",
    "description": "Creates a new humanoid entity.",
    "icon": "mdi-human",

    "bp_map": {
        "entity.json": "entities/",
        "loot_table.json": "loot_tables/entities/",
        "spawn_rule.json": "spawn_rules/"
    },
    "rp_map": {
        "client_entity.json": "entity/"
    },
    "expand_rp_files": {
        "item_texture.json": "textures/item_texture.json"
    },
    "copy_rp_files": {
        "icon.png": "textures/items/",
        "texture.png": "textures/entity/"
    }
}
```

### File Syntax
Files which are defined inside of a ```FileMap``` or a ```FileFolderMap``` have access to the following variables:

| Name | Description
| --- | ---
| ```IDENTIFIER``` | Identifier the user entered (does not include prefix)
| ```PROJ_PREFIX``` | Prefix/Namespace of the current project

Variables can be referenced by using them inside of two curly brackets: ```{{VARIABLE}}```. bridge. automatically replaces variables with the current corresponding variable value.

### Variable Example
```javascript
{
  "texture_data": {
    "{{IDENTIFIER}}": {
      "textures": [ "textures/items/{{IDENTIFIER}}" ]
    }
  }
}
```


#### More Examples: [```static/presets```](https://github.com/solvedDev/bridge./tree/master/static/presets)