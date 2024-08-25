// begin: import modules.
import { BrowserWindow, dialog, shell, Menu } from "electron";
// end: import modules.

// main menu definition
function appMenuTemplate() {
    const mainMenuTemplate = [
        {
            label: "File",
            submenu: [
                {
                    role: "quit",
                },
            ],
        },
        {
            label: "Edit",
            submenu: [
                {
                    role: "undo",
                },
                {
                    role: "redo",
                },
                {
                    type: "separator",
                },
                {
                    role: "cut",
                },
                {
                    role: "copy",
                },
                {
                    role: "paste",
                },
                {
                    role: "pasteandmatchstyle",
                },
                {
                    role: "delete",
                },
                {
                    role: "selectall",
                },
            ],
        },
        {
            label: "View",
            submenu: [
                {
                    role: "reload",
                },
                {
                    role: "forcereload",
                },
                {
                    role: "toggledevtools",
                },
                {
                    type: "separator",
                },
                {
                    role: "togglefullscreen",
                },
            ],
        },
        {
            role: "window",
            submenu: [
                {
                    role: "minimize",
                },
                {
                    role: "close",
                },
            ],
        },
        {
            label: "Help",
            submenu: [
                {
                    label: "About",
                    click() {
                        // show message box containing about info
                        dialog.showMessageBox(BrowserWindow.getFocusedWindow(), { title: "About", message: "RF Website Downloader 2024" });
                    },
                },
                {
                    label: "GitHub Account",
                    click() {
                        shell.openExternal("https://github.com/rakifsul");
                    },
                },
            ],
        },
    ];

    return mainMenuTemplate;
}

// export menu
export default async function appMenu() {
    Menu.setApplicationMenu(Menu.buildFromTemplate(appMenuTemplate()));
}
