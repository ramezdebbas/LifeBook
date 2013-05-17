// For an introduction to the HTML Fragment template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    // This function is called whenever a user navigates to this page. It
    // populates the page elements with the app's data.
    function ready(element, options) {
        // TODO: Initialize the fragment here.
        WinJS.UI.processAll();
        var appButtonAddTask = document.getElementById("cmdAddTask");
        appButtonAddTask.addEventListener("click", addItem, false);

        var appButtonRemoveTask = document.getElementById("cmdRemoveTask");
        appButtonRemoveTask.addEventListener("click", removeItem, false);

        var appButtonCancel = document.getElementById("cmdCancelCNL");
        appButtonCancel.addEventListener("click", function () {
            navigateTo("cancel");
        }, false);

        var appButtonCreate = document.getElementById("cmdCreateCNL");
        appButtonCreate.addEventListener("click", function () {
            navigateTo("createList");
        }, false);
    }

    function updateLayout(element, viewState) {
        // TODO: Respond to changes in viewState.
    }

    WinJS.UI.Pages.define("/html/createNewList.html", {
        ready: ready,
        updateLayout: updateLayout
    });

    function addItem() {
        var item = document.getElementById("listItem").value;
        if (item == "") {
            //var itemRequired = new Windows.UI.Popups.MessageDialog("Please enter a Task!!!");
            //itemRequired.showAsync();
            document.getElementById("createNewListError").innerText = "Please enter a task to add to list";
            document.getElementById("listItem").focus();
        }
        else {
            document.getElementById("createNewListError").innerText = "";
            var itemsList = document.getElementById("taskList").winControl;
            itemsList.itemDataSource.insertAtEnd(item, { taskName: item });
            document.getElementById("listItem").value = "";
            document.getElementById("listItem").focus();
        }
    }

    function removeItem() {
        var itemsList = document.getElementById("taskList").winControl;
        var selectedIndexes = itemsList.selection.getIndices();
        if (selectedIndexes.length == 0) {
            //var itemRequired = new Windows.UI.Popups.MessageDialog("Please select at least one item to delete.");
            //itemRequired.showAsync();
            document.getElementById("createNewListError").innerText = "Please select at least one item to delete";
            document.getElementById("listItem").focus();
        }
        else {
            document.getElementById("createNewListError").innerText = "";
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
                document.getElementById("createNewListError").innerText = "Please enter a task to add to list";
            }
            else {
                document.getElementById("createNewListError").innerText = "";
                var itemsList = document.getElementById("taskList").winControl;
                itemsList.itemDataSource.insertAtEnd(item, { taskName: item });
                document.getElementById("listItem").value = "";
            }
        }
    }

    function navigateTo(buttonId) {
        if (buttonId == "createList") {
            var applicationData = Windows.Storage.ApplicationData.current;
            var localFolder = applicationData.localFolder;

            var listName = document.getElementById("listName").value;
            if (listName == "" || listName.length == 0 || listName == "List Name") {
                //var listNameRequired = new Windows.UI.Popups.MessageDialog("Please enter a name for the task list.");
                //listNameRequired.showAsync();
                document.getElementById("createNewListError").innerText = "Please enter a name for the task list.";
                document.getElementById("listName").focus();
            }
            else {
                document.getElementById("createNewListError").innerText = "";
                var itemsList = document.getElementById("taskList").winControl;
                var taskListLength = itemsList.itemDataSource.list.length;
                var taskListDataToWriteToFile = "";
                for (var i = 0; i < taskListLength; i++) {
                    taskListDataToWriteToFile = taskListDataToWriteToFile + itemsList.itemDataSource.list.getAt(i).taskName + ";";
                }
                localFolder.createFolderAsync("ListData", Windows.Storage.CreationCollisionOption.openIfExists).then(function (dataFolder) {
                    dataFolder.createFileAsync(listName + ".txt", Windows.Storage.CreationCollisionOption.failIfExists).then(function (file) {
                        return Windows.Storage.FileIO.writeTextAsync(file, taskListDataToWriteToFile).done(function () {
                            var alarmCreatedSuccessMessage = new Windows.UI.Popups.MessageDialog("List created successfully.");
                            
                            alarmCreatedSuccessMessage.showAsync().done(function () {
                                WinJS.Navigation.navigate("/html/toDoList.html");
                            });
                            document.getElementById("cmdCreateCNL").blur();
                        });

                    },
                             function error(e) {
                                 //var badNameErrorMessage = new Windows.UI.Popups.MessageDialog("List name already exists, choose a different name.");
                                 //badNameErrorMessage.showAsync();
                                 document.getElementById("createNewListError").innerText = "List name already exists, choose a different name.";
                                 document.getElementById("listName").focus();
                             }).done();
                });
            }
        }
        else if (buttonId == "cancel") {
            WinJS.Navigation.navigate("/html/toDoList.html");
        }
        else {
            
        }
    }

    function clear(textBoxId) {
        var value = document.getElementById(textBoxId).value;
        if (textBoxId == "listName") {
            if (value == "List Name") {
                document.getElementById(textBoxId).value = "";
            }
        }
    }

    function checkText(textBoxId) {
        var value = document.getElementById(textBoxId).value;
        if (textBoxId == "listName") {
            if (value.length == 0) {
                document.getElementById(textBoxId).value = "List Name";
            }
        }
    }

    WinJS.Namespace.define("CreateNewListNS", {
        addItem: addItem,
        removeItem: removeItem,
        handleEnter: handleEnter,
        clear: clear,
        checkText: checkText,
        navigateTo: navigateTo
    });
})();