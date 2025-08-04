sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {
        
        /**
         * Device Model für responsive Design
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        /**
         * Workshop-spezifische Models
         */
        createWorkshopModels: function() {
            return {
                // Backend-Status Model
                backendStatus: new JSONModel({
                    odata: {
                        connected: false,
                        lastCall: null,
                        responseTime: 0
                    },
                    cap: {
                        running: false,
                        lastDeployment: null,
                        serviceCount: 0
                    },
                    integration: {
                        configured: false,
                        flowsActive: 0,
                        lastSync: null
                    }
                }),

                // Data-Source Tracking
                dataSource: new JSONModel({
                    current: "mock",
                    available: ["mock", "odata", "cap"],
                    switchHistory: []
                }),

                // Workshop-Progress Tracking
                progress: new JSONModel({
                    day1: {
                        btpSetup: false,
                        odataIntegration: false,
                        userManagement: false
                    },
                    day2: {
                        capProject: false,
                        entityModeling: false,
                        serviceDeployment: false
                    },
                    day3: {
                        integrationSuite: false,
                        apiManagement: false,
                        endToEndTesting: false
                    },
                    day4: {
                        basWorkspace: false,
                        serviceHandlers: false,
                        aggregationPrep: false
                    },
                    day5: {
                        erpIntegration: false,
                        ui5Optimization: false,
                        workshopCompletion: false
                    }
                })
            };
        }
    };
});