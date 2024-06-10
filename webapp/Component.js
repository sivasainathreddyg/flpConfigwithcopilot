sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/Button"
], function (UIComponent, Dialog, Text, Button) {
    "use strict";

    return UIComponent.extend("projectshell.Component", {

        metadata: {
            manifest: "json"
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * @public
         * @override
         */
        init: function () {
            // Load chatbot as soon as the component is initialized
            this._loadChatbot();

            var rendererPromise = this._getRenderer();
            rendererPromise.then(function (oRenderer) {
                oRenderer.addHeaderEndItem({
                    icon: "sap-icon://add",
                    tooltip: "Add bookmark",
                    press: this._handlePress.bind(this)
                }, true); // Set bRight to true to add the button to the right side
            }.bind(this)); // Ensure 'this' refers to the correct context
            return;
        },

        _loadChatbot: function () {
            // Create a floating button for the chatbot
            var chatButton = document.createElement("button");
            chatButton.setAttribute("id", "chatbot-button");
            chatButton.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Microsoft_365_Copilot_Icon.svg" alt="Chatbot" style="width: 24px; height: 24px;">';
            chatButton.setAttribute("style", "position: fixed; bottom: 20px; right: 20px; z-index: 1001; background-color: #007AFF; border: none; border-radius: 50%; width: 56px; height: 56px; cursor: pointer;");
            
            chatButton.addEventListener("click", function() {
                this._toggleChatbot();
            }.bind(this));

            document.body.appendChild(chatButton);
        },

        _toggleChatbot: function () {
            var iframe = document.getElementById("copilot-webchat");
            if (iframe) {
                // If iframe exists, toggle its visibility
                iframe.style.display = (iframe.style.display === "none" || iframe.style.display === "") ? "block" : "none";
            } else {
                // Create and show the iframe
                iframe = document.createElement("iframe");
                iframe.setAttribute("id", "copilot-webchat");
                iframe.setAttribute("src", "https://copilotstudio.microsoft.com/environments/Default-64d41f76-8ae4-44c7-a8ee-b9c50e07150b/bots/cr9f5_copilot/webchat?__version__=2");
                iframe.setAttribute("frameborder", "0");
                iframe.setAttribute("style", "width: 400px; height: 600px; position: fixed; bottom: 0; right: 0; z-index: 1000; border: none;");

                document.body.appendChild(iframe);
            }
        },

        _handlePress: function () {
            // Placeholder for the press event logic
            console.log("Add bookmark button pressed.");
        },

        _getRenderer: function () {
            var that = this,
                oDeferred = new jQuery.Deferred(),
                oRenderer;

            that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
            if (!that._oShellContainer) {
                oDeferred.reject(
                    "Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
            } else {
                oRenderer = that._oShellContainer.getRenderer();
                if (oRenderer) {
                    oDeferred.resolve(oRenderer);
                } else {
                    // renderer not initialized yet, listen to rendererCreated event
                    that._onRendererCreated = function (oEvent) {
                        oRenderer = oEvent.getParameter("renderer");
                        if (oRenderer) {
                            oDeferred.resolve(oRenderer);
                        } else {
                            oDeferred.reject("Illegal state: shell renderer not available after receiving 'rendererLoaded' event.");
                        }
                    };
                    that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
                }
            }
            return oDeferred.promise();
        }
    });
});
