export default [
    {
        id: "entity_tag",
        includes: "tags/",
        file_viewer: "json",

        start_state: "tag/main",
        lightning_cache: "tag",
        highlighter: "entity",
        file_creator: "tag",
        snippets: "entity"
    }
];