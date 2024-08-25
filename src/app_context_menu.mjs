import { Menu, MenuItem } from "electron";

export default async function appContextMenu(webContents) {
    webContents.on(
        "context-menu",
        (event, props) => {
            event.preventDefault();
            let menu = new Menu();
            menu.append(new MenuItem({ role: "undo" }));
            menu.append(new MenuItem({ role: "redo" }));
            menu.append(new MenuItem({ type: "separator" }));
            menu.append(new MenuItem({ role: "cut" }));
            menu.append(new MenuItem({ role: "copy" }));
            menu.append(new MenuItem({ role: "paste" }));
            menu.append(new MenuItem({ role: "pasteandmatchstyle" }));
            menu.append(new MenuItem({ type: "separator" }));
            menu.append(new MenuItem({ role: "delete" }));
            menu.append(new MenuItem({ role: "selectall" }));
            menu.popup(webContents);
        },
        false
    );
}
