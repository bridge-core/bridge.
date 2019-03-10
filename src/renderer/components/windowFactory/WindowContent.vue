<template>
    <!-- TEXT -->
    <pre 
        v-if="content.type == 'text' || content.type == undefined"
        :class="`${pre_color} ${content.action != undefined ? 'click-action' : ''}`"
        @click.stop="action.default"
        style="overflow-x: scroll;"
    >{{ content.text }}</pre>
    <v-subheader 
        v-else-if="content.type == 'header'"
        :color="content.color"
    >{{ content.text }}</v-subheader>
    <v-img
        v-else-if="content.type == 'img'"
        :src="content.src"
        :height="content.height"
    >
        <v-container v-if="content.content !== undefined" fill-height fluid>
            <v-layout fill-height>
                <v-flex xs12 align-end flexbox>
                    <window-content v-for="(c, i) in content.content" :content="c" :key="`img.inner_content.${i}`" />
                </v-flex>
            </v-layout>
        </v-container>
    </v-img>
    
    <!-- GENERAL -->
    <v-spacer v-else-if="content.type == 'space'"/>
    <v-divider
        v-else-if="content.type == 'divider'"
    />
    <!-- HORIZONTAL GROUPS -->
    <v-layout :align-end="!content.center" :align-center="content.center" v-else-if="content.type == 'horizontal' && Array.isArray(content.content)">
        <v-flex v-for="(c, i) in content.content" :key="`horizontal-window-content-${i}`">
            <window-content :content="c"/>
        </v-flex>
    </v-layout>
    <v-layout v-else-if="content.type == 'horizontal' && content.content">
        <v-flex>
            <window-content :content="content.content"/>
        </v-flex>
    </v-layout>
    <!-- CARDS -->
    <v-card v-else-if="content.type == 'card'">
        <v-card-title v-if="content.above_content">
            <window-content v-for="(a_c, i) in content.above_content" :key="`card-window-above-content-${i}`" :content="a_c"/>
        </v-card-title>

        <v-card-text v-if="content.content">
            <window-content v-for="(c, i) in content.content" :key="`card-window-content-${i}`" :content="c"/>
        </v-card-text>

        <v-card-action v-if="content.below_content">
            <window-content v-for="(b_c, i) in content.below_content" :key="`card-window-below-content-${i}`" :content="_bc"/>
        </v-card-action>
    </v-card>
    <!-- LOADER -->
    <v-progress-linear
        v-else-if="content.type == 'loader' && !content.is_circular"
        :color="content.color"
        indeterminate
    />
    <v-layout justify-center v-else-if="content.type == 'loader'"><v-progress-circular
        indeterminate
        :color="content.color"
    /></v-layout>

    <!-- BUTTONS -->
    <v-btn 
        v-else-if="content.type == 'button'"
        @click.stop.native="action.default"
        :color="content.color"
        :round="content.is_rounded"
        :flat="content.is_flat"
        :disabled="content.is_disabled"
    >
        {{ content.text }}
    </v-btn>
    <v-icon
        v-else-if="content.type == 'icon'"
        @click.stop.native="action.default"
        :color="content.color"
        :class="content.action != undefined ? 'click-action' : ''"
    >
        {{ content.text }}
    </v-icon>

    <!-- INPUTS -->
    <v-text-field
        v-else-if="content.type == 'input'"
        @input="action.default"
        @keydown.enter.native="action.enter"
        :color="content.color"
        :label="content.text"
        :value="content.input"
        :autofocus="content.has_focus"
    />
    <v-switch
        v-else-if="content.type == 'switch'"
        @change="action.default"
        :label="content.text"
        :color="content.color"
        value
        :input-value="content.input"
    />
    <v-select
        v-else-if="content.type == 'select'"
        :label="content.text"
        :items="content.options"
        @change="action.default"
        :color="content.color"
        :value="content.input"
        solo
    />
    <v-combobox
        v-else-if="content.type == 'combobox'"
        auto-select-first
        hide-no-data
        :label="content.text"
        :items="content.options"
        @change="action.default"
        @update:search-input="action.default"
        :value="content.input"
        :solo="content.is_box"
        :color="content.color"
    />
    <v-container style="width: 90%;" v-else-if="content.type == 'slider'">
        <v-slider
            @change="action"
            :label="content.text"
            :max="content.max"
            :min="content.min"
            thumb-label
            :color="content.color"
            :thumb-size="24"
        />
    </v-container>

    <!-- ERROR -->
    <strong v-else>Invalid UI type: "{{ content.type }}"</strong>
</template>

<script>
export default {
    name: "window-content",
    props: {
        content: Object
    },
    computed: {
        action() {
            if(typeof this.internal_action == "object") {
                let res = {};
                for(let act_key in this.internal_action) {
                    res[act_key] = this.makeFunction(this.internal_action[act_key]);
                }
                return res;
            }
            return { default: this.makeFunction(this.internal_action) };
        },
        internal_action() {
            if(typeof this.content.action == "object") {
                let a = this.content.action;
                let res = {};
                if(!a.default) {
                    if(a.click) res.default = a.click;
                    else if(a.enter) res.default = a.click;
                    else if(a.change) res.default = a.change;
                    return Object.assign(res, a);
                }
                return a;
            }
            return this.content.action;
        },
        enter() {
            if(typeof this.content.enter != "function") return () => {};
            return this.content.enter;
        },
        pre_color() {
            if(!this.content.color) return undefined;
            if(this.content.color.includes(" ")) {
                let tmp = this.content.color.split(" ");
                return `${tmp[0]}--text text--${tmp[1]}`;
            }
            return `${this.content.color}--text`;
        }
    },
    methods: {
        makeFunction(action) {
            if(typeof action != "function") return () => {};
            return action;
        }
    }
}
</script>

<style scoped>
    pre {
        font-family: 'Roboto', sans-serif;
        display: inline;
        white-space: pre-wrap;
        cursor: default;
        word-wrap: break-word;
    }
    i {
        cursor: default;
    }
    .click-action {
        cursor: pointer;
    }
</style>
