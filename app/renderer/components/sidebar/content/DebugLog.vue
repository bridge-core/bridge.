<template>
	<p v-if="logs && logs.length === 0">
		Unable to find debug log files. Make sure that you activated debug logs
		inside of your Minecraft settings.
	</p>

	<div v-else v-resize="resize">
		<v-toolbar color="expanded_sidebar" flat height="30px">
			<v-tooltip color="tooltip" bottom>
				<template v-slot:activator="{ on }">
					<v-btn
						:disabled="!logs"
						icon
						text
						@click.stop="reload"
						v-on="on"
						small
						class="toolbar-button"
					>
						<v-icon small>mdi-refresh</v-icon>
					</v-btn>
				</template>
				<span>Reload</span>
			</v-tooltip>

			<v-tooltip color="tooltip" bottom>
				<template v-slot:activator="{ on }">
					<v-btn
						:disabled="!logs"
						icon
						text
						@click.stop="openSearchBrowser"
						v-on="on"
						small
						class="toolbar-button"
					>
						<v-icon small>mdi-magnify</v-icon>
					</v-btn>
				</template>
				<span>Search</span>
			</v-tooltip>

			<v-spacer />
			<span style="font-size: 12px;" v-if="logs">
				{{ page_number / PAGE_SIZE + 1 }}/{{
					Math.ceil(logs.length / PAGE_SIZE)
				}}
			</span>
			<v-tooltip color="tooltip" bottom>
				<template v-slot:activator="{ on }">
					<v-btn
						:disabled="!logs || page_number === 0"
						icon
						text
						@click.stop="page_number -= PAGE_SIZE"
						v-on="on"
						small
						class="toolbar-button"
					>
						<v-icon small>mdi-chevron-left</v-icon>
					</v-btn>
				</template>
				<span>Previous</span>
			</v-tooltip>

			<v-tooltip color="tooltip" bottom>
				<template v-slot:activator="{ on }">
					<v-btn
						:disabled="
							!logs || page_number + PAGE_SIZE > logs.length
						"
						icon
						text
						@click.stop="page_number += PAGE_SIZE"
						v-on="on"
						small
						class="toolbar-button"
					>
						<v-icon small>mdi-chevron-right</v-icon>
					</v-btn>
				</template>
				<span>Next</span>
			</v-tooltip>
		</v-toolbar>
		<v-divider />

		<v-progress-linear v-if="logs === null" indeterminate />

		<div
			ref="log_container"
			:style="
				`height: ${sidebar_height}px; overflow-y: auto; padding: 4px;`
			"
			v-else
		>
			<v-card
				color="expanded_sidebar"
				v-for="({ tags, error }, i) in sliced_logs"
				style="margin-bottom: 8px;"
				:key="i"
			>
				<div
					:style="
						`padding: 16px 16px 8px; white-space: nowrap; overflow-x: auto;`
					"
					class="small-scrollbar"
				>
					<v-chip
						v-for="(tag, i) in tags"
						:key="i"
						:color="getTagColor(tag)"
						style="margin-right: 4px; margin-bottom: 2px;"
						small
						@click="openBrowser(tag)"
					>
						<v-icon v-if="getTagIcon(tag)" left>{{
							getTagIcon(tag)
						}}</v-icon>
						{{ tag.toUpperCase() }}
					</v-chip>
				</div>

				<v-divider />
				<v-card-text>{{ error }}</v-card-text>

				<v-divider />
				<v-card-actions>
					<v-spacer />
					<v-btn @click="parse(error)" color="primary">
						<v-icon style="margin-right: 4px;">mdi-magnify</v-icon>
						Open Files
					</v-btn>
				</v-card-actions>
			</v-card>
		</div>
	</div>
</template>

<script>
import {
	processedDebugLog,
	parseAffectedFiles,
} from '../../../scripts/Sidebar/DebugLog'
import LogListView from '../../../windows/DebugLog/ListView'
import { tag } from '../../../windows/DebugLog/Common'
import SearchDebugLogInput from '../../../windows/DebugLog/SearchInput'
const PAGE_SIZE = 30

export default {
	name: 'debug-log',
	async mounted() {
		this.logs = await processedDebugLog()
	},
	data() {
		return {
			logs: null,
			page_number: 0,
			sidebar_height: window.innerHeight - 140,
			PAGE_SIZE,
		}
	},
	computed: {
		sliced_logs() {
			if (!this.logs) return this.logs
			return this.logs.slice(
				this.page_number,
				this.page_number + PAGE_SIZE
			)
		},
	},
	methods: {
		async reload() {
			this.logs = null
			this.logs = await processedDebugLog(true)
		},
		resize({ y = 0 } = {}) {
			this.sidebar_height = (y || window.innerHeight) - 140
		},
		parse(log) {
			parseAffectedFiles(log)
		},
		openBrowser(tag) {
			new LogListView(tag)
		},
		openSearchBrowser() {
			new SearchDebugLogInput()
		},
		getTagColor(t) {
			return tag(t).color
		},
		getTagIcon(t) {
			return tag(t).icon
		},
	},
	watch: {
		page_number() {
			this.$refs.log_container.scrollTop = 0
		},
	},
}
</script>

<style scoped>
p {
	padding: 0.5em;
}
.small-scrollbar::-webkit-scrollbar {
	width: 3px;
	height: 3px;
}
</style>
