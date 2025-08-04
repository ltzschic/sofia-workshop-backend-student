sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "workshop/bridge/model/models"
], function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("workshop.bridge.Component", {

        metadata: {
            manifest: "json"
        },

        /**
         * Component-Initialisierung
         */
        init: function () {
            // Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // Set the device model
            this.setModel(models.createDeviceModel(), "device");

            // Workshop-spezifische Initialisierung
            this._initializeWorkshopEnvironment();

            console.log("🎯 Workshop Bridge Component initialisiert");
        },

        /**
         * Workshop-Environment Setup
         */
        _initializeWorkshopEnvironment: function() {
            // Workshop-Kontext Model
            var oWorkshopModel = new sap.ui.model.json.JSONModel({
                name: "Sofia Backend Integration",
                day: 1,
                phase: "Frontend-to-Backend Bridge",
                previousCompleted: true,
                backendIntegrationReady: false,
                capDevelopmentReady: false
            });
            
            this.setModel(oWorkshopModel, "workshop");
            
            // Backend-Services Konfiguration
            this._setupBackendServices();
        },

        /**
         * Backend-Services Setup
         */
        _setupBackendServices: function() {
            // Service-URLs für verschiedene Workshop-Phasen
            var oServiceConfig = {
                mock: {
                    baseUrl: "/mock-data/",
                    active: true
                },
                odata: {
                    baseUrl: "https://services.odata.org/V2/Northwind/Northwind.svc/",
                    active: false // Wird heute aktiviert
                },
                cap: {
                    baseUrl: "http://localhost:4004/service/",
                    active: false // Wird ab Tag 2 aktiviert
                }
            };
            
            var oServiceModel = new sap.ui.model.json.JSONModel(oServiceConfig);
            this.setModel(oServiceModel, "services");
            
            console.log("🔧 Backend-Services konfiguriert:", oServiceConfig);
        }
    });
});