# @bridge/fetch-definition

Grants access to the lightning cache database

### `fetchDefinition(fileType: string, fetchDefs: string[], fetchSearch: string, fetchAll = false): Promise<string[]>`

Search through the definitions `fetchDefs` in `fileType` files for `fetchSearch`. Available definitions can be found by browsing the lightning cache files [here](https://github.com/bridge-core/bridge./tree/master/static/lightning_cache). Valid built-in file types are listed [here](https://github.com/bridge-core/bridge./blob/master/plugin_docs/other/default_file_types.md).

#### Example:

```json
[{ "key": "ids", "path": "animations" }]
```

(From the animation.json file)

Here you could search for animation identifiers by using the `fetchDefs` argument `["ids"]`:

```javascript
const { fetchDefinition } = await require('@bridge/fetch-definition')

const walkAnimations = await fetchDefinition(
	'animation',
	['ids'],
	'animation.walk',
	false
)

// With fetchAll=true you still get a string[] even though it only has one entry
// => Consistency
const walkAnimation = walkAnimations[0]
```
