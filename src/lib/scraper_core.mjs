import { shell } from "electron";
import puppeteer from "puppeteer-core";
import isDev from "electron-is-dev";
import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";

// inti dari logika scraping
class ScraperCore {
    constructor(app) {
        this.proxyIsBeingUsed = false;
        this.proxyNeedAuth = false;
        this.forceStopScrapers = false;
        this.app = app;
    }

    // untuk mendapatkan path dari chrome.
    // aplikasi ini membutuhkan chrome agar bekerja.
    getDefaultChromePath() {
        const __filename = url.fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const exeDir = isDev ? path.join(__dirname, "../.." + path.sep) : path.dirname(this.app.getPath("exe"));

        let chromePath = path.join(exeDir, "chromium");
        console.log("CHROME PATH:");
        console.log(chromePath);
        return chromePath;
    }

    // untuk mendapatkan cache path.
    // cache path akan digunakan puppeteer.
    getCachePath() {
        const __filename = url.fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const exeDir = isDev ? path.join(__dirname, "../.." + path.sep) : path.dirname(this.app.getPath("exe"));

        let cachePath = path.join(exeDir, "data_chromium");
        return cachePath;
    }

    // untuk memastikan bahwa chrome telah terinstall.
    checkChrome() {
        try {
            if (fs.existsSync(this.getDefaultChromePath())) {
                return true;
            }
            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // callback untuk scrape dimulai
    setOnScrapeStartedCallback(onScrapeStartedCallback) {
        this.onScrapeStartedCallback = onScrapeStartedCallback;
    }

    // callback untuk scrape dihentikan
    setOnScrapeStoppedCallback(onScrapeStoppedCallback) {
        this.onScrapeStoppedCallback = onScrapeStoppedCallback;
    }

    // callback untuk scrape berjalan
    setOnScrapeProgressCallback(onScrapeProgressCallback) {
        this.onScrapeProgressCallback = onScrapeProgressCallback;
    }

    // callback untuk scraper menemukan content yang bukan html
    setOnScrapeNonHTMLFoundCallback(onScrapeNonHTMLFoundCallback) {
        this.onScrapeNonHTMLFoundCallback = onScrapeNonHTMLFoundCallback;
    }

    // callback untuk scrape selesai
    setOnScrapeOneDownloadFinishedCallback(onScrapeOneDownloadFinishedCallback) {
        this.onScrapeOneDownloadFinishedCallback = onScrapeOneDownloadFinishedCallback;
    }

    // callback untuk scrape error
    setOnScrapeErrorCallback(onScrapeErrorCallback) {
        this.onScrapeErrorCallback = onScrapeErrorCallback;
    }

    // callback untuk scrape arguments tidak benar
    setOnScrapeArgsInvalid(onScrapeArgsInvalid) {
        this.onScrapeArgsInvalid = onScrapeArgsInvalid;
    }

    // callback untuk chrome tidak terdeteksi
    setOnChromeNotDetected(onChromeNotDetected) {
        this.onChromeNotDetected = onChromeNotDetected;
    }

    // untuk mem-passing argument scrape
    setScrapeArgs(scrapeArgs) {
        this.rootURL = scrapeArgs.rootURL;
        this.excludeURLContains = scrapeArgs.excludeURLContains;
        this.downloadLimit = scrapeArgs.downloadLimit;
        this.proxyIP = scrapeArgs.proxyIP;
        this.proxyPort = scrapeArgs.proxyPort;
        this.ignoreCertErr = scrapeArgs.ignoreCertErr;
        this.proxyUser = scrapeArgs.proxyUser;
        this.proxyPass = scrapeArgs.proxyPass;
        this.userAgent = scrapeArgs.userAgent;
        this.saveAs = scrapeArgs.saveAs;
        this.outputPath = scrapeArgs.outputPath;
        this.whenDownloadFinished = scrapeArgs.whenDownloadFinished;
        console.log(scrapeArgs);

        // console.log(this.excludeURLContains == undefined);
        this.excludeURLContains.split(",");
    }

    // untuk mengecek bahwa argument valid
    areArgsValid() {
        let valid = false;
        let valid1 = false;
        let valid2 = false;
        let valid3 = false;

        valid = this.rootURL != null && this.rootURL != "" && this.rootURL != undefined;
        console.log("valid: " + valid);
        valid1 = this.isOutputFolderFine() && this.outputPath != null && this.outputPath != "" && this.outputPath != undefined;
        console.log("valid1: " + valid1);

        if (this.proxyIP != null && this.proxyIP != "" && this.proxyIP != undefined && this.proxyPort != null && this.proxyPort != "" && this.proxyPort != undefined) {
            console.log("valid2: " + true);
            valid2 = true;
        }

        valid3 = valid2 ? this.isProxyFine() : true;
        console.log("valid3: " + valid3);

        this.proxyIsBeingUsed = valid2 && this.isProxyFine();
        this.proxyNeedAuth = this.proxyUser != null && this.proxyUser != "" && this.proxyUser != undefined && this.proxyPass != null && this.proxyPass != "" && this.proxyPass != undefined;

        this.userAgentIsUsed = this.userAgent != null && this.userAgent != "" && this.userAgent != undefined;

        console.log("valid total: " + (valid && valid1 && valid3));
        return valid && valid1 && valid3;
    }

    // belum tersedia
    isProxyFine() {
        return true;
    }

    // untuk memastikan folder output ada
    isOutputFolderFine() {
        return fs.existsSync(this.outputPath);
    }

    // akhir dari scrape adalah...
    whenScrapingFinished() {
        if (this.whenDownloadFinished == "open-output-folder") {
            console.log("opening output folder...");

            let targetfolder = this.outputPathFolderName;
            console.log("target folder: " + targetfolder);

            shell.showItemInFolder(targetfolder);
        } else if (this.whenDownloadFinished == "do-nothing") {
            console.log("do nothing...");
        }
    }

    // untuk mendapatkan host name
    extractHostname(urlValue) {
        return url.parse(urlValue).hostname;
    }

    // unique id berupa tanggal dan waktu
    uniqueID() {
        let d = new Date();
        let dateString = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds();
        return dateString;
    }

    // untuk memulai scrape
    async start() {
        console.log("Scraper is started");

        this.forceStopScrapers = false;

        if (!this.checkChrome()) {
            if (this.onChromeNotDetected) {
                this.onChromeNotDetected("Chromium is needed for this program.");
            }
            return;
        }

        if (this.areArgsValid()) {
            console.log("make output directory");

            try {
                if (!fs.existsSync(this.outputPath)) {
                    fs.mkdirSync(this.outputPath);
                }
            } catch (error) {
                console.log(error);
                return;
            }

            console.log("make output sub directory");

            this.outputPathFolderName = this.outputPath + path.sep + this.extractHostname(this.rootURL) + "-" + this.uniqueID();

            try {
                if (!fs.existsSync(this.outputPathFolderName)) {
                    fs.mkdirSync(this.outputPathFolderName);
                }
            } catch (error) {
                console.log(error);
                return;
            }

            console.log("begins to scrape...");

            let leftList = Array();
            let leftListCtr = -1;
            let page;
            if (this.proxyIsBeingUsed) {
                console.log("using proxy");

                this.browser = await puppeteer.launch({
                    executablePath: this.getDefaultChromePath() + path.sep + "chrome.exe",
                    headless: isDev ? false : true,
                    userDataDir: this.getCachePath(),
                    args: [`--disable-features=PrintCompositorLPAC`, `--window-size=1024,768`, `--proxy-server=socks4://${this.proxyIP}:${this.proxyPort}`],
                });

                let pctr = (await this.browser.pages()).length;
                while (pctr > 1) {
                    let pg = (await this.browser.pages())[pctr - 1];
                    await pg.close();
                    pctr = (await this.browser.pages()).length;
                }

                page = (await this.browser.pages())[0];
                const client = await page.target().createCDPSession();
                await client.send("Emulation.clearDeviceMetricsOverride");

                if (this.proxyNeedAuth) {
                    await page.authenticate({
                        username: this.proxyUser,
                        password: this.proxyPass,
                    });
                }
            } else {
                console.log("-3");
                this.browser = await puppeteer.launch({
                    executablePath: this.getDefaultChromePath() + path.sep + "chrome.exe",
                    headless: isDev ? false : true,
                    userDataDir: this.getCachePath(),
                    args: [`--disable-features=PrintCompositorLPAC`, `--window-size=1024,768`],
                });

                console.log("-2");
                let pctr = (await this.browser.pages()).length;
                while (pctr > 1) {
                    let pg = (await this.browser.pages())[pctr - 1];
                    await pg.close();
                    pctr = (await this.browser.pages()).length;
                }

                console.log("-1");
                page = (await this.browser.pages())[0];
                const client = await page.target().createCDPSession();
                await client.send("Emulation.clearDeviceMetricsOverride");
            }

            if (this.userAgentIsUsed) {
                await page.setUserAgent(this.userAgent);
            }

            //
            console.log("0");
            await this.doScraping(page, this.rootURL, leftList, leftListCtr);
        } else {
            console.log("invalid scrape args");
            if (this.onScrapeArgsInvalid) {
                this.onScrapeArgsInvalid('Make sure that "Root URL" and "Where to Save the Output" is not empty');
            }
            return;
        }
    }

    // untuk menghentikan scrape
    stop() {
        console.log("PDF scraper is stopped");
        this.forceStopScrapers = true;
    }

    //
    async safeCloseBrowser() {
        const self = this;

        if (self.browser) {
            let pages = await self.browser.pages();
            for (let pg of pages) {
                if (pg) {
                    await pg.close();
                }
            }

            await self.browser.close();
        }
    }

    //
    async doScraping(_page, _urlTarget, _leftList, _leftListCtr) {
        console.log("doScraping begins...");

        const self = this;

        //
        if (self.onScrapeStartedCallback) {
            self.onScrapeStartedCallback();
        }

        //
        if (_leftListCtr >= _leftList.length) {
            console.log("scraping process is done completely.");
            // console.log(_urlTarget);

            if (self.onScrapeStoppedCallback) {
                self.onScrapeStoppedCallback("done");
            }

            self.whenScrapingFinished();

            await self.safeCloseBrowser();

            return;
        }

        //
        _leftListCtr++;

        //
        if (self.downloadLimit != -1 && _leftListCtr >= self.downloadLimit) {
            console.log("download limit has been reached");
            console.log("scraping process is done completely");

            if (self.onScrapeStoppedCallback) {
                self.onScrapeStoppedCallback("done");
            }

            self.whenScrapingFinished();

            await self.safeCloseBrowser();

            return;
        }

        //
        if (self.forceStopScrapers == true) {
            console.log("scraping process has been stopped forcefully.");
            console.log("scraping process is done forcefully.");

            if (self.onScrapeStoppedCallback) {
                self.onScrapeStoppedCallback("force");
            }

            self.whenScrapingFinished();

            await self.safeCloseBrowser();

            return;
        }

        //
        try {
            //
            const response = await _page.goto(_urlTarget, { waitUntil: "networkidle0" });
            const responseHeader = response.headers();
            const mime = responseHeader["content-type"].split(";")[0];

            //
            if (mime.search("text/html") === -1) {
                console.log("non text/html found.");
                console.log("mime: " + mime);

                if (self.onScrapeNonHTMLFoundCallback) {
                    self.onScrapeNonHTMLFoundCallback();
                }

                await self.doScraping(_page, _leftList[_leftListCtr], _leftList, _leftListCtr);

                return;
            }

            //
            const filePathName = self.outputPathFolderName + path.sep + _leftListCtr.toString() + "-" + _urlTarget.replace(/\\|\/|\*|\?|\<|\>|\||:/g, "-");
            if (self.saveAs == "PDF") {
                await _page.pdf({
                    // agar bisa save pdf:
                    // --disable-features=PrintCompositorLPAC
                    // gunakan parameter itu.
                    path: filePathName + ".pdf",
                    format: "A4",
                });
            } else if (self.saveAs == "Image") {
                await _page.screenshot({
                    path: filePathName + ".png",
                    fullPage: true,
                });
            } else if (self.saveAs === "MHTML") {
                try {
                    let cdp = await _page.target().createCDPSession();
                    const { data } = await cdp.send("Page.captureSnapshot", { format: "mhtml" });
                    fs.writeFileSync(filePathName + ".mhtml", data);
                    cdp = null;
                } catch (err) {
                    console.error(err);
                }
            }

            //
            let urlsInCurrentPage = await _page.evaluate(() => {
                var urls = [];

                for (var i = document.links.length; i-- > 0; ) {
                    if (document.links[i].hostname === location.hostname) {
                        urls.push(document.links[i].href);
                    }
                }

                return {
                    title: document.title,
                    urls: urls,
                };
            });

            for (let i = 0; i < urlsInCurrentPage.urls.length; i++) {
                let len = _leftList.filter((x) => x.includes(urlsInCurrentPage.urls[i])).length;
                let len1 = urlsInCurrentPage.urls[i].search(self.rootURL);
                let splitted = self.excludeURLContains.split(",");
                let containsJunks = true;
                let jCtr = 0;

                if (self.excludeURLContains) {
                    for (let j = 0; j < splitted.length; j++) {
                        let len2 = urlsInCurrentPage.urls[i].search(splitted[j]);
                        if (len2 != -1) {
                            jCtr++;
                        }
                    }
                }

                containsJunks = jCtr != 0;

                if (len == 0 && len1 == 0 && containsJunks == false && urlsInCurrentPage.urls[i] != self.rootURL) {
                    _leftList.push(urlsInCurrentPage.urls[i]);
                }
            }

            if (self.onScrapeProgressCallback) {
                let prog = self.downloadLimit == -1 ? ((_leftListCtr + 1) / (_leftList.length + 1)) * 100 : ((_leftListCtr + 1) / Math.min(_leftList.length + 1, self.downloadLimit)) * 100;
                self.onScrapeProgressCallback(prog);
            }

            if (self.onScrapeOneDownloadFinishedCallback) {
                self.onScrapeOneDownloadFinishedCallback(_urlTarget);
            }

            await self.doScraping(_page, _leftList[_leftListCtr], _leftList, _leftListCtr);
        } catch (error) {
            console.log(error);

            if (self.onScrapeErrorCallback) {
                self.onScrapeErrorCallback(error);
            }
        }
    }
}

export default ScraperCore;
