# Auto-Completions
bridge.'s auto-completions are fully data-driven with JSON files. The internal files are located inside the ```static/auto_completions``` folder. As always, it can be of great help to browse through the files to understand how the format works. This JSON format is also in use for text auto-completions but data is interpreted differently.

### Basics
In order for newly added files to get loaded, they must be added to the ```static/auto_completions/files.json``` file.

### Folder Structure
The folder in which you place a auto-completion file matters because auto-completions can access other files by referencing their path. Referencing is done by putting a "$" in front of the path.

#### Example
##### File 1: ```static/auto_completions/my_file_type/main```
```javascript
{
    "this_is_a_suggestion": "$reference.main.example"
}
```
##### File 1: ```static/auto_completions/reference/main```
```javascript
{
    "example": [ "This gets proposed as a value for the 'this_is_a_sugestion' node" ]
}
```

### File Structure
You simulate the actual structure of a file with the JSON format "bridge." uses. It may not contain arrays so you need to use the [dynamic reference](https://github.com/solvedDev/bridge./blob/master/plugin_docs/auto_completions/dynamic_references.md) ```$dynamic.list.next_index``` if you want to propose array indices. Only string arrays are valid and they are only allowed in order to define values. (See example 2)

#### Example 1 from ```static/auto_completions/recipe/main```
```javascript
{
    "format_version": "$general.format_version",
    "minecraft:recipe_furnace": {
        "description": "$recipe.general.description",
        "tags": {
            "$dynamic.list.next_index": "$recipe.general.tags"
        },
        "group": {},

        "input": "$general.item_identifier",
        "output": "$general.item_identifier"
    }
}
```

#### Example 2 from ```static/auto_completions/recipe/general```
```javascript
{
    "tags": [ "crafting_table", "furnace", "blast_furnace", "smoker", "campfire", "stonecutter" ]
}
```
