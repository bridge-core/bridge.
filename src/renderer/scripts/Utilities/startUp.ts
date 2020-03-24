import SETTINGS from "../../store/Settings";
import UpdateWindow from "../../windows/NewUpdateWindow";
import Notification from "../Notification";
import DiscordWindow from "../../windows/Discord";
import { shell } from 'electron';
import fetchLatestJson from "./FetchLatestJson";
import { startListening } from "./ConnectionStatus";

export default async function startUp() {
	SETTINGS.setup()

    startListening()

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

    let update_data = await fetchLatestJson();

    let update_msg = new Notification({
        display_icon: "mdi-update",
        display_name: "Update Available",
        text_color: "white",
        action: () => {
            new UpdateWindow(update_data);
        }
    })
    if(true) update_msg.send();
}
