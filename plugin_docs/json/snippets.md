# Snippets
### General
Snippets are templates which can be quickly imported via pressing ```Ctrl + Q``` and then choosing a snippet from a dialog. Users can create new snippets through an UI in the settings dialog. Snippets are file type specific, users get different snippets in the snippet dialog depending on the currently opened file.

### Plugin Integration
Plugins can also add new snippets by providing them inside a ```<PLUGIN NAME>/snippets``` folder. Create a JSON file per snippet you want to add. The specific file names don't matter.

### Format
#### Main
| Name | Type | Description 
| --- | --- | ---
| ```file_type``` | ```String``` | The [file type](https://github.com/solvedDev/bridge./blob/master/plugin_docs/other/default_file_types.md) to add this snippet to
| ```display_name``` | ```String``` | Name to display inside the snippet dialog
| ```template``` | ```Object<SnippetTemplate>``` | Snippet template definition

#### SnippetTemplate
| Name | Type | Description 
| --- | --- | ---
| ```data_path``` | ```String``` | The default path to add the template to
| ```force_default_scope``` | ```Boolean``` | Whether to enforce usage of the default path
| ```data``` | ```Object|String``` | Snippet data

### Example

```javascript
{
    "file_type": "entity",
    "display_name": "Entity Description",
    "template": {
        "data_path": "minecraft:entity",
        "force_default_scope": true,
        "data": {
            "description": {
                "identifier": {},
                "runtime_identifier": {},
                "is_spawnable": true,
                "is_summonable": true,
                "is_experimental": false
            }
        }
    }
}
```
#### More Examples: [```static/snippets```](https://github.com/solvedDev/bridge./tree/master/static/snippets)

Please note that the internal format linked above loads snippets as an array and therefor only one JSON file per file type exists. You will have to add the ```file_type``` attribute if you copy from these files and create a new file per array index.