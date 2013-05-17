// For an introduction to the HTML Fragment template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    // This function is called whenever a user navigates to this page. It
    // populates the page elements with the app's data.
    var applicationData = Windows.Storage.ApplicationData.current;
    var localFolder = applicationData.localFolder;

    function ready(element, options) {
        // TODO: Initialize the fragment here.
        WinJS.UI.processAll();

        var alarmsListDiv = document.getElementById("alarmsList").winControl;
        alarmsListDiv.addEventListener("iteminvoked", listTappingHandler, false);

        var alaNoti = document.getElementById("alarmNotificationsCA");
        alaNoti.addEventListener("change", notificationToggleHandler, false);

        var appButtonDelete = document.getElementById("cmdDelete");
        appButtonDelete.addEventListener("click", function () {
            navigateTo("delete");
        }, false);

        var appSaveButton = document.getElementById("cmdSave");
        appSaveButton.addEventListener("click", function () {
            navigateTo("save");
        }, false);

        var appButtonHome = document.getElementById("cmdHome");
        appButtonHome.addEventListener("click", function () {
            navigateTo("home");
        }, false);

        WinJS.UI.Animation.fadeOut(WinJS.Utilities.id("cmdDelete")).done(function () {
            WinJS.Utilities.id("cmdDelete").setAttribute("disabled", "disabled");
        });
        WinJS.UI.Animation.fadeOut(WinJS.Utilities.id("cmdSave")).done(function () {
            WinJS.Utilities.id("cmdSave").setAttribute("disabled", "disabled");
        });

        var deleteButton = document.getElementById("deleteButton");
        deleteButton.addEventListener("click", deleteAlarm, false);

        var dontDeleteButton = document.getElementById("dontDeleteButton");
        dontDeleteButton.addEventListener("click", function () {
            document.getElementById("confirmDeleteFlyout").winControl.hide();
            document.getElementById("cmdDelete").blur();
        }, false);

        loadAlarmsList();
    }

    function updateLayout(element, viewState) {
        // TODO: Respond to changes in viewState.
    }

    WinJS.UI.Pages.define("/html/currentAlarms.html", {
        ready: ready,
        updateLayout: updateLayout
    });

    function loadAlarmsList() {
        var applicationData = Windows.Storage.ApplicationData.current;
        var localFolder = applicationData.localFolder;
        var alarms = [];
        var alarmDataArray = [];
        var oneAlarmInfo;
        var typePic = [];
        typePic["BIRTHDAY"] = "/images/bday.png";
        typePic["BILLS"] = "/images/bill.png";
        typePic["CALL"] = "/images/call.png";
        typePic["MEDICINE"] = "/images/medicine.ico";
        typePic["MEETING"] = "/images/meeting.png";
        typePic["ANNIVERSARY"] = "/images/bday.png";
        var pic = "";
        localFolder.createFolderAsync("AlarmData", Windows.Storage.CreationCollisionOption.openIfExists).done(function (dataFolder) {
            dataFolder.getFileAsync("AlarmsInfo.txt").done(function (dataFile) {
                return Windows.Storage.FileIO.readTextAsync(dataFile).done(function (dataFileText) {
                    if (dataFileText.length == 1) {
                    }
                    else {
                        dataFileText = dataFileText.substr(1, dataFileText.length);
                        alarms = dataFileText.split(";");
                        for (var i = 0; i < alarms.length; i++) {
                            var ala = alarms[i].split("_");
                            pic = typePic[ala[1]];
                            oneAlarmInfo = {
                                name: ala[0],
                                type: ala[1],
                                date: ala[2],
                                picture: pic
                            }
                            alarmDataArray.push(oneAlarmInfo);
                        }
                        var dataList = new WinJS.Binding.List(alarmDataArray);
                        var alarmsList = document.getElementById("alarmsList").winControl;
                        alarmsList.itemDataSource = dataList.dataSource;
                        console.log("SAI" + appNameSpace.savedAlarmIndex);
                        if (appNameSpace.savedAlarmIndex >= 0) {
                            alarmsList.selection.add(appNameSpace.savedAlarmIndex);
                            WinJS.Namespace.define("appNameSpace", { savedAlarmIndex: -1 });
                        }
                        else {
                            document.getElementById("currentAlarmsError").innerText = "Tap on a reminder to display its details.";
                        }
                    }
                });
            },
         function error(e) {
             document.getElementById("currentAlarmsError").innerText = "There are no reminders to display.";
         });
        });
    }

    function listTappingHandler(eventInfo) {
        WinJS.Namespace.define("appNameSpace", { savedAlarmIndex: eventInfo.detail.itemIndex });
        document.getElementById("currentAlarmsError").innerText = "";
        var alarmsListDiv = document.getElementById("alarmsList").winControl;
        var alaName = alarmsListDiv.elementFromIndex(eventInfo.detail.itemIndex).getElementsByTagName('H2').item(0).innerText;
        //WinJS.Namespace.define("appNameSpace", { alarmName: alaName });
        //WinJS.Navigation.navigate("/html/viewAlarm.html");
        alaName = alaName + ".txt";
        WinJS.Utilities.query(".alarmLabels").setStyle("display", "block");

        var alarmInfoArray;
        localFolder.getFolderAsync("AlarmData").then(function (dataFolder) {
            dataFolder.getFileAsync(alaName).then(function (file) {
                Windows.Storage.FileIO.readTextAsync(file).then(function (fileData) {
                    alarmInfoArray = fileData.split(";");
                    var noOfNoti;
                    for (var i = 0; i < alarmInfoArray.length; i++) {
                        var temp = alarmInfoArray[i].split(":");
                        if (temp[0] == "AlarmName") {
                            document.getElementById("alarmName").innerText = temp[1];
                            document.getElementById("hrCA").style.visibility = "visible";
                        }
                        if (temp[0] == "AlarmType") {
                            document.getElementById("alarmType").innerText = temp[1];
                        }
                        if (temp[0] == "AlarmDate") {
                            document.getElementById("alarmDateCA").winControl.current = new Date(temp[1]);
                            document.getElementById("alarmDateCA").style.display = "block";
                        }
                        if (temp[0] == "AlarmTime") {
                            var tempTime = new Date();
                            tempTime.setHours(temp[1]);
                            tempTime.setMinutes(temp[2]);
                            document.getElementById("alarmTimeCA").winControl.current = tempTime;
                            document.getElementById("alarmTimeCA").winControl.clock = "24HourClock";
                            document.getElementById("alarmTimeCA").style.display = "block";
                        }
                        if (temp[0] == "AlarmCycle") {
                            var cycleSelect = document.getElementById("alarmCycleCA");
                            if (temp[1] == "NA") {
                                document.getElementById("alarmCycleText").innerText = temp[1];
                                document.getElementById("alarmCycleText").style.display = "block";
                                cycleSelect.style.display = "none";
                            }
                            else {
                                var opts = cycleSelect.getElementsByTagName('option');
                                for (var j = 0; j < opts.length; j++) {
                                    opts[j].selected = (opts[j].value == temp[1] ? "selected" : "");
                                }
                                document.getElementById("alarmCycleText").style.display = "none";
                                cycleSelect.style.display = "block";
                            }
                        }
                        if (temp[0] == "AlarmNotes") {
                            document.getElementById("alarmNotesCA").innerText = temp[1];
                        }
                        if (temp[0] == "AlarmNoti") {
                            if (temp[1] == "true") {
                                document.getElementById("alarmNotificationsCA").winControl.checked = true;
                            }
                            else {
                                document.getElementById("alarmNotificationsCA").winControl.checked = false;
                            }
                            document.getElementById("alarmNotificationsCA").style.display = "block";
                        }
                        if (temp[0] == "NoOfNoti") {
                            noOfNoti = temp[1];
                        }
                    }

                    var alaCycle = document.getElementById("alarmCycleCA");
                    alaCycle = alaCycle.options[alaCycle.selectedIndex].value;
                    if (alaCycle == "D") {
                        document.getElementById("numberForDaily").style.display = "block";
                        document.getElementById("numberForWeekly").style.display = "none";
                        document.getElementById("noOfDays").value = noOfNoti;
                    }
                    else if (alaCycle == "W") {
                        document.getElementById("numberForWeekly").style.display = "block";
                        document.getElementById("numberForDaily").style.display = "none";
                        document.getElementById("noOfWeeks").value = noOfNoti;
                    }
                    else {
                        document.getElementById("numberForWeekly").style.display = "none";
                        document.getElementById("numberForDaily").style.display = "none";
                    }

                    WinJS.UI.Animation.fadeIn(WinJS.Utilities.id("cmdDelete")).done(function () {
                        document.getElementById("cmdDelete").removeAttribute("disabled");
                    });
                    WinJS.UI.Animation.fadeIn(WinJS.Utilities.id("cmdSave")).done(function () {
                        document.getElementById("cmdSave").removeAttribute("disabled");
                    });
                });
            });
        });
        alarmsListDiv.selection.clear();
        alarmsListDiv.selection.add(eventInfo.detail.itemIndex);
    }

    function navigateTo(buttonId) {
        var anc;
        var flyout;
        if (buttonId == "home") {
            WinJS.Namespace.define("appNameSpace", { savedAlarmIndex: -1 });
            WinJS.Namespace.define("appNameSpace", { savedListIndex: -1 });
            WinJS.Navigation.navigate("/html/currentAlarms.html");
        }
        else if (buttonId == "delete") {
            anc = document.getElementById("cmdDelete");
            flyout = document.getElementById("confirmDeleteFlyout");
            showFlyout(flyout, anc, "bottom");
        }
        else if (buttonId == "setAlarm") {
            WinJS.Namespace.define("appNameSpace", { savedAlarmIndex: -1 });
            WinJS.Namespace.define("appNameSpace", { savedListIndex: -1 });
            WinJS.Navigation.navigate("/html/setnewAlarm.html");
        }
        else if (buttonId == "currentAlarm") {
            WinJS.Namespace.define("appNameSpace", { savedAlarmIndex: -1 });
            WinJS.Namespace.define("appNameSpace", { savedListIndex: -1 });
            WinJS.Navigation.navigate("/html/currentAlarms.html");
        }
        else if (buttonId == "toDoList") {
            WinJS.Namespace.define("appNameSpace", { savedAlarmIndex: -1 });
            WinJS.Namespace.define("appNameSpace", { savedListIndex: -1 });
            WinJS.Navigation.navigate("/html/toDoList.html");
        }
        else if (buttonId == "quickNote") {
            WinJS.Namespace.define("appNameSpace", { savedAlarmIndex: -1 });
            WinJS.Namespace.define("appNameSpace", { savedListIndex: -1 });
            WinJS.Navigation.navigate("/html/quickNote.html");
        }
        else if (buttonId == "save") {
            var month = new Array();
            month[0] = "January";
            month[1] = "February";
            month[2] = "March";
            month[3] = "April";
            month[4] = "May";
            month[5] = "June";
            month[6] = "July";
            month[7] = "August";
            month[8] = "September";
            month[9] = "October";
            month[10] = "November";
            month[11] = "December";
            var alaName = document.getElementById("alarmName").innerText;
            var alaType = document.getElementById("alarmType").innerText;
            var alaCycle = document.getElementById("alarmCycleCA");
            var alaCycleValue = alaCycle.options[alaCycle.selectedIndex].value;
            alaCycle = alaCycle.options[alaCycle.selectedIndex].value;
            var alaDate = new Date(document.getElementById("alarmDateCA").winControl.current);
            alaDate = alaDate.getDate() + " " + month[alaDate.getMonth()] + ", " + alaDate.getFullYear();
            var alaTime = new Date(document.getElementById("alarmTimeCA").winControl.current);

            var alarmDateTime = new Date(alaDate);
            alarmDateTime.setHours(alaTime.getHours());
            alarmDateTime.setMinutes(alaTime.getMinutes());
            alarmDateTime.setSeconds(alaTime.getSeconds());

            alaTime = alaTime.getHours() + ":" + alaTime.getMinutes();
            var alaNoti = document.getElementById("alarmNotificationsCA").winControl;
            alaNoti = alaNoti.checked;
            var alaNotes = document.getElementById("alarmNotesCA").innerText;
            var messages;

            if (!alaNoti) {
                alaCycle = "NA";
            }

            if (alarmDateTime <= new Date()) {
                messages = new Windows.UI.Popups.MessageDialog("Please enter future time!!");
                messages.showAsync();
                document.getElementById("alarmType").focus();
                return;
            }

            if (alaNotes == "Add notes....") {
                alaNotes = "No Notes Added";
            }

            if (alaName.toString().length == 0) {
                var enterAllFieldsMessage = new Windows.UI.Popups.MessageDialog("All the fields are compulsory.");
                enterAllFieldsMessage.showAsync();
                document.getElementById("alarmType").focus();
            }
            else {
                var noOfToasts = 0;
                if (alaCycleValue == "N") {
                    noOfToasts = 1;
                }
                else if (alaCycleValue == "D") {
                    var no = document.getElementById("noOfDays").value;
                    if (no == "" || no == "0") {
                        noOfToasts = 30;
                    }
                    else {
                        noOfToasts = no;
                    }
                }
                else if (alaCycleValue == "W") {
                    var no = document.getElementById("noOfWeeks").value;
                    if (no == "" || no == "0") {
                        noOfToasts = 52;
                    }
                    else {
                        noOfToasts = no;
                    }
                }
                else if (alaCycleValue == "M") {
                    noOfToasts = 12;
                }
                else if (alaCycleValue == "Y") {
                    noOfToasts = 5;
                }

                if (!alaNoti) {
                    noOfToasts = 0;
                }
                var alarmData = "AlarmName:" + alaName + ";"
                            + "AlarmType:" + alaType + ";"
                            + "AlarmDate:" + alaDate + ";"
                            + "AlarmTime:" + alaTime + ";"
                            + "AlarmCycle:" + alaCycle + ";"
                            + "AlarmNotes:" + alaNotes + ";"
                            + "AlarmNoti:" + alaNoti + ";"
                            + "NoOfNoti:" + noOfToasts;

                var applicationData = Windows.Storage.ApplicationData.current;
                var localFolder = applicationData.localFolder;

                localFolder.createFolderAsync("AlarmData", Windows.Storage.CreationCollisionOption.openIfExists).then(function (dataFolder) {
                    dataFolder.createFileAsync(alaName.toUpperCase() + ".txt", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                        return Windows.Storage.FileIO.writeTextAsync(file, alarmData).then(function () {
                            dataFolder.getFileAsync("AlarmsInfo.txt").done(function (dataFile) {
                                return Windows.Storage.FileIO.readTextAsync(dataFile).done(function (dataFileText) {
                                    dataFileText = dataFileText.substr(1, dataFileText.length);
                                    var alarms = dataFileText.split(";");
                                    var alarmsInfoString = "";
                                    for (var i = 0; i < alarms.length; i++) {
                                        var ala = alarms[i].split("_");
                                        if (ala[0] == alaName.toUpperCase()) {
                                            alarmsInfoString = alarmsInfoString + ";" + alaName.toUpperCase() + "_" + alaType.toUpperCase() + "_" + alaDate;
                                        }
                                        else {
                                            alarmsInfoString = alarmsInfoString + ";" + ala[0] + "_" + ala[1] + "_" + ala[2];
                                        }
                                    }
                                    console.log(alarmsInfoString);
                                    var notifier = Windows.UI.Notifications.ToastNotificationManager.createToastNotifier();
                                    var scheduled = notifier.getScheduledToastNotifications();
                                    var len = alaName.length;
                                    var schedLen = scheduled.length;
                                    for (var i = 0; i < schedLen; i++) {
                                        if (scheduled[i].id.substr(0, len).toUpperCase() == alaName.toUpperCase()) {
                                            notifier.removeFromSchedule(scheduled[i]);
                                        }
                                    }
                                    return Windows.Storage.FileIO.writeTextAsync(dataFile, alarmsInfoString).done(function () {
                                        if (alaNoti) {
                                            var template = Windows.UI.Notifications.ToastTemplateType.toastText04;
                                            var toastXml = Windows.UI.Notifications.ToastNotificationManager.getTemplateContent(template);
                                            var toastTextElements = toastXml.getElementsByTagName("text");
                                            toastTextElements[0].appendChild(toastXml.createTextNode(alaName.toUpperCase()));
                                            toastTextElements[1].appendChild(toastXml.createTextNode(alaType));
                                            toastTextElements[2].appendChild(toastXml.createTextNode(alaDate));

                                            var toastNode = toastXml.selectSingleNode("/toast");
                                            toastNode.setAttribute("duration", "long");

                                            var audio = toastXml.createElement("audio");
                                            audio.setAttribute("src", "ms-winsoundevent:Notification.Looping.Alarm");
                                            audio.setAttribute("loop", "true");
                                            audio.setAttribute("silent", "false");
                                            toastNode.appendChild(audio);

                                            var toast = Windows.UI.Notifications.ToastNotification(toastXml);
                                            var toastNotifier = Windows.UI.Notifications.ToastNotificationManager.createToastNotifier();
                                            var scheduledToast;
                                            var month = alarmDateTime.getMonth();
                                            var year = alarmDateTime.getFullYear();
                                            var toastId = alaName;
                                            for (var i = 0; i < noOfToasts; i++) {
                                                if (alaCycleValue == "N") {
                                                    scheduledToast = new Windows.UI.Notifications.ScheduledToastNotification(toastXml, alarmDateTime);
                                                    scheduledToast.id = toastId + i;
                                                }
                                                else if (alaCycleValue == "D") {
                                                    scheduledToast = new Windows.UI.Notifications.ScheduledToastNotification(toastXml, new Date(alarmDateTime.getTime() + (i * 24 * 60 * 60 * 1000)));
                                                    scheduledToast.id = toastId + i;
                                                }
                                                else if (alaCycleValue == "W") {
                                                    scheduledToast = new Windows.UI.Notifications.ScheduledToastNotification(toastXml, new Date(alarmDateTime.getTime() + (i * 7 * 24 * 60 * 60 * 1000)));
                                                    scheduledToast.id = toastId + i;
                                                }
                                                else if (alaCycleValue == "M") {
                                                    scheduledToast = new Windows.UI.Notifications.ScheduledToastNotification(toastXml, new Date(alarmDateTime.setMonth(month)));
                                                    if (month == 11) {
                                                        month = 0;
                                                        alarmDateTime = new Date(alarmDateTime.setFullYear(alarmDateTime.getFullYear() + 1));
                                                    }
                                                    else {
                                                        month = month + 1;
                                                    }
                                                    scheduledToast.id = toastId + i;
                                                }
                                                else if (alaCycleValue == "Y") {
                                                    scheduledToast = new Windows.UI.Notifications.ScheduledToastNotification(toastXml, new Date(alarmDateTime.setFullYear(year)));
                                                    year = year + 1;
                                                    scheduledToast.id = toastId + i;
                                                }
                                                toastNotifier.addToSchedule(scheduledToast);
                                            }
                                        }
                                        anc = document.getElementById("cmdSave");
                                        flyout = document.getElementById("alarmSavedFlyout");
                                        showFlyout(flyout, anc, "bottom");
                                        setTimeout(function () {
                                            if (document.getElementById("alarmSavedFlyout") != null) {
                                                document.getElementById("alarmSavedFlyout").winControl.hide();
                                                document.getElementById("cmdSave").blur();
                                            }
                                        }, 6000);
                                        loadAlarmsList();
                                    });
                                });
                            });
                        });
                    },
                    function error(e) {
                        var badNameErrorMessage = new Windows.UI.Popups.MessageDialog("Alarm name already exists, choose a different name");
                        badNameErrorMessage.showAsync();
                        document.getElementById("alarmType").focus();
                    }).done();
                }).done();
            }
        }
    }

    function showFlyout(flyout, anchor, placement) {
        document.getElementById("alarmName").focus();
        flyout.winControl.show(anchor, placement);
    }

    function notificationToggleHandler() {
        var alaNoti = document.getElementById("alarmNotificationsCA").winControl;
        alaNoti = alaNoti.checked;
        if (alaNoti) {
            document.getElementById("alarmCycleText").style.display = "none";
            document.getElementById("alarmCycleCA").style.display = "block";
        }
        else {
            document.getElementById("alarmCycleText").style.display = "block";
            document.getElementById("alarmCycleCA").style.display = "none";
            document.getElementById("numberForWeekly").style.display = "none";
            document.getElementById("numberForDaily").style.display = "none";
            document.getElementById("alarmCycleCA").selectedIndex = 0;
        }
    }


    function deleteAlarm() {
        WinJS.Namespace.define("appNameSpace", { savedAlarmIndex: -1 });
        document.getElementById("confirmDeleteFlyout").winControl.hide();
        var alarmFileName = document.getElementById("alarmName").innerText.toUpperCase();
        localFolder.getFolderAsync("AlarmData").then(function (dataFolder) {
            dataFolder.getFileAsync(alarmFileName + ".txt").then(function (file) {
                file.deleteAsync().done();
            });
            dataFolder.getFileAsync("AlarmsInfo.txt").done(function (dataFile) {
                return Windows.Storage.FileIO.readTextAsync(dataFile).done(function (dataFileText) {
                    dataFileText = dataFileText.substr(1, dataFileText.length);
                    var alarms = dataFileText.split(";");
                    var alarmsInfoString = "";
                    for (var i = 0; i < alarms.length; i++) {
                        var ala = alarms[i].split("_");
                        if (ala[0] == alarmFileName) {
                            continue;
                        }
                        else {
                            alarmsInfoString = alarmsInfoString + ";" + ala[0] + "_" + ala[1] + "_" + ala[2];
                        }
                    }
                    var notifier = Windows.UI.Notifications.ToastNotificationManager.createToastNotifier();
                    var scheduled = notifier.getScheduledToastNotifications();
                    var len = alarmFileName.length;
                    var schedLen = scheduled.length;
                    for (var i = 0; i < schedLen; i++) {
                        if (scheduled[i].id.substr(0, len).toUpperCase() == alarmFileName) {
                            notifier.removeFromSchedule(scheduled[i]);
                        }
                    }
                    if (alarmsInfoString == "") {
                        dataFile.deleteAsync().done(function () {
                            WinJS.Navigation.navigate("/html/currentAlarms.html");
                        });
                    }
                    else {
                        return Windows.Storage.FileIO.writeTextAsync(dataFile, alarmsInfoString).done(function () {
                            WinJS.Navigation.navigate("/html/currentAlarms.html");
                        });
                    }
                });
            });
        });
        document.getElementById("cmdDelete").blur();
    }

    WinJS.Namespace.define("CurrentAlarmsNS", {
        navigateTo: navigateTo
    });


})();
