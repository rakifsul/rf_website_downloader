import { ipcMain, dialog } from "electron";
import isDev from "electron-is-dev";

// setup is a handler wrapper
export default async function appService(store, scraperCore) {
    //
    ipcMain.handle("store-set", async (event, args) => {
        let ret = await store.set(args.key, args.value);
        return ret;
    });

    //
    ipcMain.handle("store-get", async (event, args) => {
        let ret = await store.get(args.key);
        return ret;
    });

    // untuk dialog box dengan jenis message box.
    ipcMain.handle("dialog-show-message-box", async (event, args) => {
        let ret = await dialog.showMessageBox(args);
        return ret;
    });

    // untuk dialog box dengan jenis open dialog.
    ipcMain.handle("dialog-show-open-dialog", async (event, args) => {
        let ret = await dialog.showOpenDialog(args);
        return ret;
    });

    // untuk dialog box dengan jenis save dialog.
    ipcMain.handle("dialog-show-save-dialog", async (event, args) => {
        let ret = await dialog.showSaveDialog(args);
        return ret;
    });

    //
    ipcMain.handle("start-scraping", async (event, args) => {
        scraperCore.setScrapeArgs(args);

        try {
            await scraperCore.start();
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }

        return true;
    });

    //
    ipcMain.handle("stop-scraping", async (event, args) => {
        await scraperCore.stop();
        return true;
    });

    //
    ipcMain.handle("is-dev", async (event, args) => {
        let ret = isDev;
        return ret;
    });
}
