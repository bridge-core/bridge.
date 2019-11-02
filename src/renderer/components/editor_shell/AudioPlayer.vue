<template>
    <v-container style="margin-top: 20%;">
        <audio :src="src" ref="audio"/>
        
        <v-layout horizontal align-center>
            <v-btn @click="$refs.audio.play()"><v-icon>mdi-play</v-icon></v-btn>
            <v-btn @click="$refs.audio.pause()"><v-icon>mdi-pause</v-icon></v-btn>
            <v-progress-circular
                :rotate="-90"
                :size="100"
                :width="4"
                :value="currentTime / duration * 100"
                color="primary"
            />
            <v-btn @click="() => toggleMute()">
                <v-icon v-if="is_muted">mdi-volume-mute</v-icon>
                <v-icon v-else>mdi-volume-plus</v-icon>
            </v-btn>
            <v-slider v-model="volume_wrapper" :color="is_muted ? 'error' : 'success'" :min="0" :max="1" :step="0.01"/>
        </v-layout>
        
    </v-container>
</template>

<script>
    export default {
        name: "audio-player",
        props: {
            src: String
        },
        mounted() {
            this.player = this.$refs.audio || {};
            requestAnimationFrame(this.updateTime);
        },
        destroyed() {
            this.requestAnim = false;
        },
        data() {
            return {
                player: {},
                is_muted: false,
                currentTime: 0,
                duration: 1,
                requestAnim: true,
                volume: 1,
            }
        },
        computed: {
            volume_wrapper: {
                set(val) {
                    this.toggleMute(false);
                    this.volume = val;
                },
                get() {
                    return this.volume;
                }
            }
        },
        methods: {
            toggleMute(force=!this.is_muted) {
                this.is_muted = force;
                this.player.muted = this.is_muted;
            },
            updateTime() {
                this.currentTime = this.player.currentTime;
                this.duration = this.player.duration;
                this.player.volume = this.volume;

                if(this.requestAnim)
                    setTimeout(() => requestAnimationFrame(this.updateTime), 200);
            }
        }
    }
</script>
