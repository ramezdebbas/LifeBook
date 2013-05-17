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
        var listName = appNameSpace.listName + ".txt";
        var taskInfoArray = [];
        var oneTaskInfo;

        document.getElementById("listName").innerText = appNameSpace.listName;

        localFolder.getFolderAsync("ListData").then(function (dataFolder) {
            dataFolder.getFileAsync(listName).then(function (file) {
                Windows.Storage.FileIO.readTextAsync(file).then(function (fileData) {
                    if (fileData.length != 0) {
                        fileData = fileData.substring(0, fileData.length - 1);
                        var taskNames = fileData.split(";");
                        var completedItems = [];
                        for (var i = 0; i < taskNames.length; i++) {
                            if (taskNames[i].indexOf("*") == 0) {
                                taskNames[i] = taskNames[i].substr(1, taskNames[i].length - 1);
                                completedItems.push(taskNames[i]);
                            }
                            oneTaskInfo = {
                                taskName: taskNames[i]
                            }
                            taskInfoArray.push(oneTaskInfo);
                        }
                        var dataList = new WinJS.Binding.List(taskInfoArray);
                        var tasksList = document.getElementById("taskList").winControl;
                        tasksList.itemDataSource = dataList.dataSource;
                        WinJS.Namespace.define("appNameSpace", { completedItems: completedItems });
                        //for (var i = 0; i < indexes.length; i++) {
                        //    tasksList.selection.add(indexes[i]);
                        //}
                    }
                });
            });
        });

        var appButtonAddTask = document.getElementById("cmdAddTask");
        appButtonAddTask.addEventListener("click", addItem, false);

        var appButtonRemoveTask = document.getElementById("cmdRemoveTask");
        appButtonRemoveTask.addEventListener("click", removeItem, false);

        var appButtonCancel = document.getElementById("cmdCancelEL");
        appButtonCancel.addEventListener("click", function () {
            navigateTo("cancel");
        }, false);

        var appButtonUpdate = document.getElementById("cmdUpdateEL");
        appButtonUpdate.addEventListener("click", function () {
            navigateTo("updateList");
        }, false);
    }

    function updateLayout(element, viewState) {
        // TODO: Respond to changes in viewState.
    }

    WinJS.UI.Pages.define("/html/editList.html", {
        ready: ready,
        updateLayout: updateLayout
    });

    function addItem() {
        var item = document.getElementById("listItem").value;
        if (item == "") {
            //var itemRequired = new Windows.UI.Popups.MessageDialog("Please enter a Task!!!");
            //itemRequired.showAsync();
            document.getElementById("editListError").innerText = "Please enter a task to add to list";
            document.getElementById("listItem").focus();
        }
        else {
            document.getElementById("editListError").innerText = "";
            var itemsList = document.getElementById("taskList").winControl;
            itemsList.itemDataSource.insertAtEnd(item, { taskName: item });
            document.getElementById("listItem").value = "";
        }
    }

    function removeItem() {
        var itemsList = document.getElementById("taskList").winControl;
        var selectedIndexes = itemsList.selection.getIndices();
        if (selectedIndexes.length == 0) {
            //var itemRequired = new Windows.UI.Popups.MessageDialog("Please select at least one item to delete.");
            //itemRequired.showAsync();
            document.getElementById("editListError").innerText = "Please select at least one item to delete";
            document.getElementById("listItem").focus();
        }
        else {
            document.getElementById("editListError").innerText = "";
            var keysToDelete = [];
            for (var i = 0; i < selectedIndexes.length; i++) {
                var key = itemsList.itemDataSource.list.getItem(selectedIndexes[i]).key;
                keysToDelete.push(key);
            }
            for (var i = 0; i < keysToDelete.length; i++) {
                itemsList.itemDataSource.remove(keysToDelete[i]);
            }
        }
    }

    function handleEnter(inField, e) {
        var charCode;

        if (e && e.which) {
            charCode = e.which;
        } else if (window.event) {
            e = window.event;
            charCode = e.keyCode;
        }

        if (charCode == 13) {
            var item = document.getElementById("listItem").value;
            if (item == "") {
                //var itemRequired = new Windows.UI.Popups.MessageDialog("Please enter a Task!!!");
                //itemRequired.showAsync();
                document.getElementById("editListError").innerText = "Please enter a task to add to list";
                document.getElementById("listItem").focus();
            }
            else {
                document.getElementById("editListError").innerText = "";
                var itemsList = document.getElementById("taskList").winControl;
                itemsList.itemDataSource.insertAtEnd(null, { taskName: item });
                document.getElementById("listItem").value = "";
            }
        }
    }

    function navigateTo(buttonId) {
        if (buttonId == "updateList") {
            var applicationData = Windows.Storage.ApplicationData.current;
            var localFolder = applicationData.localFolder;

            var listName = appNameSpace.listName + ".txt";
            var itemsList = document.getElementById("taskList").winControl;
            var taskListLength = itemsList.itemDataSource.list.length;
            var taskListDataToWriteToFile = "";
            var comTasks = appNameSpace.completedItems;
            console.log("Len" + taskListLength);
            for (var i = 0; i < taskListLength; i++) {
                if (comTasks.indexOf(itemsList.itemDataSource.list.getAt(i).taskName) != -1) {
                    taskListDataToWriteToFile = taskListDataToWriteToFile + "*" + itemsList.itemDataSource.list.getAt(i).taskName + ";";
                }
                else {
                    taskListDataToWriteToFile = taskListDataToWriteToFile + itemsList.itemDataSource.list.getAt(i).taskName + ";";
                }
            }
            localFolder.createFolderAsync("ListData", Windows.Storage.CreationCollisionOption.openIfExists).then(function (dataFolder) {
                dataFolder.createFileAsync(listName, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                    return Windows.Storage.FileIO.writeTextAsync(file, taskListDataToWriteToFile).done(function () {
                        var listUpdatedSuccessMessage = new Windows.UI.Popups.MessageDialog("List updated successfully.");
                        listUpdatedSuccessMessage.showAsync().done(function () {
                            WinJS.Navigation.navigate("/html/toDoList.html");
                        });
                        document.getElementById("cmdUpdateEL").blur();
                    });

                },
                function error(e) {
                    var badNameErrorMessage = new Windows.UI.Popups.MessageDialog("List name already exists, choose a different name.");
                    badNameErrorMessage.showAsync();
                }).done();
            });

        }
        else if (buttonId == "cancel") {
            WinJS.Navigation.navigate("/html/toDoList.html");
        }
        else {
        }
    }

    WinJS.Namespace.define("EditListNS", {
        addItem: addItem,
        removeItem: removeItem,
        handleEnter: handleEnter,
        navigateTo: navigateTo
    });
})();
