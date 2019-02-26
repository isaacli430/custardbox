//    ____          _                _ ____            
//   / ___|   _ ___| |_ __ _ _ __ __| | __ )  _____  __
//  | |  | | | / __| __/ _` | '__/ _` |  _ \ / _ \ \/ /
//  | |__| |_| \__ \ || (_| | | | (_| | |_) | (_) >  < 
//   \____\__,_|___/\__\__,_|_|  \__,_|____/ \___/_/\_\      
//                              -Inspired by WhiteBox

(function () {
    window.socket = io.connect('http://128.199.103.165:8080');
    // window.socket = io.connect('http://localhost:8080');
    $("#files").on("change", handleFileSelect);
    $("#filePickerButton").click(function () {
        $("#files").click();
    })

    // Make link open in new tab

    socket.on("connected", function () {
        login();
    });

    var validator;

    $("#backButton").on("click", goBack);
    $("#sendButton").on("click", sendMessage);
    $("#setBackgroundOffsetsButton").on("click", setBackgroundOffsets);


    // Delete Account
    $("#deleteAccountButton").on("click", promptDeleteAccount);
    $("#confirmDeleteAccBtn").on("click", deleteAccount);

    // Change Username
    $("#changeUsernameButton").on("click", promptChangeUsername);
    $("#confirmChangeUsernameBtn").on("click", changeUsername);

    // Chat settings
    $("#messagePageSettingsBtn").on("click", chatSettings);

    // Logout
    $("#logoutButton").on("click", logout);

    // Unfriend friend
    $("#promptUnfriendFriendBtn").on("click", confirmUnfriendModal);
    $("#unfriendFriendBtn").on("click", unfriendFriend);

    // Search users
    $("#userSearchBtn").on("click", searchUsers);

    // Scroll down btn
    $("#scrollDownBtn").on("click", scrollDown);

    $("#unfriendFriendBtn").on("click", unfriendFriend);
    $("#lightThemeBtn").on("click", setLightTheme);
    $("#darkThemeBtn").on("click", setDarkTheme);
    $("#testThemeUpdateBtn").on("click", updateTestTheme);

    // Hide notifications
    $("#notificationDiv").hide();
    // Notification Timeout
    var notificationTimeout;

    var userInputElement = $("#userInput");
    var usersElement = $("#users");
    var aboutButtonElement = $("#aboutButton");
    var backButtonElement = $("#backButton");
    var messagePageElement = $("#messagePage");
    var mainTabs = $("#mainTabs");
    var discordId;

    // Login
    var softwareVersion = chrome.runtime.getManifest().version;
    $("#aboutPageSoftwareVersion").text("Version: " + softwareVersion);

    hideEverything();
    mainTabs.show();
    aboutButtonElement.show();

    var backgroundWidth;
    var backgroundHeight;
    var backgroundXOffset;
    var backgroundYOffset;

    var backgroundEnabled;
    var currGlobalTheme;
    var currChannel;
    var channelIds;

    chrome.storage.local.get(["theme"], function (e) {
        currGlobalTheme = e.theme;
    });

    var xSlider = document.getElementById("xBackground");
    var ySlider = document.getElementById("yBackground");
    xSlider.onchange = changeBackgroundPos;
    ySlider.onchange = changeBackgroundPos;
    var currChannelMembers;


    setInterval(refreshBackground, 1000);
    setInterval(checkConnection, 5000);

    chrome.storage.local.get(["theme"], function (result) {
        if (result.theme === "light") {
            setLightTheme();
        }
        else if (result.theme === "dark") {
            setDarkTheme();
        }
        else if (result.theme != null) {
            setCustomTheme(result.theme);
        }
    });

    chrome.storage.local.get(["backgroundEnabled"], function (result) {
        if (result["backgroundEnabled" == ""]) {
            chrome.storage.local.set({ backgroundEnabled: false });
            backgroundEnabled = false;
        }
        else if (result.backgroundEnabled) {
            backgroundEnabled = true;

            setLightTheme();
            chrome.storage.local.get(["backgroundXOffset"], function (result) {
                backgroundXOffset = result.backgroundXOffset;
                chrome.storage.local.get(["backgroundYOffset"], function (result) {
                    backgroundYOffset = result.backgroundYOffset;
                    chrome.tabs.captureVisibleTab(function (dataUrl) {
                        document.body.style.backgroundImage = "url(" + dataUrl + ")";

                        var backgroundImage = new Image();
                        backgroundImage.src = dataUrl;
                        backgroundImage.onload = function () {
                            backgroundWidth = parseInt(this.width);
                            backgroundHeight = parseInt(this.height);
                            document.body.style.backgroundPosition = backgroundXOffset + "px " + backgroundYOffset + "px";
                            xSlider.value = (backgroundXOffset + backgroundWidth - 100) % 600;
                            ySlider.value = (backgroundYOffset + 300) % 600;
                        };
                    });
                });
            });
        }
        else {
            backgroundEnabled = false;
            xSlider.disabled = true;
            ySlider.disabled = true;
            $("#setBackgroundOffsetsButton").toggleClass("disabled", true);
        }
    });

    var previousPage;
    var username;
    var userData;
    var users;
    var clickedName;
    var clickedChat = {};
    var randomKey = "not used"; //get rid of this
    var numOfFriendRequests;
    var friends;
    var groups;
    var userId;
    var timeUntilNewHeader = 600000;
    var messageBufferDistance = 0; // Distance in px when to start loading previous messages
    var maxUsernameLength = 25;
    var discordMessages = {};
    var currServerId;

    function getMessages(channelId, type) {
        if (type == "load") {
            if (channelIds == undefined) {
                socket.emit('getDMs', { token: validator, userId: channelId });
                channelIds = undefined;
                currServerId = undefined;
            } else if (channelId in channelIds) {
                socket.emit('getMessages', { token: validator, channelId: channelId, serverId: currServerId });
            } else {
                socket.emit('getDMs', { token: validator, userId: channelId });
                channelIds = undefined;
                currServerId = undefined;
            }
        } else if (type == "refresh") {
            if (currServerId == undefined) {
                return discordMessages[channelId];
            }
            return discordMessages[currServerId][channelId];
        }
    }

    socket.on('gotMessages', function (reply) {
        discordMessages[currServerId] = {};
        discordMessages[currServerId][reply.channelId] = reply.messages;
        refreshMessagePage(reply.channelId, "refresh");
    });

    socket.on('gotDMs', function (reply) {
        currChannelMembers = reply.members;
        discordMessages[reply.userId] = reply.messages;
        refreshMessagePage(reply.userId, "refresh");
    });

    function hideEverything() {
        userInputElement.hide();
        messagePageElement.hide();
        aboutButtonElement.show();
        backButtonElement.hide();
        mainTabs.hide();
    }

    function setLightTheme() {
        less.modifyVars({
            '@theme': 'light'
        });
        chrome.storage.local.set({ theme: "light" });
        chrome.storage.local.get(["theme"], function (e) {
            currGlobalTheme = e.theme;
        });
    }

    function setDarkTheme() {
        less.modifyVars({
            '@theme': 'dark'
        });
        chrome.storage.local.set({ theme: "dark" });
        chrome.storage.local.get(["theme"], function (e) {
            currGlobalTheme = e.theme;
        });
    }

    function setCustomTheme(shortCustomThemeName) {
        $("#customThemePromptModal").modal("hide");

        chrome.storage.local.get(["customThemes"], function (result) {
            var customThemeName = shortCustomThemeName + "-customTheme";

            var theme1 = result.customThemes[customThemeName].theme1;
            var theme2 = result.customThemes[customThemeName].theme2;
            var theme3 = result.customThemes[customThemeName].theme3;
            var theme4 = result.customThemes[customThemeName].theme4;
            var theme5 = result.customThemes[customThemeName].theme5;
            var theme6 = result.customThemes[customThemeName].theme6;

            less.modifyVars({
                "@theme": "custom",
                "@theme1": theme1,
                "@theme2": theme2,
                "@theme3": theme3,
                "@theme4": theme4,
                "@theme5": theme5,
                "@theme6": theme6
            });

            chrome.storage.local.set({ theme: shortCustomThemeName });
        });
    }

    function customThemePrompt(shortCustomThemeName) {
        $("#editCustomThemeBtn").attr("data-shortCustomThemeName", shortCustomThemeName);
        $("#setCustomThemeBtn").attr("data-shortCustomThemeName", shortCustomThemeName);

        document.getElementById("editCustomThemeBtn").onclick = function () { editCustomTheme(this.getAttribute("data-shortCustomThemeName")); };
        document.getElementById("setCustomThemeBtn").onclick = function () { setCustomTheme(this.getAttribute("data-shortCustomThemeName")); };

        $("#customThemePromptModal").modal("show");
    }

    function editCustomTheme(shortCustomThemeName) {
        chrome.storage.local.get(["customThemes"], function (result) {
            var customThemeName = shortCustomThemeName + "-customTheme";

            var theme1 = result.customThemes[customThemeName].theme1;
            var theme2 = result.customThemes[customThemeName].theme2;
            var theme3 = result.customThemes[customThemeName].theme3;
            var theme4 = result.customThemes[customThemeName].theme4;
            var theme5 = result.customThemes[customThemeName].theme5;
            var theme6 = result.customThemes[customThemeName].theme6;

            $("#testTheme1").val(theme1);
            $("#testTheme2").val(theme2);
            $("#testTheme3").val(theme3);
            $("#testTheme4").val(theme4);
            $("#testTheme5").val(theme5);
            $("#testTheme6").val(theme6);
            $("#testThemeName").val(shortCustomThemeName);

            $("#cancelTestThemeBtn").text("Delete");
            $("#saveTestThemeBtn").text("Set");
            $("#cancelTestThemeBtn").on("click", function () { deleteCustomTheme(shortCustomThemeName); });
            $("#saveTestThemeBtn").on("click", function () { saveCustomTheme(); });

            $("#customThemePromptModal").modal("hide");
            $('#customThemePromptModal').on('hidden.bs.modal', function (event) {
                $("#customThemeModal").modal("show");
            });
        });
    }

    function customTheme() {
        $("#cancelTestThemeBtn").text("Cancel");
        $("#saveTestThemeBtn").text("Save");
        $("#cancelTestThemeBtn").on("click", revertTheme);
        $("#saveTestThemeBtn").on("click", saveCustomTheme);

        $("#customThemeModal").modal("show");
    }

    function updateTestTheme() {
        var theme1 = $("#testTheme1").val();
        var theme2 = $("#testTheme2").val();
        var theme3 = $("#testTheme3").val();
        var theme4 = $("#testTheme4").val();
        var theme5 = $("#testTheme5").val();
        var theme6 = $("#testTheme6").val();

        less.modifyVars({
            "@theme": "custom",
            "@theme1": theme1,
            "@theme2": theme2,
            "@theme3": theme3,
            "@theme4": theme4,
            "@theme5": theme5,
            "@theme6": theme6
        });
    }

    function revertTheme() {
        chrome.storage.local.get(["theme"], function (result) {
            if (result.theme === "light") {
                setLightTheme();
            }
            else if (result.theme === "dark") {
                setDarkTheme();
            }
            else if (result.theme != null) {
                setCustomTheme(result.theme);
            }
        });
    }

    function saveCustomTheme() {
        var themeName = $("#testThemeName").val() + "-customTheme";

        var theme1 = $("#testTheme1").val();
        var theme2 = $("#testTheme2").val();
        var theme3 = $("#testTheme3").val();
        var theme4 = $("#testTheme4").val();
        var theme5 = $("#testTheme5").val();
        var theme6 = $("#testTheme6").val();

        if (themeName == "") {
            $("#customThemeModal").modal("hide");
            $("#alertMsg").text("You didnt enter a name");
            $("#alertModal").modal("show");
            return;
        }
        else if (theme1 == "" || theme2 == "" || theme3 == "" || theme4 == "" || theme5 == "" || theme6 == "") {
            $("#customThemeModal").modal("hide");
            $("#alertMsg").text("You didnt enter a color");
            $("#alertModal").modal("show");
            return;
        }

        chrome.storage.local.get(["customThemes"], function (result) {
            var customThemes = {};

            if (typeof result.customThemes != "object") {
                customThemes[themeName] = {
                    "theme1": theme1,
                    "theme2": theme2,
                    "theme3": theme3,
                    "theme4": theme4,
                    "theme5": theme5,
                    "theme6": theme6
                };

                chrome.storage.local.set({ "customThemes": customThemes });
                $("#customThemeModal").modal("hide");
                $("#alertMsg").text("Theme saved successfully");
                $("#alertModal").modal("show");
            }
            else {
                customThemes = result.customThemes;
                delete customThemes[themeName];
                customThemes[themeName] = {
                    "theme1": theme1,
                    "theme2": theme2,
                    "theme3": theme3,
                    "theme4": theme4,
                    "theme5": theme5,
                    "theme6": theme6
                };

                chrome.storage.local.set({ "customThemes": customThemes });
                $("#customThemeModal").modal("hide");
                $("#alertMsg").text("Theme saved successfully");
                $("#alertModal").modal("show");
            }
            refreshSettingsPage();

            shortCustomThemeName = themeName.substring(0, themeName.length - 12);
            setCustomTheme(shortCustomThemeName);
        });
    }

    function deleteCustomTheme(shortCustomThemeName) {
        chrome.storage.local.get(["customThemes"], function (result) {
            customThemes = result.customThemes;
            delete customThemes[shortCustomThemeName + "-customTheme"];

            chrome.storage.local.set({ "customThemes": customThemes });

            $("#alertMsg").text("Custom theme deleted successfully");
            $("#alertModal").modal("show");

            refreshSettingsPage();
            setDarkTheme();
        });
    }

    $("#login-form").submit(function (event) {
        event.preventDefault();

        var loginPassword = $("#loginPassword").val();

        socket.emit("userLogin", { token: loginPassword });
    });

    function login() {
        chrome.storage.local.get(["validator"], function (result) {
            if (!("validator" in result) || result.validator === null) {
                hideEverything();
                userInputElement.show();
                aboutButtonElement.show();
            }
            else {
                validator = result.validator;
                socket.emit("autoLogin", { token: validator });
            }
        });
    }

    socket.on('gotUserId', function (reply) {
        discordId = reply.id;
    })

    socket.on("serverReset", function () {
        chrome.storage.local.clear();
        window.close();
    });

    socket.on("loginReply", function (reply) {
        var status = reply.status;

        if (status === "ERROR: validator incorrect") {
            hideEverything();
            userInputElement.show();
            aboutButtonElement.show();

            $("#loginPassword").val("");
            $("#loginPassword").attr("placeholder", "Credentials Incorrect");
            $('#loginPassword').attr('style', 'border-color: red !important;');
        }
        else if (status === "OK") {
            hideEverything();
            mainTabs.show();
            aboutButtonElement.show();

            if (reply.token != null) {
                chrome.storage.local.set({ validator: reply.token });
            }

            validator = reply.token;
            socket.emit("getUserId", { token: validator })
            socket.emit("refreshUsers", { token: reply.token });
        }
    });

    function logout() {
        chrome.storage.local.clear();
        window.close();
        socket.emit('logout', { token: validator });
    }

    $("#friends-tab").on('show.bs.tab', function () {
        $("#loadGif").show();
        chrome.storage.local.get(["validator"], function (result) {
            socket.emit("refreshUsers", { token: result.validator });
        });
    });

    $("#friend-requests-tab").on('show.bs.tab', function () {
        socket.emit("pendingFriendRequests", { username: username });
    });

    $("#sent-friend-requests-tab").on('show.bs.tab', function () {
        socket.emit("sentFriendRequests", { username: username });
    });

    $("#settings-tab").on('show.bs.tab', function () {
        refreshSettingsPage();
    });

    $("#add-friends-tab").on('show.bs.tab', function () {
        socket.emit("searchUsers", { username: username, usernameToSearch: "" });
    });

    function refreshSettingsPage() {
        chrome.storage.local.get(["customThemes"], function (result) {
            $("#customThemeDropdown").empty();

            // + new theme dropdown item
            var dropdownA = document.createElement("a");
            dropdownA.classList.add("dropdown-item");
            dropdownA.classList.add("dropdown-text");
            dropdownA.innerHTML = "+ New Theme";
            dropdownA.onclick = function () { customTheme(); };

            document.getElementById("customThemeDropdown").prepend(dropdownA);


            for (var customThemeName in result.customThemes) {
                shortCustomThemeName = customThemeName.substring(0, customThemeName.length - 12);

                dropdownA = document.createElement("a");
                dropdownA.classList.add("dropdown-item");
                dropdownA.classList.add("dropdown-text");
                dropdownA.innerHTML = shortCustomThemeName;
                dropdownA.onclick = function () { customThemePrompt(this.innerHTML); };

                document.getElementById("customThemeDropdown").prepend(dropdownA);
            }
        });
    }

    function refreshBackground() {
        if (backgroundEnabled) {
            chrome.tabs.captureVisibleTab(function (dataUrl) {
                document.body.style.backgroundImage = "url(" + dataUrl + ")";

                var backgroundImage = new Image();
                backgroundImage.src = dataUrl;
            });
        }
        else {
            document.body.style.backgroundImage = "";
        }
    }

    function changeBackgroundPos() {
        backgroundXOffset = parseInt(xSlider.value) - backgroundWidth + 100;
        backgroundYOffset = parseInt(ySlider.value) - 300;
        document.body.style.backgroundPosition = backgroundXOffset + "px " + backgroundYOffset + "px";
    }

    function setBackgroundOffsets() {
        chrome.storage.local.set({ backgroundXOffset: backgroundXOffset });
        chrome.storage.local.set({ backgroundYOffset: backgroundYOffset });
    }

    function promptDeleteAccount() {
        $("#confirmDeleteAccModal").modal("show");
    }

    function deleteAccount() {
        hideEverything();
        socket.emit("deleteUser", { username: username });
        socket.disconnect();
        aboutButtonElement.show();
        chrome.storage.local.clear();
        chrome.runtime.sendMessage({ turnOffNotifications: 1 });
        window.close();
    }

    function promptChangeUsername() {
        $("#confirmChangeUsernameModal").modal("show");
    }

    function changeUsername() {
        var newUsername = document.getElementById("changeUsernameInput").value;

        if (newUsername.length > maxUsernameLength) {
            document.getElementById("changeUsernameInput").value = "";
            document.getElementById("changeUsernameInput").placeholder = "Username too long";
        }
        else if (!(/^[a-zA-Z0-9\-_.]+$/.test(newUsername))) { // Does not match regex
            document.getElementById("changeUsernameInput").value = "";
            document.getElementById("changeUsernameInput").placeholder = "Illegal characters";
        }
        else if (newUsername) {
            socket.emit("changeUsername", { username: username, newUsername: newUsername });
            $("#confirmChangeUsernameModal").modal("hide");
            document.getElementById("changeUsernameInput").value = "";

        }
        else {
            document.getElementById("changeUsernameInput").placeholder = "Please enter username";
        }
    }

    function chatSettings() {
        if (clickedChat.type == 0) {
            getDeleteMsg();
            $("#friendSettingsModal").modal("show");
        }
        else if (clickedChat.type == 1) {
            getDeleteMsg();
            $("#groupSettingsModal").modal("show");
        }
    }

    $("#addFriendToGroupBtn").on("click", function () {

        chrome.storage.local.get(["chats"], function (result) {
            var friends = result.chats[0]; // {userId: {name: name, viewStatus: viewStatus, lastActivity: lastActivity, lastOnline: lastOnline, messages: {}, ...}
            var groups = result.chats[1]; // // {groupId: {name: name, viewStatus: viewStatus, lastActivity: lastActivity, members: {memberId: {username: username, status: status}}}
            var groupMembers = groups[clickedChat.id].members;

            var chats = [];// [[id, type], ...] type: 0: friend, 1: group
            for (var i = 0; i < Object.keys(friends).length; i++) {
                chats.push([Object.keys(friends)[i], 0]);
            }
            for (var i = 0; i < Object.keys(groups).length; i++) {
                chats.push([Object.keys(groups)[i], 1]);
            }

            var sortedChats = chats.sort(function (a, b) {
                var lastActivityA;
                var lastActivityB;

                if (a[1] == 0) {
                    lastActivityA = friends[a[0]].lastActivity;
                }
                else {
                    lastActivityA = groups[a[0]].lastActivity;
                }

                if (b[1] == 0) {
                    lastActivityB = friends[b[0]].lastActivity;
                }
                else {
                    lastActivityB = groups[b[0]].lastActivity;
                }

                return lastActivityA - lastActivityB;
            }).reverse();

            $("#addFriendToGroupTable").empty();

            for (var i = 0; i < sortedChats.length; i++) {
                if (sortedChats[i][1] == 0) { // Is friend
                    var friendsId = sortedChats[i][0];
                    var friendsName = friends[friendsId].name;
                    var friendsViewStatus = friends[friendsId].viewStatus;
                    var lastActivity = friends[friendsId].lastActivity;
                    var friendsLastOnline = friends[friendsId].lastOnline;

                    var lastActivityA = document.createElement("a");
                    var lastActivityFormatted = calcLastOnline(lastActivity);

                    var chatIcon = document.createElement("i");
                    if (friendsId in groupMembers && groupMembers[friendsId].status != 0) {
                        chatIcon.setAttribute("class", "fas fa-check fa-fw");
                    }
                    else {
                        chatIcon.setAttribute("class", "far fa-plus-square fa-fw");
                    }

                    var button = document.createElement("button");
                    button.classList.add("textLink");
                    button.classList.add("addFriendToGroupBtn");
                    button.setAttribute("data-friendId", friendsId);
                    button.appendChild(chatIcon);
                    button.innerHTML += " " + friendsName;

                    var buttonTd = document.createElement("td");
                    buttonTd.appendChild(button);

                    var tr = document.createElement("tr");
                    tr.appendChild(buttonTd);
                    tr.setAttribute("data-friendId", friendsId);

                    document.getElementById("addFriendToGroupTable").appendChild(tr);
                }
            }

            $(".addFriendToGroupBtn").on("click", function () {
                var friendId = $(this).attr("data-friendId");

                if (!(friendId in groupMembers && groupMembers[friendId].status != 0)) {
                    socket.emit("addFriendToGroup", { username: username, groupId: clickedChat.id, friendId: friendId });
                    $('button[data-friendId="' + friendId + '"] > i').attr("class", "fas fa-check fa-fw");
                    socket.emit("refreshUsers", { token: validator });
                }
            });
        });

        $("#addFriendToGroupModal").modal("show");
    });

    $("#seeGroupMembersBtn").on("click", function () {
        var groupMembers = groups[clickedChat.id].members;

        $("#seeGroupMembersTable").empty();

        for (var i = 0; i < Object.keys(groupMembers).length; i++) {
            var memberId = Object.keys(groupMembers)[i];
            var memberUsername = groupMembers[memberId].username;
            var memberStatus = groupMembers[memberId].status;

            var statusText = document.createElement("h6");
            statusText.setAttribute("class", "small-text");
            if (memberStatus == 0) {
                continue; // user deleted
            }
            else if (memberStatus == 1) {
                statusText.innerHTML = "";
            }
            else if (memberStatus == 2) {
                statusText.innerHTML = "Creator";
            }

            var statusTextTd = document.createElement("td");
            statusTextTd.appendChild(statusText);

            var crossIcon = document.createElement("i");
            crossIcon.setAttribute("class", "far fa-times-circle");
            crossIcon.setAttribute("data-memberId", memberId);
            crossIcon.onclick = function () { removeMemberFromGroup(this.getAttribute("data-memberId")) };

            var crossIconTd = document.createElement("td");
            crossIconTd.appendChild(crossIcon);

            var button = document.createElement("button");
            button.classList.add("textLink");
            button.innerHTML += " " + memberUsername;

            var buttonTd = document.createElement("td");
            buttonTd.appendChild(button);

            var tr = document.createElement("tr");
            tr.appendChild(buttonTd);
            tr.appendChild(statusTextTd);

            if (!(memberId == userId || groupMembers[userId].status != 2)) {
                tr.appendChild(crossIconTd);
                tr.setAttribute("data-memberId", memberId);
            }

            document.getElementById("seeGroupMembersTable").appendChild(tr);
        }

        $("#seeGroupMembersModal").modal("show");

        function removeMemberFromGroup(memberId) {
            var memberName = groupMembers[memberId].username;
            socket.emit("removeMemberFromGroup", { username: username, groupId: clickedChat.id, memberId: memberId, memberName: memberName });
            socket.emit("refreshUsers", { token: validator });
            $("#seeGroupMembersTable>tr[data-memberId='" + memberId + "']").remove();
        }
    });

    $("#leaveGroupBtn").on("click", function () {
        socket.emit("removeMemberFromGroup", { username: username, groupId: clickedChat.id, memberId: userId, memberName: username });
        socket.emit("refreshUsers", { token: validator });
        $("#groupSettingsModal").modal("hide");
        goBack();
    });

    socket.on("changeUsernameConfirm", function (reply) {
        $("#alertMsg").text("Username Changed");
        $("#alertModal").modal("show");
        chrome.storage.local.set({ whiteboxUsername: reply });
        username = reply;
    });

    function goBack() {
        if ($("#gameArea").is(":visible")) {
            $("#gameArea").hide();
            $("#backButton").hide();
            $("#selectGame").show();
        }
        else {
            stoppedTyping();
            hideEverything();

            if (previousPage === "userInputElement") {
                userInputElement.show();
            }
            else {
                mainTabs.show();
                $("#loadGif").show();
                socket.emit("refreshUsers", { token: validator });
            }

            aboutButtonElement.show();
            backButtonElement.hide();
        }
    }

    $("#messageScroll").on('scroll', function () {
        var scrollTop = $(this).scrollTop();

        if (messageScroll.scrollTop != (messageScroll.scrollHeight - messageScroll.offsetHeight)) { // If not scrolled to bottom
            $("#scrollDownBtn").show();
        }
        else {
            $("#scrollDownBtn").hide();
            $("#scrollDownBtn sup").hide();
        }
        if (scrollTop <= messageBufferDistance) {
            if (currServerId == undefined) {
                if (Object.keys(discordMessages[currChannel]).length != 0) {
                    topMsg = discordMessages[currChannel][0].id;
                    socket.emit("requestDMsMore", { token: validator, userId: currChannel, topMsg: topMsg });
                }
            } else if (Object.keys(discordMessages[currServerId][currChannel]).length != 0) {
                topMsg = discordMessages[currServerId][currChannel][0].id;
                socket.emit("requestMessagesMore", { token: validator, serverId: currServerId, channelId: currChannel, topMsg: topMsg });
            }
        }
    });

    function scrollDown() {
        document.getElementById("messageScroll").scrollTop = messageScroll.scrollHeight; // Scroll to bottom
    }

    function openMessagePage(channelId, name) {
        $("#messageScroll").contents().remove();
        $("#messagePageName").html(name);
        $("#messagePageLastOnline").text("");

        hideEverything();
        $("#scrollDownBtn").hide();
        messagePageElement.show();
        aboutButtonElement.show();
        backButtonElement.show();
        currChannel = channelId;

        refreshMessagePage(channelId, "load");

        document.getElementById("messageScroll").scrollTop = messageScroll.scrollHeight; // Scroll to bottom
        if ($(".new-msgs-div")[0]) {
            document.getElementsByClassName("new-msgs-div")[0].scrollIntoView(); // Scroll to new msg
        }
    }

    $("#message").focus(function () {
        socket.emit("startedTyping", { chatId: clickedChat.id, type: clickedChat.type });
        checkIdle();
    });

    $("#message").focusout(function () {
        stoppedTyping();
    });

    function stoppedTyping() {
        socket.emit("stoppedTyping");
        clearInterval(idleInterval);
    }

    var idleInterval;
    // Check if idle
    function checkIdle() {
        var idleTime = 0;
        //Increment the idle time counter every minute.
        idleInterval = setInterval(timerIncrement, 1000);

        $(this).keypress(function (e) {
            idleTime = 0;
        });

        function timerIncrement() {
            idleTime = idleTime + 1;
            if (idleTime > 29) { // 30 seconds
                stoppedTyping();
                idleTime = 0;
            }
        }
    }

    socket.on("isTyping", function (reply) {
        var chatId = reply.chatId;
        var chatType = reply.chatType;
        var isTyping = reply.isTyping;
        var isOnline = reply.isOnline;
        var fadeTime = 200;

        if (clickedChat != null && clickedChat.id == chatId && clickedChat.type == chatType) { // If in the chat of the person typing
            if (chatType == 0) { // If friend
                if (isTyping) {
                    $("#messagePageLastOnline").fadeOut(fadeTime, function () {
                        $(this).text("typing...");
                    }).fadeIn(fadeTime);
                }
                else if (!isTyping) {
                    $("#messagePageLastOnline").fadeOut(fadeTime, function () {
                        if (isOnline) {
                            $("#messagePageLastOnline").text("Last Online: now");
                        }
                        else {
                            $("#messagePageLastOnline").text("Last Online: " + calcLastOnline(friends[clickedChat.id].lastOnline));
                        }
                    }).fadeIn(fadeTime);
                }
            }
            else if (chatType == 1) { // If group

                var peopleTyping = "";

                for (var i = 0; i < isTyping.length; i++) {
                    var memberId = isTyping[i].userId;
                    var memberName = groups[clickedChat.id].members[memberId].username;

                    if (memberId != userId) {
                        peopleTyping += (memberName + " is typing, ");
                    }
                }

                if (peopleTyping.length != 0) { // If someone is typing, chop off last ", "
                    peopleTyping = peopleTyping.substring(0, peopleTyping.length - 2);
                }
                $("#messagePageLastOnline").fadeOut(fadeTime, function () {
                    $("#messagePageLastOnline").text(peopleTyping);
                }).fadeIn(fadeTime);
            }
        }
        else { // If they are not in the chat that the person is typing into
            if (chatType == 0) { // Only show is typing for 1 to 1 chats, not grops
                if (isTyping) {
                    var personTypingName = friends[chatId].name;
                    showNotification(personTypingName + " is typing...");
                }
            }

        }
    });

    function searchUsers() {
        var usernameToSearch = $("#userSearchInput").val();

        socket.emit("searchUsers", { username: username, usernameToSearch: usernameToSearch });
    }

    socket.on('sentMessage', function () {
        // add to messages
        refreshMessagePage(currChannel, 'refresh');
        messageScroll.scrollTop = messageScroll.scrollHeight; // Scroll to bottom

    });

    function swap(json) {
        var ret = {};
        for (var key in json) {
            ret[json[key]] = key;
        }
        return ret;
    }

    function reformatMembers(json) {
        var ret = {};
        for (var key in json) {
            ret[json[key].tag] = {
                name: json[key].name,
                id: key,
                nick: json[key].nick
            }
        }
        return ret;
    }

    function formatTags(message) {
        message = message.split(" ")
        for (var i = 0; i < message.length; i++) {
            if (message[i].startsWith("#")) {
                if (message[i].replace("#", "") in swap(channelIds)) {
                    message[i] = "<#" + swap(channelIds)[message[i].replace("#", "")] + ">";
                }
            } else if (message[i].startsWith("@")) {
                reformatted = reformatMembers(currChannelMembers);
                msgSection = message[i].replace("@", "");
                if (msgSection in reformatted) {
                    if (reformatted[msgSection].nick != undefined) {
                        message[i] = "<@!" + reformatted[msgSection].id + ">";
                    } else {
                        message[i] = "<@" + reformatted[msgSection].id + ">";
                    }
                }
            }

        }
        return message.join(" ");
    }

    function sendMessage() {
        var messageElement = document.getElementById("message");
        var message = messageElement.value;
        messageElement.value = "";
        if (message === "") return;
        message = unescape(encodeURIComponent(formatTags(message)));
        if (currServerId == undefined) {
            socket.emit('dmMessage', { userId: currChannel, content: message, token: validator })
        } else {
            socket.emit("message", { serverId: currServerId, channelId: currChannel, content: message, token: validator });
        }
    }

    $("#message").keydown(function (event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            if ($("#message").autocomplete("widget")[0].style.display === "none") { // If autocomplete is not open
                $("#sendButton").click();
            }
        }
    });

    function split(val) {
        return val.split(/@\s*/);
    }

    function splitLeave(val) {
        var split = val.split("@");
        for (var i = 0; i < split.length; i++) {
            split[i] += "@";
        }
        return split;
    }

    function extractLast(term) {
        return split(term).pop();
    }

    $("#message")
        // don't navigate away from the field on tab when selecting an item
        .on("keydown", function (event) {
            if (event.keyCode === $.ui.keyCode.TAB && $(this).autocomplete("instance").menu.active) {
                event.preventDefault();
            }
        })
        .autocomplete({
            minLength: 0,
            source: function (request, response) {
                // If is a group chat and @ is present either at beginning of text or has a space before it
                // (so email@gmail.com doesnt trigger it)
                if ((request.term.indexOf(" @") >= 0 || request.term.indexOf("@") == 0)) {
                    currChannelMembersArray = [];
                    for (var i = 0; i < Object.values(currChannelMembers).length; i++) {
                        currChannelMembersArray.push(Object.values(currChannelMembers)[i].tag);
                    }
                    var groupMembersUsernames = currChannelMembersArray.concat(["everyone", "here"]);

                    response($.ui.autocomplete.filter(groupMembersUsernames, extractLast(request.term)).slice(0, 5));
                }
                else {
                    $("#message").autocomplete("close");
                }
            },
            focus: function () {
                return false;
            },
            select: function (event, ui) {
                var terms = splitLeave(this.value);
                // remove the current input
                terms.pop();
                // add the selected item
                ui.item.value = ui.item.value + " ";
                terms.push(ui.item.value);
                // add placeholder to get the comma-and-space at the end
                terms.push("");
                this.value = terms.join("");
                return false;
            },
            position: {
                my: "left bottom",
                at: "left top",
                collision: "flip"
            }
        });

    function friendRequest(requesteeId) {
        $("#matchingUsers [data-matchinguserid = \"" + requesteeId + "\"]").attr("class", "fas fa-check fa-fw");
        socket.emit("friendRequest", { requesteeId: requesteeId, username: username });
    }

    function calcLastOnline(lastOnline) {
        var unixTime = Math.round(+new Date() / 1000);
        var seconds = unixTime - lastOnline;

        if (seconds <= 5) {
            return "now";
        }

        var days = Math.floor(seconds / (3600 * 24));
        seconds -= days * 3600 * 24;
        var hrs = Math.floor(seconds / 3600);
        seconds -= hrs * 3600;
        var mnts = Math.floor(seconds / 60);
        seconds -= mnts * 60;

        if (mnts == 0 && hrs == 0 && days == 0) {
            return seconds + "s";
        }
        else if (hrs == 0 && days == 0) {
            return mnts + "m";
        }
        else if (days == 0) {
            return hrs + "h";
        }
        else if (days > 0) {
            return days + "d";
        }
        else if (days > 360) {
            return "&infin;";
        }
    }

    function handleFileSelect(evt) {
        var $files = $(this).get(0).files;
        var formData = new FormData();
        if ($files[0].type == "image/jpeg" || $files[0].type == "image/png" || $files[0].type == "image/gif" || $files[0].type == "image/tiff") {
            formData.append("image", $files[0]);
            sendImg(formData);
        } else {
            formData.append("file", $files[0]);
            sendFile(formData);
        }
    }

    function sendFile(data) {
        var settings = {
            async: false,
            crossDomain: true,
            processData: false,
            contentType: false,
            type: 'POST',
            url: 'https://bayfiles.com/api/upload',
            mimeType: 'multipart/form-data'
        };
        settings.data = data;
        $.ajax(settings).done(function (response) {
            var data = JSON.parse(response);
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = process;
            xhr.open("GET", data.data.file.url.short + "/" + data.data.file.metadata.name, true);
            xhr.send();
            function process() {
                if (xhr.readyState == 4) {

                    // resp now has the text and you can process it.
                    // var url1 = xhr.responseText.split('id="download-url"\n                   class="btn btn-primary btn-block"\n                   href="')[1];
                    var url1 = xhr.responseText.split('id="download-url"')[1];
                    var url2 = url1.split('href="')[1];
                    var url = url2.split('">')[0];
                    sendCstmMsg("wb-fle://" + url.replace("https://", ""));
                }
            }
        });
    }

    function sendImg(data) {
        var settings = {
            async: false,
            crossDomain: true,
            processData: false,
            contentType: false,
            type: 'POST',
            url: 'https://api.imgur.com/3/image',
            headers: {
                Authorization: "Client-ID 86dea04cb4927c2",
                Accept: 'application/json'
            },
            mimeType: 'multipart/form-data'
        };
        settings.data = data;
        $.ajax(settings).done(function (response) {
            var data = JSON.parse(response);
            sendCstmMsg("wb-img://" + data.data.link.replace("https://", ""));
        });
    }

    function sendCstmMsg(message) {
        var e = Math.round(+new Date / 1e3);
        var a = message;
        var messages = getMessages();
        a = unescape(encodeURIComponent(a)), messages.push({
            messageId: null,
            senderId: userId,
            message: a,
            timeSent: e,
            confirmed: !1
        }), refreshMessagePage(), messageScroll.scrollTop = messageScroll.scrollHeight;
        var n = clickedChat.id,
            r = clickedChat.name,
            o = clickedChat.type;
        socket.emit("message", {
            username: username,
            message: a,
            receiverId: n,
            receiverName: r,
            chatType: o
        })
    }

    function findEmotes(message) {
        emotes = [
            {
                "name": "thonk",
                "url": "http://i.imgur.com/yRlT3eL.png",
                "height": "30"
            },
            {
                "name": "custard",
                "url": "https://canary.discordapp.com/assets/3c97bd4978e173478233b8af4cbabe79.svg",
                "height": "30"
            },
            {
                "name": "noggers",
                "url": "https://cdn.discordapp.com/emojis/536796197126406144.png",
                "height": "30"
            },
            {
                "name": "brawl",
                "url": "https://i.imgur.com/4MZBLm7.png",
                "height": "30"
            },
            {
                "name": "e",
                "url": "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/twitter/53/regional-indicator-symbol-letter-e_1f1ea.png",
                "height": "30"
            }
        ]
        for (i = 0; i < emotes.length; i++) {
            var re = new RegExp(":" + emotes[i]["name"] + ":", "g");
            message = message.replace(re, "<img src='" + emotes[i]["url"] + "' height='" + emotes[i]["height"] + "em'>");
        }
        return message;

    }
    function findTag(message) {
        message = " " + message + " ";
        if (message.includes("<a href='#' class='dmLink' data-userId='" + discordId + "'") || message.includes(" @everyone ")) {
            if ("light" === currGlobalTheme) {
                message = "<div style='background-color: #ffc27f'>" + message + "</div>";
            } else {
                message = "<div style='background-color: #91530f'>" + message + "</div>";
            }
        }
        return message;
    }
    function formatText(message) {
        format_list = [
            {
                "format": "__",
                "result_b": '<span style="text-decoration: underline;">',
                "result_e": '</span>',
                "length": 2,
                "indices": []
            },
            {
                "format": "**",
                "result_b": '<b>',
                "result_e": '</b>',
                "length": 2,
                "indices": []
            },
            {
                "format": "_",
                "result_b": '<i>',
                "result_e": '</i>',
                "length": 1,
                "indices": []
            },
            {
                "format": "*",
                "result_b": '<i>',
                "result_e": '</i>',
                "length": 1,
                "indices": []
            }
        ]
        var msg_list = message.split(" ");
        message = "";
        for (x = 0; x < msg_list.length; x++) {
            if (msg_list[x].startsWith("https://") || msg_list[x].startsWith("http://") || msg_list[x].startsWith("file://") || msg_list[x].startsWith("www.")) {
                message += msg_list[x].replace(/_/g, "\\_") + " ";
            } else {
                message += msg_list[x] + " ";
            }
        }
        for (x = 0; x < format_list.length; x++) {
            for (i = 0; i <= message.length - format_list[x]['length']; i++) {
                if (message.substring(i, i + format_list[x]['length']) == format_list[x]['format'] && message.substring(i - 1, i) != "\\") {
                    format_list[x]['indices'].push(i);
                }
            }
            while (true) {
                if (format_list[x]['indices'].length <= 1) {
                    break;
                }

                message = message.replace(format_list[x]['format'], format_list[x]['result_b']);
                message = message.replace(format_list[x]['format'], format_list[x]['result_e']);
                format_list[x]['indices'].splice(0, 2);
            }
        }
        message = message.replace(/\\_/g, "_");
        if (message.startsWith("/shrug")) {
            message = message.replace("/shrug", "");
            message = message + " \u{AF}\\_(\u{30C4})_/\u{AF}";
        }
        message = message.replace(/\n/g, "<br>");

        message = findTag(message);
        message = message.replace(/@everyone/g, "<a href='#'>@everyone</a>");

        message = " " + message + " ";
        message1 = message.split("<#");
        if (message1.length > 1) {
            message = message1.splice(0, 1);
            for (var i = 0; i < message1.length; i++) {
                message2 = message1[i].split(">");
                if (message2.length == 1) {
                    message += message2[0];
                    continue;
                }
                remaining = message2[0];
                if (channelIds != undefined) {
                    if (remaining in channelIds) {
                        remaining = "<a href='#' class='roleLink' data-channelName='#" + channelIds[remaining] + "' data-channelId='" + remaining + "'>#" + channelIds[remaining] + "</a>";
                    }
                } else {
                    remaining = "<a href='#'><#" + remaining + "></a>"
                }
                message2.splice(0, 1);
                message += remaining + message2.join(">");
            }
        }

        message = " " + message + " ";
        message1 = message.split("<@!");
        if (message1.length > 1) {
            message = message1.splice(0, 1);
            for (var i = 0; i < message1.length; i++) {
                message2 = message1[i].split(">");
                if (message2.length == 1) {
                    message += message2[0];
                    continue;
                }
                remaining = message2[0];
                if (remaining in currChannelMembers) {
                    remaining = "<a href='#' class='dmLink' data-userId='" + remaining + "' data-userTag='" + currChannelMembers[remaining].tag + "'>@" + currChannelMembers[remaining].nick + "</a>";
                } else {
                    remaining = "<a href='#'><@" + remaining + "></a>"
                }
                message2.splice(0, 1);
                message += remaining + message2.join(">");
            }
        }

        message = " " + message + " ";
        message1 = message.split("<@");
        if (message1.length > 1) {
            message = message1.splice(0, 1);
            for (var i = 0; i < message1.length; i++) {
                message2 = message1[i].split(">");
                if (message2.length == 1) {
                    message += message2[0];
                    continue;
                }
                remaining = message2[0];
                if (remaining in currChannelMembers) {
                    remaining = "<a href='#' class='dmLink' data-userId='" + remaining + "' data-userTag='" + currChannelMembers[remaining].tag + "'>@" + currChannelMembers[remaining].name + "</a>";
                } else {
                    remaining = "<a href='#'><@" + remaining + "></a>"
                }
                message2.splice(0, 1);
                message += remaining + message2.join(">");
            }
        }

        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        var exp2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        message = message.replace(exp, '<a href="$1" target="_blank">$1</a>').replace(exp2, '$1<a href="http://$2" target="_blank">$2</a>');
        message = message.trim();

        return message;
    }

    function findLinks(e, divAlign) {
        e = findTag(e);
        if (!e.startsWith("wb-img://") && !e.startsWith("wb-fle://")) {
            var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            var exp2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
            e = e.replace(exp, '<a href="$1" target="_blank">$1</a>').replace(exp2, '$1<a href="http://$2" target="_blank">$2</a>')
            return findEmotes(e);
        } else if (e.startsWith("wb-fle://")) {
            name = e.split("/")[e.split("/").length - 1];
            e = e.replace("wb-fle://", "http://");
            if (name.length > 14) {
                name = name.substring(0, 12) + "...";
            }
            return "<div style='width: 22.5em; height: 5em;'><div style='width: 13em; height: 5em; background-color: #e2e2e2; border-radius: 0.5em; padding: 1em; " + divAlign + "'><img src='empty.png' width='40em' style='float: left; '><p style='padding-top: 0.7em; padding-left: 3em;'><a href='" + e + "' style='float: left;' target='_blank' download>" + name + "</a></p></div></div><br>";
        } else {
            return "<br><img src='" + e.replace("wb-img://", "http://") + "' style='width: 10em;'><br>";
        }
    }

    $(document).keydown(function (e) {
        if (e.which == 27 && ($("#messagePage").is(":visible") || $("#gameArea").is(":visible"))) {
            e.preventDefault();
            $(".modal").modal("hide");
            goBack();
        }
        else if ($("#friends").is(":visible")) {
            var input = document.getElementById("friendsSearch");
            input.focus();
        }
    });

    socket.on("response", function (reply) {
        if (reply === "ERROR: username taken") {
            document.getElementById("username").value = "";
            document.getElementById("username").placeholder = "Username taken";
            document.getElementById('username').style.borderColor = "red";
        }
        else if (reply === "ERROR: key incorrect") {
            alert("SERVER ERROR\nERROR: key incorrect");
            hideEverything();
            aboutButtonElement.show();
            chrome.storage.local.clear();
            socket.disconnect();
            window.close();
        }
        else {
            userId = reply;
            socket.emit("refreshUsers", { token: validator });
            hideEverything();
            mainTabs.show();
            chrome.storage.local.set({ whiteboxUsername: username });
            chrome.storage.local.set({ whiteboxId: userId });
            chrome.runtime.sendMessage({ turnOnNotifications: 1 });
        }
    });

    socket.on("moreMessages", function (reply) {
        var scrollHeight = messageScroll.scrollHeight;
        var scrollLocation = $("#messageScroll").scrollTop();

        if (currServerId == undefined) {
            discordMessages[currChannel] = reply.messages.concat(discordMessages[currChannel]);
            refreshMessagePage(reply.userId, "refresh");
        } else {
            discordMessages[currServerId][reply.channelId] = reply.messages.concat(discordMessages[currServerId][reply.channelId]);
            refreshMessagePage(reply.channelId, "refresh");
        }

        var newScrollHeight = messageScroll.scrollHeight;
        $("#messageScroll").scrollTop(newScrollHeight - scrollHeight + scrollLocation);
    });

    socket.on("newMessage", function (reply) {
        if (reply.type == "dm") {
            if (reply.userId == currChannel) {
                discordMessages[reply.userId].push(reply.message);
                refreshMessagePage(reply.userId, "refresh");
            }
        } else {
            if (reply.channelId == currChannel) {
                discordMessages[currServerId][reply.channelId].push(reply.message);
                refreshMessagePage(reply.channelId, "refresh");
            }
        }
    });

    function showNotification(notificationMessage) {
        if (notificationMessage.length > 35) {
            notificationMessage = notificationMessage.substring(0, 32) + "..."
        }
        $("#notificationDiv > h6").text(notificationMessage);
        var animationSpeed = 200;

        // Clears timeout so that if a notification is already showing the new one wont dissappear prematurely
        clearTimeout(notificationTimeout);

        $("#notificationDiv").css('opacity', 0.9)
            .slideDown(animationSpeed)
            .animate(
                { opacity: 1 },
                { queue: false, duration: animationSpeed }
            );

        notificationTimeout = setTimeout(function () {
            $("#notificationDiv").css('opacity', 1)
                .slideUp(animationSpeed)
                .animate(
                    { opacity: 0.9 },
                    { queue: false, duration: animationSpeed }
                );
        }, 5000);
    }

    socket.on("updatedViewStatus", function (reply) {
        var friendId = reply[0];
        var viewStatus = reply[1];

        // View status:
        // 0: received and seen
        // 1: received and not seen
        // 2: sent and seen
        // 3: sent and not seen

        var chatIcon = document.createElement("span");

        if (viewStatus == 0) {
            $("#" + friendId + ">span").attr("class", "far fa-comment-alt fa-fw");
        }
        else if (viewStatus == 1) {
            $("#" + friendId + ">span").attr("class", "fas fa-comment-alt fa-fw");
        }
        else if (viewStatus == 2) {
            $("#" + friendId + ">span").attr("class", "far fa-arrow-alt-circle-right fa-fw");
        }
        else if (viewStatus == 3) {
            $("#" + friendId + ">span").attr("class", "fas fa-arrow-alt-circle-right fa-fw");
        }
    });

    socket.on("refreshedUsers", function (reply) {
        refreshChats(reply);
    });

    function refreshMessagePage(channelId, type) {
        if (type == "load") {
            getMessages(channelId, type);
            return;
        } else if (type == "refresh") {
            var messages = getMessages(channelId, type);
        }
        var messageScroll = document.getElementById("messageScroll");
        messageScroll.innerHTML = "";

        for (var i = 0; i < messages.length; i++) {
            var senderId = messages[i].authorId;
            var timeSent = messages[i].createdTimestamp;
            var lastMessageSenderId;
            var lastTimeStamp = 0;

            // Calculate time stamp
            var formattedTimeStamp;
            createdAt = new Date(messages[i].createdAt.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }));
            dayF = "Today";
            time = true;
            now = new Date(Date.now());
            day_l = createdAt.toDateString().split(" ");
            day_l.splice(0, 1);
            day_l[1] += ","
            day = day_l.join(" ");
            if (createdAt.getFullYear() != now.getFullYear() || createdAt.getMonth() != now.getMonth() || createdAt.getDate() != now.getDate()) {
                if (createdAt.getFullYear() == now.getFullYear() && createdAt.getMonth() == now.getMonth() && createdAt.getDate() - now.getDate() == 1) {
                    dayF = "Yesterday";
                } else {
                    dayF = day;
                    time = false;
                }
            }
            if (time) {
                formattedTimeStamp = dayF + " at ";
                if (createdAt.getMinutes() < 10) {
                    minF = "0" + createdAt.getMinutes().toString();
                } else {
                    minF = createdAt.getMinutes().toString();
                }
                if (createdAt.getHours() == 0) {
                    formattedTimeStamp += "12:" + minF + " AM";
                } else if (createdAt.getHours() == 12) {
                    formattedTimeStamp += "12:" + minF + " PM";
                } else if (createdAt.getHours() > 12) {
                    formattedTimeStamp += (createdAt.getHours() - 12).toString() + ":" + minF + " PM";
                } else {
                    formattedTimeStamp += createdAt.getHours().toString() + ":" + minF + " AM";
                }
            } else {
                formattedTimeStamp = dayF;
            }
            if (i != 0) {
                prevCreatedAt = new Date(messages[i - 1].createdAt.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }));
                if (createdAt.getFullYear() != prevCreatedAt.getFullYear() || createdAt.getMonth() != prevCreatedAt.getMonth() || createdAt.getDate() != prevCreatedAt.getDate()) {
                    var newDateH6 = document.createElement("span");
                    newDateH6.innerHTML = day;

                    var newDateDiv = document.createElement("div");
                    newDateDiv.classList.add("diff-date");
                    newDateDiv.appendChild(newDateH6);
                    messageScroll.appendChild(newDateDiv);
                }
            }

            // Show message
            var color = messages[i].color;
            var messageDiv = document.createElement("div");
            if (senderId != discordId) { // If the message sender is not you
                if (currServerId == undefined) {
                    if (color == "#000000") {
                        var senderName = "<b><span style='font-size: 1.2em;'>" + messages[i].senderUsername + "</span></b>";
                    } else {
                        var senderName = "<b><span style='font-size: 1.2em; color: " + color + "'>" + messages[i].senderUsername + "</span></b>";
                    }
                } else {
                    if (color == "#000000") {
                        var senderName = "<a href='#' class='dmLink' data-userId='" + senderId + "' data-userTag='" + messages[i].tag + "' style='font-size: 1.2em; color: inherit'><b>" + messages[i].senderUsername + "</span></b></a>";
                    } else {
                        var senderName = "<a href='#' class='dmLink' data-userId='" + senderId + "' data-userTag='" + messages[i].tag + "' style='font-size: 1.2em; color: " + color + "'><b>" + messages[i].senderUsername + "</b></a>";
                    }
                }
                messageDiv.classList.add("replyCard");
                headerText = senderName + " " + formattedTimeStamp;
            }
            else {
                if (color == "#000000") {
                    var senderName = "<b><span style='font-size: 1.2em;'>" + messages[i].senderUsername + "</span></b>";
                } else {
                    var senderName = "<b><span style='font-size: 1.2em; color: " + color + "'>" + messages[i].senderUsername + "</span></b>";
                }
                messageDiv.classList.add("sendCard");
                headerText = formattedTimeStamp + " " + senderName;
            }
            // If the local user sends a message twice in a row
            if (i == 0) {
                lastMessageSenderId = null;
                lastTimeStamp = timeSent;
            }
            else {
                lastMessageSenderId = messages[i - 1].authorId; // Get name of first message
                lastTimeStamp = messages[i - 1].createdTimestamp;
            }
            if (lastMessageSenderId != senderId || (lastTimeStamp + timeUntilNewHeader) < timeSent) {
                var receiveName = document.createElement("h6");
                receiveName.classList.add("message-header");
                receiveName.innerHTML = headerText;
                messageDiv.appendChild(receiveName);
            }

            var messageText = document.createElement("p");
            messageText.classList.add("message");

            content = messages[i].content
                .replace(/<span/g, "&lt;span")
                .replace(/<\/span>/g, "&lt;/span&gt;")
                .replace(/<p/g, "&lt;p")
                .replace(/<\/p>/g, "&lt;/p&gt;")
                .replace(/<h/g, "&lt;h")
                .replace(/<\/h/g, "&lt;/h");

            messageText.innerHTML = formatText(content);

            messageDiv.appendChild(messageText);
            messageScroll.appendChild(messageDiv);
        }
        messageScroll.scrollTop = messageScroll.scrollHeight;
        $("#backButton").on("click", refreshChannels);
        $(".roleLink").on("click", function () { openMessagePage($(this).attr('data-channelId'), $(this).attr('data-channelName')); });
        $(".dmLink").on("click", function () { openMessagePage($(this).attr('data-userId'), $(this).attr('data-userTag')); });
    }

    function refreshChannels() {
        $("#users").empty();
        hideEverything();
        mainTabs.show();
        openChannelPage(currServerId);
    }

    function openChannelPage(id) {
        currServerId = id;
        socket.emit('refreshChannels', { id: id, token: validator });
    }

    function openFriendsPage() {
        socket.emit('refreshFriends', {token: validator});
    }

    socket.on('refreshedChannels', function (reply) {
        $("#users").empty();
        currChannelMembers = reply.members;
        channelIds = reply.channelIds;

        for (var i = 0; i < reply.channels.length; i++) {
            var button = document.createElement("button");
            button.classList.add("textLink");
            button.setAttribute("data-channelId", reply.channels[i].channelId);
            button.setAttribute("data-channelName", "#" + reply.channels[i].channelName)
            button.onclick = function () { openMessagePage(this.getAttribute("data-channelId"), this.getAttribute("data-channelName")); }; // 0 because it is a friend
            button.innerHTML += " #" + reply.channels[i].channelName;

            var buttonTd = document.createElement("td");
            buttonTd.appendChild(button);

            var tr = document.createElement("tr");
            tr.appendChild(buttonTd);
            tr.setAttribute("data-channelId", reply.channels[i].channelId);

            usersElement.append(tr);
        }
        $("#backButton").on("click", goBack);
        $("#backButton").show();
    });

    socket.on('refreshedFriends', function (reply) {
        $("#users").empty();
        currServerId = undefined;
        for (var i = 0; i < reply.friends.length; i++) {
            var button = document.createElement("button");
            button.classList.add("textLink");
            button.classList.add('dmLink');
            button.setAttribute("data-userId", reply.friends[i].userId);
            button.setAttribute("data-userTag", reply.friends[i].userTag)
            button.innerHTML += reply.friends[i].userName;

            var buttonTd = document.createElement("td");
            buttonTd.appendChild(button);

            var tr = document.createElement("tr");
            tr.appendChild(buttonTd);

            usersElement.append(tr);
        }
        $(".dmLink").on("click", function () { openMessagePage($(this).attr('data-userId'), $(this).attr('data-userTag')); });
        $("#backButton").on("click", goBack);
        $("#backButton").show();
    });

    function refreshChats(reply) {
        $("#users").empty();
        $("#loadGif").hide();
        $("#backButton").hide();
        var button = document.createElement("button");
        button.classList.add("textLink");
        button.onclick = function () { openFriendsPage(); }; // 0 because it is a friend
        button.innerHTML = '<i class="fas fa-user-alt"></i> <b>See Friends...</b>';

        var buttonTd = document.createElement("td");
        buttonTd.appendChild(button);

        var tr = document.createElement("tr");
        tr.appendChild(buttonTd);

        usersElement.append(tr);
        for (var i = 0; i < reply.length; i++) {
            if (!(reply[i].chatIcon.startsWith("http://"))) {
                var chatIcon = document.createElement("span");
                chatIcon.innerHTML = "<b>" + reply[i].chatIcon + "</b>";
            } else {
                var chatIcon = document.createElement("img");
                chatIcon.setAttribute("src", reply[i].chatIcon);
                chatIcon.setAttribute("width", "15em");
            }

            var button = document.createElement("button");
            button.classList.add("textLink");
            button.setAttribute("data-serverId", reply[i].serverId);
            button.onclick = function () { openChannelPage(this.getAttribute("data-serverId")); }; // 0 because it is a friend
            button.appendChild(chatIcon);
            button.innerHTML += " " + reply[i].serverName;

            var buttonTd = document.createElement("td");
            buttonTd.appendChild(button);

            var tr = document.createElement("tr");
            tr.appendChild(buttonTd);
            tr.setAttribute("data-serverId", reply[i].serverId);

            usersElement.append(tr);
        }
    }

    function getDeleteMsg() {
        var chatId = clickedChat.id;
        var chatType = clickedChat.type;
        socket.emit("getDeleteMsg", { username: username, chatId: chatId, chatType: chatType });
    }

    socket.on("deleteMsgReply", function (reply) {
        var selection = reply[0];
        var friendId = reply[1];

        if (clickedChat.type == 0) {
            $("#deleteMsgSelectFriend").val(selection);
        }
        else if (clickedChat.type == 1) {
            $("#deleteMsgSelectGroup").val(selection);
        }
    });

    $("#deleteMsgSelectFriend").change(function () {
        var selection = $("#deleteMsgSelectFriend").val();
        var chatId = clickedChat.id;
        var chatType = clickedChat.type;
        socket.emit("setDeleteMsg", { username: username, friendId: chatId, selection: selection, chatType: chatType });
    });

    $("#deleteMsgSelectGroup").change(function () {
        var selection = $("#deleteMsgSelectGroup").val();
        socket.emit("setDeleteMsg", { username: username, friendId: chatId, selection: selection, chatType: chatType });
    });

    function confirmUnfriendModal(friendId) {
        $("#friendSettingsModal").modal("hide");
        $("#confirmUnfriendMsg").text("Are you sure you want to unfriend " + clickedChat.name + "?");
        $("#confirmUnfriendModal").modal("show");
    }

    function unfriendFriend() {
        var friendId = clickedChat.id;
        socket.emit("unfriendFriend", { username: username, friendId: friendId });
        $("tr[data-friendId=" + clickedChat.id + "]").remove();
        $("#confirmUnfriendModal").modal("hide");
        goBack();
    }

    socket.on("unacceptedRequests", function (unacceptedRequests) {
        if (unacceptedRequests != 0) {
            $("#friend-requests-tab").html('Friend Requests' + ("(" + unacceptedRequests + ")").toString().sup());
            $("#friend-requests-dropdown").html('<span class="fas fa-ellipsis-h"></span>' + ("(" + unacceptedRequests + ")").toString().sup());
        }
        else {
            $("#friend-requests-tab").html('Friend Requests');
            $("#friend-requests-dropdown").html('<span class="fas fa-ellipsis-h"></span>');
        }
    });

    socket.on("popup", function (message) {
        $("#alertMsg").text(message);
        $("#alertModal").modal("show");
    });

    socket.on("friendsFriends", function (reply) {
        var friendsFriends = reply; //{userId: [name]}
        $("#friendsFriendsTable").empty();
        var usersElement = document.getElementById("friendsFriendsTable");

        for (var i = 0; i < Object.keys(friendsFriends).length; i++) {
            var friendsFriendId = Object.keys(friendsFriends)[i];
            var friendsFriendName = friendsFriends[friendsFriendId];

            var button = document.createElement("button");
            button.classList.add("textLink");
            button.id = friendsFriendId;
            button.onclick = function () { friendRequest(this.id); };
            button.innerHTML = '<span class="far fa-plus-square fa-fw" data-matchingUserId="' + friendsFriendId + '""></span> ' + friendsFriendName;

            var buttonTd = document.createElement("td");
            buttonTd.appendChild(button);

            var tr = document.createElement("tr");
            tr.appendChild(buttonTd);

            usersElement.appendChild(tr);
        }

        $("#friendsFriendsModal").modal("show");
    });

    socket.on("searchUsersReply", function (reply) {
        var matchingUsers = reply; //{userId: [name, lastOnline]}
        $("#matchingUsers").empty();

        // Sort by num of mutual friends
        var sortedUsers = Object.keys(matchingUsers).sort(function (a, b) {
            return matchingUsers[b][2] - matchingUsers[a][2];
        });

        for (var i = 0; i < sortedUsers.length; i++) {
            var matchingUserId = sortedUsers[i];
            var matchingUserName = escapeHtml(matchingUsers[matchingUserId][0]);
            var matchingUserLastOnline = matchingUsers[matchingUserId][1];
            var usersElement = document.getElementById("matchingUsers");

            if ((friends != undefined && matchingUserId in friends) || matchingUserId == userId) {
                continue; // Already friends
            }

            var button = document.createElement("button");
            button.classList.add("textLink");
            button.id = matchingUserId;
            button.onclick = function () { friendRequest(this.id); };
            button.innerHTML = '<span class="far fa-plus-square fa-fw" data-matchingUserId="' + matchingUserId + '""></span> ' + matchingUserName;

            var lastOnline = document.createElement("a");
            var lastOnlineValue = calcLastOnline(matchingUserLastOnline);

            lastOnline.classList.add("lastOnline");
            lastOnline.innerHTML = lastOnlineValue;

            var buttonTd = document.createElement("td");
            buttonTd.appendChild(button);

            var lastOnlineTd = document.createElement("td");
            lastOnlineTd.align = "right";
            lastOnlineTd.appendChild(lastOnline);

            var tr = document.createElement("tr");
            tr.appendChild(buttonTd);
            tr.appendChild(lastOnlineTd);

            usersElement.appendChild(tr);
        }
    });

    socket.on("friendRequests", function (reply) {
        var friendRequests = reply;

        $("#friendRequests").empty();

        for (var i = 0; i < friendRequests.length; i++) {
            var usersElement = document.getElementById("friendRequests");

            var crossIcon = document.createElement("i");
            crossIcon.setAttribute("class", "far fa-times-circle fa-fw mr-1 textLink");
            crossIcon.setAttribute("data-requesterId", friendRequests[i][2]);
            crossIcon.onclick = function () { declineFriendRequest(this.getAttribute("data-requesterId")); };

            var checkIcon = document.createElement("i");
            checkIcon.setAttribute("class", "fas fa-check fa-fw mr-2 textLink");
            checkIcon.setAttribute("data-requesterId", friendRequests[i][2]);
            checkIcon.onclick = function () { acceptFriendRequest(this.getAttribute("data-requesterId")); };

            var text = document.createElement("a");
            text.classList.add("text");
            text.innerHTML = friendRequests[i][0];

            var lastOnline = document.createElement("a");
            var lastOnlineValue = calcLastOnline(friendRequests[i][1]);

            lastOnline.classList.add("lastOnline");
            lastOnline.innerHTML = lastOnlineValue;

            var divTd = document.createElement("td");
            divTd.appendChild(crossIcon);
            divTd.appendChild(checkIcon);
            divTd.appendChild(text);

            var lastOnlineTd = document.createElement("td");
            lastOnlineTd.align = "right";
            lastOnlineTd.appendChild(lastOnline);

            var tr = document.createElement("tr");
            tr.appendChild(divTd);
            tr.appendChild(lastOnlineTd);

            usersElement.appendChild(tr);
        }

        function acceptFriendRequest(requesterId) {
            socket.emit("acceptFriendRequest", { requesterId: requesterId, username: username });
            $('i[data-requesterId="' + requesterId + '"]').closest("tr").remove();
        }

        function declineFriendRequest(requesterId) {
            socket.emit("declineFriendRequest", { requesterId: requesterId, username: username });
            $('i[data-requesterId="' + requesterId + '"]').closest("tr").remove();
        }
    });

    socket.on("sentFriendRequests", function (reply) {
        var sentFriendRequests = reply;

        $("#sentFriendRequests").empty();

        for (var i = 0; i < sentFriendRequests.length; i++) {
            var usersElement = document.getElementById("sentFriendRequests");

            var button = document.createElement("button");
            button.classList.add("textLink");
            button.id = sentFriendRequests[i][0];
            button.innerHTML = sentFriendRequests[i][0];

            var lastOnline = document.createElement("a");
            var lastOnlineValue = calcLastOnline(sentFriendRequests[i][1]);

            lastOnline.classList.add("lastOnline");
            lastOnline.innerHTML = lastOnlineValue;

            var buttonTd = document.createElement("td");
            buttonTd.appendChild(button);

            var lastOnlineTd = document.createElement("td");
            lastOnlineTd.align = "right";
            lastOnlineTd.appendChild(lastOnline);

            var tr = document.createElement("tr");
            tr.appendChild(buttonTd);
            tr.appendChild(lastOnlineTd);

            usersElement.appendChild(tr);
        }
    });

    socket.on("serverMessage", function (reply) {
        var messageVersion = reply[0];
        var message = reply[1];

        // Get previous received messages
        if (messageVersion === softwareVersion) {
            chrome.storage.local.get(["serverMessageReceived"], function (result) {
                if (result.serverMessageReceived != softwareVersion) {
                    $("#alertMsg").html(message);
                    $("#alertModal").modal("show");
                }
                chrome.storage.local.set({ serverMessageReceived: softwareVersion });
            });
        }
    });

    socket.on("friendRequestStatus", function (status, requesteeId) {
        if (status === "OK") {
            $('span[data-matchinguserid="' + requesteeId + '"]').attr("class", "fas fa-check fa-fw");
        }
        else if (status === "ERROR: Already sent request") {
            $("#alertMsg").text("You have already sent a friend request to that person");
            $("#alertModal").modal("show");
            $("#friendsFriendsModal").modal("hide");
        }
        else if (status === "ERROR: Already friends") {
            $("#alertMsg").text("You are already friends with that person");
            $("#alertModal").modal("show");
            $("#matchingUsers > tr > td > #" + requesteeId).closest("tr").remove();
            $("#friendsFriendsModal").modal("hide");
        }
    });

    socket.on("refreshFriends", function () {
        socket.emit("refreshUsers", { token: validator });
    });

    $("#gamesTable td").on("click", function () {
        var gameName = $(this).data("game-name");

        // Load HTML
        var txtFile = new XMLHttpRequest();
        txtFile.open("GET", "games/" + gameName + "/main.html", true);
        txtFile.onreadystatechange = function () {
            if (txtFile.readyState == 4 && txtFile.status == 200) {
                document.getElementById("gameArea").innerHTML = txtFile.responseText;

                // Load script
                var script = document.createElement("script");
                script.src = "games/" + gameName + "/main.js";
                document.head.appendChild(script);

                // Show game
                $("#gameArea").show();
                $("#backButton").show();
                $("#selectGame").hide();
            }
        };
        txtFile.send(null);
    });

    // On games tab close
    $('#games-tab').on('hidden.bs.tab', function (e) {
        $("#gameArea").hide();
        $("#selectGame").show();
    });

    $("#snake-tab").on('show.bs.tab', function () {
        openSnakeTab();
    });

    $("#2048-game-tab").on('show.bs.tab', function () {
        open2048Tab();
    });

    $("#tetris-tab").on('show.bs.tab', function () {
        openTetrisTab();
    });

    socket.on("gameHighscores", function (reply) {
        var gameName = reply[0];
        var friendScores = reply[1];
        var cfg = reply[2] || {};

        var reverse = cfg.reverse;
        var formatter = window[cfg.formatter];

        $("#gameHighscoresTable").empty();

        var sortedFriendIds = Object.keys(friendScores).sort(function (a, b) {
            return friendScores[a] - friendScores[b];
        });
        console.log(reverse)
        if (!reverse) {
            sortedFriendIds.reverse();
        }

        for (var i = 0; i < sortedFriendIds.length; i++) {
            var friendId = sortedFriendIds[i];
            var friendName;

            if (friendId == userId) {
                friendName = username;
            }
            else {
                friendName = escapeHtml(friends[friendId].name);
            }

            var friendScore
            if (typeof formatter === 'function') {
                friendScore = formatter(friendScores[friendId]);
            }
            else {
                friendScore = friendScores[friendId];
            }

            var nameTd = document.createElement("td");
            nameTd.innerHTML = friendName;

            var scoreTd = document.createElement("td");
            scoreTd.align = "right";
            scoreTd.innerHTML = friendScore;

            var tr = document.createElement("tr");
            tr.appendChild(nameTd);
            tr.appendChild(scoreTd);

            $("#gameHighscoresTable").append(tr);
        }
        $("#gameHighscoresModal").modal("show");
    });

    chrome.permissions.contains({ origins: ["https://www.jblrd.com/"] }, function (result) {
        if (!result) {
            $("#enableNotificationsModal").modal("show");
        }
    });

    $("#enableNotificationsBtn").click(function () {
        chrome.permissions.request({ origins: ['https://www.jblrd.com/'] }, function (granted) {
            if (granted) {
                $("#enableNotificationsModal").modal("hide");
            }
        });
    });

    function checkConnection() {
        if (!socket.connected) {
            login();
        }
    }

    $(".table-search").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $(this).closest("table").find("tbody > tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    $("#make-group-tab").on('show.bs.tab', function () {
        chrome.storage.local.get(["chats"], function (result) {
            var friends = result.chats[0]; // {userId: {name: name, viewStatus: viewStatus, lastActivity: lastActivity, lastOnline: lastOnline, messages: {}, ...}
            var groups = result.chats[1]; // {groupId: {name: name, viewStatus: viewStatus, lastActivity: lastActivity, members: {memberId: {username: username, status: status}}}

            var chats = [];// [[id, type], ...] type: 0: friend, 1: group
            for (var i = 0; i < Object.keys(friends).length; i++) {
                chats.push([Object.keys(friends)[i], 0]);
            }
            for (var i = 0; i < Object.keys(groups).length; i++) {
                chats.push([Object.keys(groups)[i], 1]);
            }

            var sortedChats = chats.sort(function (a, b) {
                var lastActivityA;
                var lastActivityB;

                if (a[1] == 0) {
                    lastActivityA = friends[a[0]].lastActivity;
                }
                else {
                    lastActivityA = groups[a[0]].lastActivity;
                }

                if (b[1] == 0) {
                    lastActivityB = friends[b[0]].lastActivity;
                }
                else {
                    lastActivityB = groups[b[0]].lastActivity;
                }

                return lastActivityA - lastActivityB;
            }).reverse();

            $("#makeGroupTable").empty();

            for (var i = 0; i < sortedChats.length; i++) {
                if (sortedChats[i][1] == 0) { // Is friend
                    var friendsId = sortedChats[i][0];
                    var friendsName = friends[friendsId].name;
                    var friendsViewStatus = friends[friendsId].viewStatus;
                    var lastActivity = friends[friendsId].lastActivity;
                    var friendsLastOnline = friends[friendsId].lastOnline;

                    var lastActivityA = document.createElement("a");
                    var lastActivityFormatted = calcLastOnline(lastActivity);

                    var chatIcon = document.createElement("i");
                    chatIcon.setAttribute("class", "far fa-plus-square fa-fw");

                    var button = document.createElement("button");
                    button.classList.add("textLink");
                    button.setAttribute("data-friendId", friendsId);
                    button.onclick = function () { makeGroupNewFriend(this.getAttribute("data-friendId")); };
                    button.appendChild(chatIcon);
                    button.innerHTML += " " + friendsName;

                    var buttonTd = document.createElement("td");
                    buttonTd.appendChild(button);

                    var tr = document.createElement("tr");
                    tr.appendChild(buttonTd);
                    tr.setAttribute("data-friendId", friendsId);

                    document.getElementById("makeGroupTable").appendChild(tr);
                }
            }
        });

        var friendsInGroup = [];

        function makeGroupNewFriend(friendsId) {
            $("#makeGroupNextBtn").removeAttr("disabled");
            if (friendsInGroup.includes(friendsId)) {
                $('button[data-friendId="' + friendsId + '"] > i').attr("class", "far fa-plus-square fa-fw");

                var friendsId = friendsInGroup.indexOf(friendsId);
                if (friendsId !== -1) friendsInGroup.splice(friendsId, 1);

                if (friendsInGroup.length == 0) {
                    $("#makeGroupNextBtn").attr("disabled", true);
                }
            }
            else {
                $('button[data-friendId="' + friendsId + '"] > i').attr("class", "fas fa-check fa-fw");
                friendsInGroup.push(friendsId);
            }
        }

        $("#makeGroupNextBtn").on("click", function () {
            $("#makeGroupModal").modal("show");
        });

        $("#makeGroupCreateBtn").click(function () {
            var groupName = $("#makeGroupName").val();
            if (groupName.length == 0) {
                $("#makeGroupName").val("");
                $("#makeGroupName").attr("placeholder", "Cannot be left empty");
                $('#makeGroupName').attr('style', 'border-color: red !important;');
            }
            else {
                $("#makeGroupName").attr("placeholder", "Group Name");
                $('#makeGroupName').removeAttr("style");

                socket.emit("makeGroup", { username: username, groupName: groupName, groupMembers: friendsInGroup });
            }
        });

        socket.on("groupMade", function () {
            $("#makeGroupModal").modal("hide");
            $("#friends-tab").tab('show');
        });
    });

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.getGameHighScores = function (game, cfg) {
        socket.emit("getGameHighScores", { username: username, gameName: game, cfg: cfg });
    };

    window.gameHighScore = function (game, score) {
        socket.emit("gameHighScore", { username: username, gameName: game, score: score });
    };

    window.onerror = function (message, url, lineNumber) {
        socket.emit("clientError", { message: message, url: url, lineNumber: lineNumber });
    };
})();