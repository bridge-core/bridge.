import SETTINGS from "../../store/Settings";
import UpdateWindow from "../../windows/UpdateApp";
import Notification from "../Notification";
import DiscordWindow from "../../windows/Discord";
import { shell } from 'electron';
import fetchLatestVersion from "./latestVersion";

export default async function startUp() {
    SETTINGS.setup();

    let discord_msg = new Notification({
      display_icon: "mdi-discord",
      display_name: "Discord Server",
      color: "#7289DA",
      text_color: "white",
      action: () => {
            new DiscordWindow(
                () => {
                    shell.openExternal("https://discord.gg/jj2PmqU");
                },
                () => {
                    discord_msg.remove();
                }
            );
      }
    })
    discord_msg.send();

    let { update_available, latest_version } = await fetchLatestVersion();

    let update_msg = new Notification({
        display_icon: "mdi-update",
        display_name: "Update Available",
        text_color: "white",
        action: () => {
            new UpdateWindow(latest_version);
        }
    })
    if(update_available) update_msg.send();
}