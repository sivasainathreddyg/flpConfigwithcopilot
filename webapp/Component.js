sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ushell/services/Container"
], function (UIComponent, Container) {
    "use strict";

    return UIComponent.extend("projectshell.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            this.title = 'Home';
            this.botOpen = false; // Track whether the bot is open
            UIComponent.prototype.init.apply(this, arguments);
            this._loadChatbotButton();
            this._onHashChange = this._onHashChange.bind(this); // Bind context for hash change
            window.addEventListener("hashchange", this._onHashChange, true);
            this._fetchTiles();
        },

        _fetchTiles: function () {
            sap.ushell.Container.getService("LaunchPage").getGroups().then(function (aGroups) {
                window.UserTiles = [];
                for (var i = 0; i < aGroups.length; i++) {
                    var aGrpTiles = sap.ushell.Container.getService("LaunchPage").getGroupTiles(aGroups[i]);
                    for (var j = 0; j < aGrpTiles.length; j++) {
                        var sTileTitle = sap.ushell.Container.getService("LaunchPage").getTileTitle(aGrpTiles[j]);
                        var sTileTarget = sap.ushell.Container.getService("LaunchPage").getCatalogTileTargetURL(aGrpTiles[j]);
                        if (sTileTitle.indexOf("App Launcher") === 0) {
                            sTileTitle = sTileTarget;
                        }
                        window.UserTiles.push({
                            title: sTileTitle,
                            url: sTileTarget
                        });
                    }
                }
            });
        },

        _onHashChange: function (oEvent) {
            var sNewHash = this._getHashFromURL(oEvent.newURL);
            this.title = this._getTitleFromHash(sNewHash);
            this.service=oEvent.newURL;

            if (this.botOpen) {
                // Update the chatbot URL and title when hash changes and bot is open
                this._updateIframe();
            }
        },

        _getHashFromURL: function (url) {
            var hashIndex = url.indexOf("#");
            return hashIndex !== -1 ? url.substring(hashIndex + 1) : "";
        },

        _getTitleFromHash: function (hash) {
            var matchedTile = window.UserTiles.find(function (tile) {
                return tile.url.includes(hash);
            });
            return matchedTile ? matchedTile.title : hash; // Return hash if no title matches
        },

        _loadChatbotButton: function () {
            var chatButton = document.createElement("button");
            chatButton.setAttribute("id", "chatbot-button");
            chatButton.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Microsoft_365_Copilot_Icon.svg" alt="Chatbot" style="width: 24px; height: 24px;">';
            chatButton.setAttribute("style", "position: fixed; bottom: 20px; right: 20px; z-index: 1001; background-color: #E6F3FF; border: 2px solid #5DADE2; border-radius: 50%; width: 56px; height: 56px; cursor: pointer;");

            chatButton.addEventListener("click", function () {
                this._toggleChatbot();
            }.bind(this));

            document.body.appendChild(chatButton);
        },

        _toggleChatbot: function () {
            var iframeContainer = document.getElementById("copilot-iframe-container");
            if (iframeContainer) {
                iframeContainer.style.display = (iframeContainer.style.display === "none") ? "block" : "none";
                this.botOpen = !this.botOpen; // Toggle the botOpen flag
                document.getElementById("chatbot-button").style.display = this.botOpen ? "none" : "block"; // Hide/show the Copilot icon based on botOpen flag
            } else {
                this._createIframe();
                this.botOpen = true; // Update botOpen flag
                document.getElementById("chatbot-button").style.display = "none"; // Hide the Copilot icon when bot is open
            }
        },

        _createIframe: function () {
            var iframeContainer = document.createElement("div");
            iframeContainer.setAttribute("id", "copilot-iframe-container");
            iframeContainer.setAttribute("style", "position: fixed; bottom: 20px; right: 20px; z-index: 1000; margin: 20px; background-color: #E6F3FF; border: 2px solid #5DADE2; border-radius: 10px;");

            var iframe = document.createElement("iframe");
            iframe.setAttribute("id", "copilot-webchat");
            iframe.setAttribute("src", this._getChatbotUrl());
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("style", "width: 400px; height: 600px; border: none;");

            var closeButton = document.createElement("button");
            closeButton.setAttribute("id", "copilot-close-button");
            closeButton.innerHTML = "&#10005;";
            closeButton.setAttribute("style", "position: absolute; top: -10px; right: 30px; z-index: 1001; background-color: red; border: none; color: white; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;");

            var refreshButton = document.createElement("button");
            refreshButton.setAttribute("id", "copilot-refresh-button");
            refreshButton.innerHTML = "&#8635;"; // Unicode for refresh symbol
            refreshButton.setAttribute("style", "position: absolute; top: -10px; right: -10px; z-index: 1001; background-color: blue; border: none; color: white; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;");

            closeButton.addEventListener("click", function () {
                iframeContainer.style.display = "none";
                this.botOpen = false; // Update botOpen flag
                document.getElementById("chatbot-button").style.display = "block"; // Show the Copilot icon when bot is closed
            }.bind(this));

            refreshButton.addEventListener("click", function () {
                // Reload the iframe with the same URL to clear the conversation
                iframe.src = this._getChatbotUrl() + "&ts=" + new Date().getTime(); // Add a unique timestamp to the URL
            }.bind(this));

            iframeContainer.appendChild(iframe);
            iframeContainer.appendChild(closeButton);
            iframeContainer.appendChild(refreshButton);
            document.body.appendChild(iframeContainer);
        },

        _updateIframe: function () {
            var iframe = document.getElementById("copilot-webchat");
            if (iframe) {
                iframe.src = this._getChatbotUrl() + "&ts=" + new Date().getTime(); // Add a unique timestamp to the URL
            }
        },

        _getChatbotUrl: function () {
            var chatbotBaseUrl = "https://copilotstudio.microsoft.com/environments/Default-64d41f76-8ae4-44c7-a8ee-b9c50e07150b/bots/cr9f5_copilot/webchat";
            var initialParams = {
                __version__: 3, // Add any other required initial parameters here
                title: this.title, // Add the title parameter with the value of this.title
                service: this.service, // Adding the tile service
                Test: 'Test'
            };
            return chatbotBaseUrl + "?" + new URLSearchParams(initialParams).toString();
        }
    });
});
