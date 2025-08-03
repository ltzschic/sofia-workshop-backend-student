sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("workshop.controller.Main", {
        onInit: function() {
            // Simulation der letzten Workshop-Inhalte
            this._initializeFromPreviousWorkshop();
            
            // Placeholder für Backend-Integration
            this._prepareBackendConnection();
        },

        _initializeFromPreviousWorkshop: function() {
            // Simuliere existierende Nested Views und Dialogs
            var oModel = new JSONModel({
                currentUser: "Workshop Teilnehmer",
                previousWorkshopComplete: true,
                readyForBackend: false,
                // Mock-Daten die durch Backend ersetzt werden sollen
                mockInvoices: []
            });
            this.getView().setModel(oModel, "workshop");
            
            MessageToast.show("UI5 Frontend bereit - Backend Integration folgt heute");
        },

        _prepareBackendConnection: function() {
            // TODO: Wird in Exercise 2 implementiert
            console.log("Backend-Verbindung wird vorbereitet...");
        },

        // Event Handler für Backend-Calls (wird heute gefüllt)
        onConnectToBackend: function() {
            MessageToast.show("Backend Service wird heute implementiert!");
            // TODO: Exercise 2 - Erste OData-Calls
        },

        onLoadInvoices: function() {
            MessageToast.show("Rechnungsdaten werden heute aus Backend geladen!");
            // TODO: Exercise 3 - CAP Service Integration
        }
    });
});
