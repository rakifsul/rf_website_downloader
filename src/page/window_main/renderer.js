// saat document ready
$(document).ready(async function () {
    // saat button start diklik
    $("#btn-start").click(async function () {
        if ($(this).text() == "Start") {
            let scrapeArgs = {
                rootURL: $("#txt-single-url").val(),
                excludeURLContains: $("#txt-exclude-url-contains").val(),
                downloadLimit: parseInt($("#txt-download-limit").val(), 10),
                proxyIP: $("#txt-ip-address").val(),
                proxyPort: $("#txt-port").val(),
                ignoreCertErr: $("#chk-ignore-cert-err").is(":checked"),
                proxyUser: $("#txt-username").val(),
                proxyPass: $("#pass-password").val(),
                userAgent: $("#txt-user-agent").val(),
                saveAs: $("#save-as").val(),
                outputPath: $("#browse-result").val(),
                whenDownloadFinished: $("input[name=rad-when-finished]:checked").val(),
            };

            // let scrapeArgs = {
            //     rootURL: "1",
            //     excludeURLContains: "1",
            //     downloadLimit: "1",
            //     proxyIP: "1",
            //     proxyPort: "1",
            //     ignoreCertErr: "1",
            //     proxyUser: "1",
            //     proxyPass: "1",
            //     userAgent: "1",
            //     saveAs: "1",
            //     outputPath: "1",
            //     whenDownloadFinished: "1",
            // };
            console.log(scrapeArgs);
            await preload.startScraping(scrapeArgs);
        } else if ($(this).text() == "Stop") {
            await preload.stopScraping();
        }
    });

    // saat button browse diklik
    $("#browse").click(async function () {
        if ($("#btn-start").hasClass("disabled") == true) {
            return;
        }

        const ret = await preload.openFolderDialog();
        if (ret.filePaths[0]) {
            // alert(ret.filePaths[0]);
            $("#browse-result").val(ret.filePaths[0]);
            return;
        }
    });

    // saat progress berjalan
    preload.handleSetProgress(async (event, arg) => {
        $("#progressbar").css("width", arg + "%");
    });

    // start button toggler dan konsekuensinya
    preload.handleToggleStartButton(async (event, arg) => {
        // maka isi path-nya ke input box.
        if (arg == true) {
            $("#btn-start").text("Stop");

            $("#txt-single-url").addClass("disabled");
            $("#txt-exclude-url-contains").addClass("disabled");
            $("#txt-download-limit").addClass("disabled");
            $("#txt-ip-address").addClass("disabled");
            $("#txt-port").addClass("disabled");
            $("#chk-ignore-cert-err").addClass("disabled");
            $("#txt-username").addClass("disabled");
            $("#pass-password").addClass("disabled");
            $("#txt-user-agent").addClass("disabled");
            $("#save-as").addClass("disabled");
            $("#browse-result").addClass("disabled");
            $("input[name=rad-when-finished]").addClass("disabled");
            $("input[type=radio][name=rad-url-type]").addClass("disabled");
        } else {
            $("#btn-start").text("Start");

            $("#txt-single-url").removeClass("disabled");
            $("#txt-exclude-url-contains").removeClass("disabled");
            $("#txt-download-limit").removeClass("disabled");
            $("#txt-ip-address").removeClass("disabled");
            $("#txt-port").removeClass("disabled");
            $("#chk-ignore-cert-err").removeClass("disabled");
            $("#txt-username").removeClass("disabled");
            $("#pass-password").removeClass("disabled");
            $("#txt-user-agent").removeClass("disabled");
            $("#save-as").removeClass("disabled");
            $("#browse-result").removeClass("disabled");
            $("input[name=rad-when-finished]").removeClass("disabled");
            $("input[type=radio][name=rad-url-type]").removeClass("disabled");
        }

        $("#txt-single-url").prop("disabled", arg);
        $("#txt-exclude-url-contains").prop("disabled", arg);
        $("#txt-download-limit").prop("disabled", arg);
        $("#txt-ip-address").prop("disabled", arg);
        $("#txt-port").prop("disabled", arg);
        $("#chk-ignore-cert-err").prop("disabled", arg);
        $("#txt-username").prop("disabled", arg);
        $("#pass-password").prop("disabled", arg);
        $("#txt-user-agent").prop("disabled", arg);
        $("#save-as").prop("disabled", arg);
        $("#browse-result").prop("disabled", arg);
        $("input[name=rad-when-finished]").prop("disabled", arg);
        $("input[type=radio][name=rad-url-type]").prop("disabled", arg);
    });

    if ((await preload.isDev()) === true) {
        $("#txt-single-url").val("https://quotes.toscrape.com");
        $("#browse-result").val("D:\\_scrape");
    }
});
