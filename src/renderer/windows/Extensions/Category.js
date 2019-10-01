export default class Category {
    constructor(category_name, on_view) {
        this.type = "card";
        this.is_tiled = true;
        this.elevation = 0;
        this.below_content = [
            {
                text: category_name
            },
            {
                type: "space"
            },
            {
                type: "icon-button",
                text: "mdi-chevron-right",
                color: "primary",
                only_icon: true,
                action: on_view
            }
        ];
    }
}