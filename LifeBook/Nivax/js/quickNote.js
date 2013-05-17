// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/html/quickNote.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            var notesGridDiv = document.getElementById("notesGrid").winControl;
            notesGridDiv.addEventListener("iteminvoked", noteOptions, false);

            var svQckNt = document.getElementById("saveQuickNote");
            svQckNt.addEventListener("click", saveNote, false);

            var cnclQckNt = document.getElementById("cancelQuickNote");
            cnclQckNt.addEventListener("click", cancelNote, false);

            var rfrshBtn = document.getElementById("refreshButton");
            rfrshBtn.addEventListener("click", refresh, false);

            var edtNt = document.getElementById("editNote");
            edtNt.addEventListener("click", editNote, false);

            var dltNt = document.getElementById("deleteNote");
            dltNt.addEventListener("click", deleteNote, false);

            var edNtCncl = document.getElementById("editNoteCancel");
            edNtCncl.addEventListener("click", cancelNoteEdit, false);

            var edNtSv = document.getElementById("editNoteSave");
            edNtSv.addEventListener("click", saveEditedNote, false);

            loadNotes();
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }
    });

    function refresh() {
        loadNotes();
    }

    var applicationData = Windows.Storage.ApplicationData.current;
    var localFolder = applicationData.localFolder;

    function loadNotes() {        
        var noteInfo;
        var notesArray = [];

        localFolder.createFolderAsync("NotesData", Windows.Storage.CreationCollisionOption.openIfExists).done(function (dataFolder) {
            dataFolder.getFilesAsync().done(function (allNotes) {
                var length = allNotes.size;
                var noteText = "";
                var i = 0;
                var arr = [];
                if (length != 0) {
                    for (i = 0; i < length; i++) {
                        Windows.Storage.FileIO.readTextAsync(allNotes[i]).then(function (noteFileText) {
                            arr = noteFileText.split("|");
                            noteInfo = {
                                noteText: arr[0],
                                noteDate: "30 Oct, 2012",
                                noteFileName: arr[1]
                            }
                            notesArray.push(noteInfo);
                        }).done(function () {
                            WinJS.Namespace.define("QuickNotesNS", {
                                notesArray: notesArray
                            });
                            if (i == length) {
                                var dataList = new WinJS.Binding.List(QuickNotesNS.notesArray);
                                var notesList = document.getElementById("notesGrid").winControl;
                                notesList.itemDataSource = dataList.dataSource;
                            }
                        });
                    }
                }
                else {
                    WinJS.Namespace.define("QuickNotesNS", {
                        notesArray: []
                    });
                    var dataList = new WinJS.Binding.List(QuickNotesNS.notesArray);
                    var notesList = document.getElementById("notesGrid").winControl;
                    notesList.itemDataSource = dataList.dataSource;
                }                
            });
        });
    }

    function addNewNote() {
        document.getElementById("note").innerText = "";
        var anc = document.getElementById("addNote");
        flyout = document.getElementById("newNoteFlyout");
        showFlyout(flyout, anc, "bottom");
    }

    function saveNote() {
        localFolder.createFolderAsync("NotesData", Windows.Storage.CreationCollisionOption.openIfExists).done(function (dataFolder) {
            var count = 0;
            dataFolder.getFilesAsync().done(function (files) {
                count = files.size;
                count = count + 1;
                dataFolder.createFileAsync(count + ".txt", Windows.Storage.CreationCollisionOption.replaceExisting).done(function (noteFile) {
                    return Windows.Storage.FileIO.writeTextAsync(noteFile, document.getElementById("note").innerText + "|" + count).then(function () {
                        flyout = document.getElementById("newNoteFlyout").winControl;
                        flyout.hide();
                        //WinJS.Navigation.navigate("/html/quickNote.html");
                    }).done(function () {
                        loadNotes();
                    });
                });
            });
        });
    }

    function cancelNote() {
        flyout = document.getElementById("newNoteFlyout").winControl;
        flyout.hide();
    }

    function editNote() {
        var notesGrid = document.getElementById("notesGrid").winControl;
        var anc = notesGrid.elementFromIndex(QuickNotesNS.clickedItem);
        flyout = document.getElementById("editNoteFlyout");
        var note = notesGrid.elementFromIndex(QuickNotesNS.clickedItem).getElementsByTagName('div').item(1).innerText;
        document.getElementById("editNoteText").innerText = note;
        showFlyout(flyout, anc, "right");
    }

    function deleteNote() {
        var noteIndex = QuickNotesNS.clickedItem;
        var notesGrid = document.getElementById("notesGrid").winControl;
        var fileName = notesGrid.elementFromIndex(noteIndex).getElementsByTagName('H6').item(0).innerText + ".txt";
        localFolder.createFolderAsync("NotesData", Windows.Storage.CreationCollisionOption.openIfExists).done(function (dataFolder) {
            dataFolder.getFileAsync(fileName).done(function (file) {
                var cnfrmDlt = new Windows.UI.Popups.MessageDialog("Are you sure you want to delete this note?");
                cnfrmDlt.commands.append(new Windows.UI.Popups.UICommand("Delete", function () {
                    file.deleteAsync(Windows.Storage.StorageDeleteOption.permanentDelete).done(function () {
                        loadNotes();
                    });
                }, cnfrmDlt));
                cnfrmDlt.commands.append(new Windows.UI.Popups.UICommand("Don't Delete", function () { }, cnfrmDlt));
                cnfrmDlt.showAsync();
            });
        });
    }

    function saveEditedNote() {
        var noteIndex = QuickNotesNS.clickedItem;
        var notesGrid = document.getElementById("notesGrid").winControl;
        var fileName = notesGrid.elementFromIndex(noteIndex).getElementsByTagName('H6').item(0).innerText;
        localFolder.createFolderAsync("NotesData", Windows.Storage.CreationCollisionOption.openIfExists).done(function (dataFolder) {
            dataFolder.createFileAsync(fileName + ".txt", Windows.Storage.CreationCollisionOption.replaceExisting).done(function (file) {
                return Windows.Storage.FileIO.writeTextAsync(file, document.getElementById("editNoteText").innerText + "|" + fileName).then(function () {
                    flyout = document.getElementById("editNoteFlyout").winControl;
                    flyout.hide();
                }).done(function () {
                    loadNotes();
                });
            });
        });
    }

    function cancelNoteEdit() {
        flyout = document.getElementById("editNoteFlyout").winControl;
        flyout.hide();
    }

    var flyout;

    function noteOptions(eventInfo) {
        WinJS.Namespace.define("QuickNotesNS", {
            clickedItem: eventInfo.detail.itemIndex
        });
        var anc = document.getElementById("notesGrid").winControl.elementFromIndex(eventInfo.detail.itemIndex);
        flyout = document.getElementById("noteOptionsFlyout");
        showFlyout(flyout, anc, "top");
    }

    function showFlyout(flyout, anchor, placement) {
        flyout.winControl.show(anchor, placement);
    }

    WinJS.Namespace.define("QuickNotesNS", {
        addNewNote: addNewNote
    });
})();
