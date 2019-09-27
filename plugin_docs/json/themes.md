# Themes
### General
Themes change how bridge. looks. You are able to change all user interface elements and the syntax highlighting colors.

### Plugin Integration
Plugins can also add new themes by providing them inside a ```<PLUGIN NAME>/themes``` folder. Create a JSON file per theme you want to add. The individual file names don't matter.

### Format
#### Main
| Name | Type | Description 
| --- | --- | ---
| ```name``` | ```String``` | Name of your theme
| ```id``` | ```String``` | UUID for your theme
| ```options``` | ```Object<OptionObject>``` | Theme option definition
| ```definition``` | ```Object<ThemeDefinition>``` | Theme definition object

#### OptionObject
| Name | Type | Description 
| --- | --- | ---
| ```no_logo_display``` | ```Boolean``` | Whether to display the blue bridge. logo or simply "bridge."

#### ThemeDefinition
| Name | Type | Description 
| --- | --- | ---
| ```dark``` | ```Object<ThemeVariant>``` | Dark theme variant
| ```light``` | ```Object<ThemeVariant>``` | Light theme variant

#### ThemeVariant
| ```highlighter``` | ```Object<HighlighterDefinition>``` | The default path to add the template to
| ```primary``` | ```String``` | Color
| ```secondary``` | ```String``` | Color
| ```accent``` | ```String``` | Color
| ```error``` | ```String``` | Color
| ```info``` | ```String``` | Color
| ```success``` | ```String``` | Color
| ```warning``` | ```String``` | Color
| ```background``` | ```String``` | Color
| ```sidebar_navigation``` | ```String``` | Color
| ```expanded_sidebar``` | ```String``` | Color
| ```menu``` | ```String``` | Color
| ```toolbar``` | ```String``` | Color
| ```footer``` | ```String``` | Color
| ```tooltip``` | ```String``` | Color

#### HighlighterDefinition
| Name | Type | Description 
| --- | --- | ---
| ```property``` | ```Object<StyleObject>``` | Custom style for syntax highlighter
| ```keyword``` | ```Object<StyleObject>``` | Custom style for syntax highlighter
| ```definition``` | ```Object<StyleObject>``` | Custom style for syntax highlighter
| ```atom``` | ```Object<StyleObject>``` | Custom style for syntax highlighter
| ```number``` | ```Object<StyleObject>``` | Custom style for syntax highlighter
| ```string``` | ```Object<StyleObject>``` | Custom style for syntax highlighter
| ```variable``` | ```Object<StyleObject>``` | Custom style for syntax highlighter
| ```variable_strong``` | ```Object<StyleObject>``` | Custom style for syntax highlighter
| ```meta``` | ```Object<StyleObject>``` | Custom style for syntax highlighter
| ```comment``` | ```Object<StyleObject>``` | Custom style for syntax highlighter

#### HighlighterDefinition
| Name | Type | Description 
| --- | --- | ---
| ```color``` | ```String``` | Color
| ```text_decoration``` | ```String<underline|overline|line-through|blink>``` | Text decoration

### Example

```javascript
{
    "name": "Default",
    "id": "bridge.default.theme",
    "definition": {
        "dark": {
            "highlighter": {
                "property": { "color": "#a6e22e" },
                "keyword": { "color": "#f92672" },
                "definition": { "color": "#fd971f" },
                "atom": { "color": "#ae81ff" },
                "number": { "color": "#ae81ff" },
                "string": { "color": "#e6db74" },
                "variable": { "color": "#9effff" },
                "variable_strong": { "color": "#66d9ef" },
                "meta": { "color": "white" },
                "comment": { "color": "#75715e" }
            },
            "primary": "#1778D2",
            "secondary": "#1778D2",
            "accent": "#82B1FF",
            "error": "#FF5252",
            "info": "#2196F3",
            "success": "#4CAF50",
            "warning": "#FB8C00",
            "background": "#303030",
            "sidebar_navigation": "#424242",
            "expanded_sidebar": "#424242",
            "menu": "#424242",
            "toolbar": "#000000",
            "footer": "#212121",
            "tooltip": "#303030"
        },
        "light": {
            "highlighter": {
                "property": { "color": "black" },
                "keyword": { "color": "#5A5CAD" },
                "definition": { "text_decoration": "underline" },
                "atom": { "color": "#6C8CD5" },
                "number": { "color": "#164" },
                "string": { "color": "red" },
                "variable": { "color": "black" },
                "variable_strong": { "color": "black" },
                "meta": { "color": "yellow" },
                "comment": { "color": "#0080FF" }
            },
            "primary": "#1778D2",
            "secondary": "#1778D2",
            "accent": "#82B1FF",
            "error": "#FF5252",
            "info": "#2196F3",
            "success": "#4CAF50",
            "warning": "#FB8C00",
            "background": "#fafafa",
            "sidebar_navigation": "#FFFFFF",
            "expanded_sidebar": "#FFFFFF",
            "menu": "#FFFFFF",
            "toolbar": "#e0e0e0",
            "footer": "#f5f5f5",
            "tooltip": "#424242"
        }
    }
}
```
#### More Examples: [```static/themes```](https://github.com/solvedDev/bridge./tree/master/static/themes)