export interface FileDefinition {
    id?: string;
    includes?: string;
    file_viewer?: "json" | "text";
    rp_definition?: boolean;
    
    build_array_exceptions?: string[];
    default_build_arrays?: boolean;
    documentation?: string | FileDocumentation;
    start_state?: string;
    lightning_cache?: string;
    highlighter?: string;
    file_creator?: string | FileCreator;
    problems?: string[];
    snippets?: string;
    text_separators?: string[];
    comment_character?: string;
}

export interface FileCreator {
    [x: string]: any;
}

export interface SnippetDefinition {
    [x: string]: any;
}

export interface ProblemDefinition {
    [x: string]: any;
}

export interface FileDocumentation {
    base: string;
    inject: string;
    extend: string;
}