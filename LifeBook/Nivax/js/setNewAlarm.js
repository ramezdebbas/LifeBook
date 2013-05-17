// For an introduction to the HTML Fragment template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    // This function is called whenever a user navigates to this page. It
    // populates the page elements with the app's data.
    function ready(element, options) {
        // TODO: Initialize the fragment here.
        var notifier = Windows.UI.Notifications.ToastNotificationManager.createToastNotifier();
        var scheduled = notifier.getScheduledToastNotifications();
        for (var i = 0, len = scheduled.length; i < len; i++) {
            //notifier.removeFromSchedule(scheduled[i]);
            console.log(scheduled[i].id);
        }

        WinJS.UI.processAll();
        WinJS.UI.Animation.fadeOut(WinJS.Utilities.id("alarmNameError"));

        var timeDiv = document.getElementById("alarmTime");
        var timePicker = new WinJS.UI.TimePicker(timeDiv);
        timePicker.clock = "24HourClock";
        var appButtonSave = document.getElementById("cmdSaveSNA");
        appButtonSave.addEventListener("click", function () {
            navigateTo("save");
        }, false);

        var appButtonCancel = document.getElementById("cmdCancel");
        appButtonCancel.addEventListener("click", function () {
            navigateTo("cancel");
        }, false);

        var appButtonHome = document.getElementById("cmdHomeSNA");
        appButtonHome.addEventListener("click", function () {
            navigateTo("home");
        }, false);

        var saveButton = document.getElementById("saveButton");
        saveButton.addEventListener("click", function () {
            document.getElementById("confirmFlyout").winControl.hide();
            navigateTo("save");
        }, false);

        var dontSaveButton = document.getElementById("dontSaveButton");
        dontSaveButton.addEventListener("click", function () {
            WinJS.Navigation.navigate("/html/currentAlarms.html");
        }, false);

        var alaNoti = document.getElementById("alarmNotifications");
        alaNoti.addEventListener("change", notificationToggleHandler, false);
    }

    function hide() {
        //WinJS.UI.Animation.fadeOut(document.getElementById("cycle"));
    }

    function updateLayout(element, viewState) {
        // TODO: Respond to changes in viewState.
    }

    WinJS.UI.Pages.define("/html/setNewAlarm.html", {
        ready: ready,
        updateLayout: updateLayout
    });

    function navigateTo(buttonId) {
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
        if (buttonId == "save") {
            var alaName = document.getElementById("alarmName").value;
            var alaType = document.getElementById("alarmType");
            alaType = alaType.options[alaType.selectedIndex].value;
            var alaCycle = document.getElementById("alarmCycle");
            var alaCycleValue = alaCycle.options[alaCycle.selectedIndex].value;
            alaCycle = alaCycle.options[alaCycle.selectedIndex].value;
            var alaDate = new Date(document.getElementById("alarmDate").winControl.current);
            alaDate = alaDate.getDate() + " " + month[alaDate.getMonth()] + ", " + alaDate.getFullYear();
            var alaTime = new Date(document.getElementById("alarmTime").winControl.current);

            var alarmDateTime = new Date(alaDate);
            alarmDateTime.setHours(alaTime.getHours());
            alarmDateTime.setMinutes(alaTime.getMinutes());
            alarmDateTime.setSeconds(alaTime.getSeconds());

            alaTime = alaTime.getHours() + ":" + alaTime.getMinutes();
            var alaNoti = document.getElementById("alarmNotifications").winControl;
            alaNoti = alaNoti.checked;
            var alaNotes = document.getElementById("alarmNotes").value;
            var messages;

            if (!alaNoti) {
                alaCycle = "NA";
            }

            if (alaName == "Alarm Name") {
                //messages = new Windows.UI.Popups.MessageDialog("Please enter a valid Alarm name.");
                //messages.showAsync();
                document.getElementById("alarmError").innerText = "Please enter a valid Alarm name.";
                WinJS.UI.Animation.fadeIn(WinJS.Utilities.id("alarmError"));
                setTimeout(function(){
                    WinJS.UI.Animation.fadeOut(WinJS.Utilities.id("alarmError"));
                    if (document.getElementById("alarmError") != null) {
                        document.getElementById("alarmError").innerText = "";
                    }
                }, 10000);
                document.getElementById("alarmName").focus();
                return;
            }

            if (alaName.length > 12) {
                //messages = new Windows.UI.Popups.MessageDialog("Alarm Name length must be less than 12 characters.");
                //messages.showAsync();
                document.getElementById("alarmError").innerText = "Alarm Name length must be less than 12 characters.";
                WinJS.UI.Animation.fadeIn(WinJS.Utilities.id("alarmError"));
                setTimeout(function () {
                    WinJS.UI.Animation.fadeOut(WinJS.Utilities.id("alarmError"));
                    if (document.getElementById("alarmError") != null) {
                        document.getElementById("alarmError").innerText = "";
                    }
                }, 10000);
                document.getElementById("alarmName").focus();
                return;
            }

            if (alarmDateTime <= new Date()) {
                //messages = new Windows.UI.Popups.MessageDialog("Please enter future time!!");
                //messages.showAsync();
                document.getElementById("alarmError").innerText = "Please enter future time";
                WinJS.UI.Animation.fadeIn(WinJS.Utilities.id("alarmError"));
                setTimeout(function () {
                    WinJS.UI.Animation.fadeOut(WinJS.Utilities.id("alarmError"));
                    if (document.getElementById("alarmError") != null) {
                        document.getElementById("alarmError").innerText = "";
                    }
                }, 10000);
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
                var aDT = new Date(alarmDateTime.getTime());

                localFolder.createFolderAsync("AlarmData", Windows.Storage.CreationCollisionOption.openIfExists).then(function (dataFolder) {
                    dataFolder.createFileAsync(alaName.toUpperCase() + ".txt", Windows.Storage.CreationCollisionOption.failIfExists).then(function (file) {
                        return Windows.Storage.FileIO.writeTextAsync(file, alarmData).then(function () {
                            dataFolder.createFileAsync("AlarmsInfo.txt", Windows.Storage.CreationCollisionOption.openIfExists).then(function (alarmInfoFile) {
                                return Windows.Storage.FileIO.appendTextAsync(alarmInfoFile, ";" + alaName.toUpperCase() + "_" + alaType.toUpperCase() + "_" + alaDate);
                            }).done(function () {
                                if (alaNoti) {
                                    var template = Windows.UI.Notifications.ToastTemplateType.toastText04;
                                    var toastXml = Windows.UI.Notifications.ToastNotificationManager.getTemplateContent(template);
                                    var toastTextElements = toastXml.getElementsByTagName("text");
                                    toastTextElements[0].appendChild(toastXml.createTextNode(alaName.toUpperCase()));
                                    toastTextElements[1].appendChild(toastXml.createTextNode(alaType));
                                    toastTextElements[2].appendChild(toastXml.createTextNode(alaDate));


                                    var toastNode = toastXml.selectSingleNode("/toast");
                                    toastNode.setAttribute("duration", "long");

                                    //var audio = toastXml.createElement("audio");
                                    //audio.setAttribute("src", "ms-winsoundevent:Notification.Looping.Alarm");
                                    //audio.setAttribute("loop", "true");
                                    //audio.setAttribute("silent", "false");
                                    //toastNode.appendChild(audio);

                                    var toast = Windows.UI.Notifications.ToastNotification(toastXml);
                                    var toastNotifier = Windows.UI.Notifications.ToastNotificationManager.createToastNotifier();
                                    var scheduledToast;
                                    var month = alarmDateTime.getMonth();
                                    var year = alarmDateTime.getFullYear();
                                    var toastId = alaName;
                                    for (var i = 0; i < noOfToasts; i++) {
                                        if (alaCycleValue == "N") {
                                            scheduledToast = new Windows.UI.Notifications.ScheduledToastNotification(toastXml, alarmDateTime, 300000, 3);
                                            scheduledToast.id = toastId + i;
                                        }
                                        else if (alaCycleValue == "D") {
                                            scheduledToast = new Windows.UI.Notifications.ScheduledToastNotification(toastXml, new Date(alarmDateTime.getTime() + (i * 24 * 60 * 60 * 1000)), 300000, 3);
                                            scheduledToast.id = toastId + i;
                                        }
                                        else if (alaCycleValue == "W") {
                                            scheduledToast = new Windows.UI.Notifications.ScheduledToastNotification(toastXml, new Date(alarmDateTime.getTime() + (i * 7 * 24 * 60 * 60 * 1000)), 300000, 3);
                                            scheduledToast.id = toastId + i;
                                        }
                                        else if (alaCycleValue == "M") {
                                            scheduledToast = new Windows.UI.Notifications.ScheduledToastNotification(toastXml, new Date(alarmDateTime.setMonth(month)), 300000, 3);
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
                                            scheduledToast = new Windows.UI.Notifications.ScheduledToastNotification(toastXml, new Date(alarmDateTime.setFullYear(year)), 300000, 3);
                                            year = year + 1;
                                            scheduledToast.id = toastId + i;
                                        }
                                        toastNotifier.addToSchedule(scheduledToast);
                                    }
                                }

                                var timeLeft = aDT - new Date();
                                var timeLeftString = "Time remaining till alarm: " + Math.floor(timeLeft / (1000 * 60 * 60 * 24)) + " Days ";
                                timeLeft = timeLeft % (1000 * 60 * 60 * 24);

                                timeLeftString = timeLeftString + Math.floor(timeLeft / (1000 * 60 * 60)) + " hours ";
                                timeLeft = timeLeft % (1000 * 60 * 60);

                                timeLeftString = timeLeftString + Math.floor(timeLeft / (1000 * 60)) + "minutes";
                                var alarmCreatedSuccessMessage = new Windows.UI.Popups.MessageDialog(timeLeftString, "Alarm created successfully");
                                alarmCreatedSuccessMessage.showAsync().done(function () {
                                    WinJS.Navigation.back(0);
                                });
                                document.getElementById("cmdSaveSNA").blur();
                            });

                        }).done();
                    },
                    function error(e) {
                        //var badNameErrorMessage = new Windows.UI.Popups.MessageDialog("Alarm name already exists, choose a different name.");
                        //badNameErrorMessage.showAsync();
                        document.getElementById("alarmError").innerText = "Alarm name already exists, choose a different name.";
                        WinJS.UI.Animation.fadeIn(WinJS.Utilities.id("alarmError"));
                        setTimeout(function () {
                            WinJS.UI.Animation.fadeOut(WinJS.Utilities.id("alarmError"));
                            if (document.getElementById("alarmError") != null) {
                                document.getElementById("alarmError").innerText = "";
                            }
                        }, 10000);
                        document.getElementById("alarmName").focus();
                    }).done();
                }).done();
            }
        }
        else if (buttonId == "cancel") {
            var alaName = document.getElementById("alarmName").value;
            if (!(alaName == "Alarm Name" || alaName == "")) {
                var anc = document.getElementById("cmdCancel");
                var flyout = document.getElementById("confirmFlyout");
                showFlyout(flyout, anc, "top");
            }
            else {
                WinJS.Navigation.navigate("/html/currentAlarms.html");
            }
        }
        else if (buttonId == "home") {
            var alaName = document.getElementById("alarmName").value;
            if (!(alaName == "Alarm Name" || alaName == "")) {
                var anc = document.getElementById("cmdHomeSNA");
                var flyout = document.getElementById("confirmFlyout");
                showFlyout(flyout, anc, "top");
            }
            else {
                WinJS.Navigation.navigate("/html/currentAlarms.html");
            }
        }
    }

    function showFlyout(flyout, anchor, placement) {
        document.getElementById("alarmName").focus();
        flyout.winControl.show(anchor, placement);
    }

    function notificationToggleHandler() {
        var alaNoti = document.getElementById("alarmNotifications").winControl;
        alaNoti = alaNoti.checked;
        if (alaNoti) {
            document.getElementById("cycle").style.display = "block";
            //WinJS.UI.Animation.fadeIn(document.getElementById("cycle"));
        }
        else {
            document.getElementById("cycle").style.display = "none";
            document.getElementById("numberForWeekly").style.display = "none";
            document.getElementById("numberForDaily").style.display = "none";
            document.getElementById("alarmCycle").selectedIndex = 0;            
        }
    }

    function clear(textBoxId) {
            console.log("ravi");
            var value = document.getElementById(textBoxId).value;
            if (textBoxId == "alarmName") {
                if (value == "Alarm Name") {
                    document.getElementById(textBoxId).value = "";
                }
            }
            else if (textBoxId == "alarmNotes") {
                if (value == "Add notes....") {
                    document.getElementById(textBoxId).value = "";
                }
            }
        }

        function checkText(textBoxId) {
            var value = document.getElementById(textBoxId).value;
            if (textBoxId == "alarmName") {
                if (value.length == 0) {
                    document.getElementById(textBoxId).value = "Alarm Name";
                }
            }
            else if (textBoxId == "alarmNotes") {
                if (value.length == 0) {
                    document.getElementById(textBoxId).value = "Add notes....";
                }
            }
        }

        function cycleChange() {
            var alaCycle = document.getElementById("alarmCycle");
            alaCycle = alaCycle.options[alaCycle.selectedIndex].value;
            if (alaCycle == "D") {
                document.getElementById("numberForDaily").style.display = "block";
                document.getElementById("numberForWeekly").style.display = "none";
            }
            else if (alaCycle == "W") {
                document.getElementById("numberForWeekly").style.display = "block";
                document.getElementById("numberForDaily").style.display = "none";
            }
            else {
                document.getElementById("numberForWeekly").style.display = "none";
                document.getElementById("numberForDaily").style.display = "none";
            }
        }

    WinJS.Namespace.define("SetNewAlarmNS", {
        navigateTo: navigateTo,
        clear: clear,
        checkText: checkText,
        cycleChange: cycleChange
    });
})();
