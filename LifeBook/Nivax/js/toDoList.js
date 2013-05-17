// For an introduction to the HTML Fragment template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    // This function is called whenever a user navigates to this page. It
    // populates the page elements with the app's data.
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
    var applicationData = Windows.Storage.ApplicationData.current;
    var localFolder = applicationData.localFolder;
    var anc;
    var flyout;

    function ready(element, options) {
        // TODO: Initialize the fragment here.
        WinJS.UI.processAll();

        var taskL = document.getElementById("taskL").winControl;
        taskL.addEventListener("iteminvoked", listTappingHandler, false);

        var toDoListDisplayDiv = document.getElementById("toDoListDisplay").winControl;
        toDoListDisplayDiv.addEventListener("iteminvoked", itemTappingHandler, false);

        var appButtonDelete = document.getElementById("cmdDeleteTDL");
        appButtonDelete.addEventListener("click", function () {
            navigateTo("delete");
        }, false);

        var appButtonEdit = document.getElementById("cmdEditTDL");
        appButtonEdit.addEventListener("click", function () {
            navigateTo("edit");
        }, false);

        var appButtonSave = document.getElementById("cmdSaveTDL");
        appButtonSave.addEventListener("click", function () {
            navigateTo("save");
        }, false);

        var deleteListButton = document.getElementById("deleteListButton");
        deleteListButton.addEventListener("click", deleteList, false);

        var dontDeleteListButton = document.getElementById("dontDeleteListButton");
        dontDeleteListButton.addEventListener("click", function () {
            document.getElementById("confirmListDeleteFlyout").winControl.hide();
            document.getElementById("cmdDeleteTDL").blur();
        }, false);

        WinJS.UI.Animation.fadeOut(WinJS.Utilities.id("cmdDeleteTDL")).done(function () {
            WinJS.Utilities.id("cmdDeleteTDL").setAttribute("disabled", "disabled");
        });
        WinJS.UI.Animation.fadeOut(WinJS.Utilities.id("cmdSaveTDL")).done(function () {
            WinJS.Utilities.id("cmdSaveTDL").setAttribute("disabled", "disabled");
        });
        WinJS.UI.Animation.fadeOut(WinJS.Utilities.id("cmdEditTDL")).done(function () {
            WinJS.Utilities.id("cmdEditTDL").setAttribute("disabled", "disabled");
        });

        loadLeftContainer();
        

    }

    function updateLayout(element, viewState) {
        // TODO: Respond to changes in viewState.
    }

    WinJS.UI.Pages.define("/html/toDoList.html", {
        ready: ready,
        updateLayout: updateLayout
    });

    function loadLeftContainer() {
        var applicationData = Windows.Storage.ApplicationData.current;
        var localFolder = applicationData.localFolder;
        var oneListInfo;
        var listArray = [];

        localFolder.createFolderAsync("ListData", Windows.Storage.CreationCollisionOption.openIfExists).done(function (dataFolder) {
            dataFolder.getFilesAsync().done(function (files) {
                var noOfFiles = files.length;
                if (noOfFiles == 0) {
                    document.getElementById("listError").innerText = "There are no lists to display.";
                }
                else {
                    for (var i = 0; i < noOfFiles; i++) {
                        oneListInfo = {
                            listName: files[i].displayName,
                            creationDate: files[i].dateCreated.getDate() + " " + month[files[i].dateCreated.getMonth()] + ", " + files[i].dateCreated.getFullYear()
                        }
                        listArray.push(oneListInfo);
                    }
                    var dataList = new WinJS.Binding.List(listArray);
                    var taskL = document.getElementById("taskL").winControl;
                    taskL.itemDataSource = dataList.dataSource;

                    
                    //WinJS.UI.ListView().forceLayout
                    if (appNameSpace.savedListIndex >= 0) {
                        taskL.selection.add(appNameSpace.savedListIndex);
                        loadListDataAfterSave(appNameSpace.savedListIndex);
                        document.getElementById("cmdSaveTDL").blur();
                    }
                    else {
                        document.getElementById("listError").innerText = "Tap on a list to display its contents.";
                    }
                }
            });
        }, function error(e) {
        });
    }

    function itemTappingHandler(eventInfo) {
        var tappedIndex = eventInfo.detail.itemIndex;
        var toDoListDisplayDiv = document.getElementById("toDoListDisplay").winControl;
        var selectedIndexes = toDoListDisplayDiv.selection.getIndices();
        var len = selectedIndexes.length;
        var flag = 0;

        if (len != 0) {
            for (var i = 0; i < len; i++) {
                if (selectedIndexes[i] == tappedIndex) {
                    flag = 1;
                    break;
                }
            }
        }
        if (flag == 1) {
            toDoListDisplayDiv.selection.remove(tappedIndex);
        }
        else {
            toDoListDisplayDiv.selection.add(tappedIndex);
        }
    }

    function loadListDataAfterSave(index) {
        document.getElementById("listError").innerText = "Tap on a task to mark it as complete or incomplete and click save.";
        var taskL = document.getElementById("taskL").winControl;
        var listName = document.getElementById("listName").innerText
        var taskFileName = listName + ".txt";
        var taskInfoArray = [];
        var oneTaskInfo;
        localFolder.getFolderAsync("ListData").then(function (dataFolder) {
            dataFolder.getFileAsync(taskFileName).then(function (file) {
                Windows.Storage.FileIO.readTextAsync(file).then(function (fileData) {
                    if (fileData.length != 0) {
                        fileData = fileData.substring(0, fileData.length - 1);
                        var taskNames = fileData.split(";");
                        var indexes = [];
                        for (var i = 0; i < taskNames.length; i++) {
                            if (taskNames[i].indexOf("*") == 0) {
                                taskNames[i] = taskNames[i].substr(1, taskNames[i].length - 1);
                                indexes.push(i);
                                oneTaskInfo = {
                                    taskName: taskNames[i],
                                    taskStatus: "completed"
                                }
                            }
                            else {
                                oneTaskInfo = {
                                    taskName: taskNames[i],
                                    taskStatus: ""
                                }
                            }
                            taskInfoArray.push(oneTaskInfo);
                        }
                        var dataList = new WinJS.Binding.List(taskInfoArray);
                        var tasksList = document.getElementById("toDoListDisplay").winControl;
                        tasksList.itemDataSource = dataList.dataSource;
                        for (var i = 0; i < indexes.length; i++) {
                            tasksList.selection.add(indexes[i]);
                        }
                    }
                });
            });
        });
    }

    function listTappingHandler(eventInfo) {
        WinJS.Namespace.define("appNameSpace", { savedListIndex: eventInfo.detail.itemIndex });

        document.getElementById("listError").innerText = "Tap on a task to mark it as complete or incomplete and click save.";
        document.getElementById("hrTDL").style.visibility = "visible";
        var taskL = document.getElementById("taskL").winControl;
        var listName = taskL.elementFromIndex(eventInfo.detail.itemIndex).getElementsByTagName('H2').item(0).innerText;
        document.getElementById("listName").innerText = listName;
        var taskFileName = listName + ".txt";
        var taskInfoArray = [];
        var oneTaskInfo;

        localFolder.getFolderAsync("ListData").then(function (dataFolder) {
            dataFolder.getFileAsync(taskFileName).then(function (file) {
                Windows.Storage.FileIO.readTextAsync(file).then(function (fileData) {
                    if (fileData.length != 0) {
                        fileData = fileData.substring(0, fileData.length - 1);
                        var taskNames = fileData.split(";");
                        var indexes = [];
                        for (var i = 0; i < taskNames.length; i++) {
                            if (taskNames[i].indexOf("*") == 0) {
                                taskNames[i] = taskNames[i].substr(1, taskNames[i].length - 1);
                                indexes.push(i);
                                oneTaskInfo = {
                                    taskName: taskNames[i],
                                    taskStatus: "Completed"
                                }
                            }
                            else {
                                oneTaskInfo = {
                                    taskName: taskNames[i],
                                    taskStatus: ""
                                }
                            }
                            taskInfoArray.push(oneTaskInfo);
                        }
                        var dataList = new WinJS.Binding.List(taskInfoArray);
                        var tasksList = document.getElementById("toDoListDisplay").winControl;
                        tasksList.itemDataSource = dataList.dataSource;
                        for (var i = 0; i < indexes.length; i++) {
                            tasksList.selection.add(indexes[i]);
                        }
                    }
                    WinJS.UI.Animation.fadeIn(WinJS.Utilities.id("cmdDeleteTDL")).done(function () {
                        document.getElementById("cmdDeleteTDL").removeAttribute("disabled");
                    });
                    WinJS.UI.Animation.fadeIn(WinJS.Utilities.id("cmdSaveTDL")).done(function () {
                        document.getElementById("cmdSaveTDL").removeAttribute("disabled");
                    });
                    WinJS.UI.Animation.fadeIn(WinJS.Utilities.id("cmdEditTDL")).done(function () {
                        document.getElementById("cmdEditTDL").removeAttribute("disabled");
                    });
                });
            });
        });
        taskL.selection.clear();
        taskL.selection.add(eventInfo.detail.itemIndex);
    }

    function navigateTo(buttonId) {
        var selectList = document.getElementById("taskLists");
        if (buttonId == "edit") {
            WinJS.Namespace.define("appNameSpace", { savedListIndex: -1 });
            var listName = document.getElementById("listName").innerText;
            WinJS.Namespace.define("appNameSpace", { listName: listName });
            WinJS.Navigation.navigate("/html/editList.html");            
        }

        else if (buttonId == "delete") {
            anc = document.getElementById("cmdDeleteTDL");
            flyout = document.getElementById("confirmListDeleteFlyout");
            showFlyout(flyout, anc, "bottom");
        }

        else if (buttonId == "newList") {
            WinJS.Namespace.define("appNameSpace", { savedListIndex: -1 });
            WinJS.Navigation.navigate("/html/createNewList.html");
        }

        else if (buttonId == "save") {
            var tasksList = document.getElementById("toDoListDisplay").winControl;
            var selectedIndexes = tasksList.selection.getIndices();
            var len = selectedIndexes.length;
            var taskFileName = document.getElementById("listName").innerText + ".txt";

            //if (len != 0) {
                var taskListLength = tasksList.itemDataSource.list.length;
                var taskListDataToWriteToFile = "";
                for (var i = 0; i < taskListLength; i++) {
                    if (selectedIndexes.indexOf(i) != -1) {
                        taskListDataToWriteToFile = taskListDataToWriteToFile + "*" + tasksList.itemDataSource.list.getAt(i).taskName + ";";
                    }
                    else {
                        taskListDataToWriteToFile = taskListDataToWriteToFile + tasksList.itemDataSource.list.getAt(i).taskName + ";";
                    }
                }
                localFolder.createFolderAsync("ListData", Windows.Storage.CreationCollisionOption.openIfExists).then(function (dataFolder) {
                    dataFolder.createFileAsync(taskFileName, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                        return Windows.Storage.FileIO.writeTextAsync(file, taskListDataToWriteToFile).done(function () {
                            //var listSavedSuccessMessage = new Windows.UI.Popups.MessageDialog("List saved successfully");
                            //listSavedSuccessMessage.showAsync();
                            anc = document.getElementById("cmdSaveTDL");
                            flyout = document.getElementById("listSavedFlyout");
                            showFlyout(flyout, anc, "bottom");
                            setTimeout(function () {
                                if (document.getElementById("listSavedFlyout") != null) {
                                    document.getElementById("listSavedFlyout").winControl.hide();
                                    document.getElementById("cmdSaveTDL").blur();
                                }
                            }, 3000);
                            loadLeftContainer();
                            document.getElementById("cmdSaveTDL").blur();
                        });

                    },
                    function error(e) {
                        var badNameErrorMessage = new Windows.UI.Popups.MessageDialog("List name already exists, choose a different name.");
                        badNameErrorMessage.showAsync();
                    }).done();
                });
            //}
        }
        else {
        }
    }

    function showFlyout(flyout, anchor, placement) {
        document.getElementById("listName").focus();
        flyout.winControl.show(anchor, placement);
    }

    function deleteList() {
        var taskFileName = document.getElementById("listName").innerText + ".txt";
        localFolder.getFolderAsync("ListData").then(function (dataFolder) {
            dataFolder.getFileAsync(taskFileName).then(function (file) {
                file.deleteAsync().done(function () {
                    WinJS.Namespace.define("appNameSpace", { savedListIndex: -1 });
                    WinJS.Navigation.navigate("/html/toDoList.html");
                });
            });
        });
    }

    WinJS.Namespace.define("ToDoListNS", {
        navigateTo: navigateTo
    });
})();
