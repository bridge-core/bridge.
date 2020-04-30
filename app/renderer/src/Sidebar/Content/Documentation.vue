<template>
	<v-container :style="`max-height: ${sidebar_height}px;`">
		<!-- <v-subheader>Project "{{ project }}"</v-subheader>
        <v-container :style="`max-height: ${sidebar_height}px;`">
            <template v-for="(doc, i) in project_docs">
                <v-btn
                    :key="`btn.${i}`"
                    @click.stop="getAction(doc)"
                    class="font-weight-light"
                    block
                    text
                >
                    <span>{{ doc }}</span>
                    <v-spacer/>
                    <v-icon>mdi-chevron-right</v-icon>
                </v-btn>

                <v-divider
                    v-if="i + 1 < project_docs.length"
                    :key="`divider.${i}`"
                />
            </template>
        </v-container> -->

		<v-subheader style="/*margin-top: 32px;*/">Minecraft</v-subheader>
		<v-container>
			<template v-for="(doc, i) in doc_list">
				<v-btn
					:key="`btn.${i}`"
					@click.stop="openDoc(doc)"
					class="font-weight-light"
					block
					text
				>
					<span>{{ doc }}</span>
					<v-spacer />
					<v-icon>mdi-chevron-right</v-icon>
				</v-btn>

				<v-divider
					v-if="i + 1 < doc_list.length"
					:key="`divider.${i}`"
				/>
			</template>
		</v-container>

		<v-subheader style="/*margin-top: 32px;*/">bridge.</v-subheader>
		<v-container>
			<template v-for="([name, link], i) in bridge_docs">
				<v-btn
					:key="`btn.${i}`"
					@click.stop="openLink(link)"
					class="font-weight-light"
					block
					text
				>
					<span>{{ name }}</span>
					<v-spacer />
					<v-icon>mdi-chevron-right</v-icon>
				</v-btn>

				<v-divider
					v-if="i + 1 < bridge_docs.length"
					:key="`divider.${i}`"
				/>
			</template>
		</v-container>
	</v-container>
</template>

<script>
import { DOC_LIST, DOC_URL, CURRENT } from '../../../src/constants'
import { shell } from 'electron'
import TagDocumentation from '../../../windows/Documentation/Tag.ts'

export default {
	name: 'content-documentation',
	created() {
		window.addEventListener('resize', this.onResize)
	},
	destroyed() {
		window.removeEventListener('resize', this.onResize)
	},
	data() {
		return {
			sidebar_height: window.innerHeight - 140,
			bridge_docs: [
				[
					'Custom Commands',
					'https://github.com/bridge-core/bridge./blob/master/plugin_docs/custom_commands.md',
				],
				[
					'Custom Components',
					'https://github.com/bridge-core/bridge./blob/master/plugin_docs/custom_components.md',
				],
			],
		}
	},
	computed: {
		doc_list() {
			return DOC_LIST
		},
		project_docs() {
			return ['Components', 'TAGS']
		},
		project() {
			return CURRENT.PROJECT
		},
	},
	methods: {
		onResize() {
			this.sidebar_height = window.innerHeight - 140
		},

		openDoc(doc) {
			shell.openExternal(`${DOC_URL}${encodeURI(doc)}`)
		},
		openLink(l) {
			shell.openExternal(l)
		},
		getAction(doc) {
			if (doc === 'TAGS') new TagDocumentation()
		},
	},
}
</script>

<style scoped>
div.container {
	padding: 4px;
	overflow-y: auto;
}

.v-btn {
	margin: 0;
}
.first {
	padding-left: 0.1em;
}
</style>
