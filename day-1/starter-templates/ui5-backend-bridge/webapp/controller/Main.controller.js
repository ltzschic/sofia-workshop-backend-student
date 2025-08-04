sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("workshop.ui5.bridge.controller.Main", {
        onInit: function () {
            MessageToast.show("UI5 Bridge App gestartet - Backend Integration folgt!");
            console.log("✅ UI5 Controller initialisiert - bereit für Workshop!");
        }
    });
});

