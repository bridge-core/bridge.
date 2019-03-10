import DRP from "discord-rich-presence";
const client = DRP("554245594332528651");
import APP_VERSION from "../renderer/scripts/constants/app_version";

client.updatePresence({
    state: process.env.NODE_ENV === "development" ? "Developing new features..." : "Coding add-ons...",
    details: "A powerful add-on editor",
    startTimestamp: Date.now(),
    largeImageKey: "big_icon",
    largeImageText: "bridge. | " + APP_VERSION,
    instance: true,
});