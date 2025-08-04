sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
], function (BaseController, MessageToast, MessageBox, Fragment, JSONModel) {
    "use strict";

    return BaseController.extend("workshop.bridge.controller.Main", {
        
        onInit: function() {
            // Backend-Hooks aus BaseController initialisieren
            this._initializeBackendHooks();
            
            // Workshop-spezifische Initialisierung
            this._initializeWorkshopData();
            this._setupFragmentReferences();
            this._prepareBackendIntegration();
            
            MessageToast.show("✅ UI5 Frontend bereit - Backend Integration wird heute implementiert!");
        },

        /**
         * Workshop-Daten initialisieren (Referenz zum vorherigen Workshop)
         */
        _initializeWorkshopData: function() {
            // Mock-Daten aus dem vorherigen Workshop
            var oMockData = {
                customers: [
                    {
                        id: "MOCK_001",
                        name: "Mock Customer 1",
                        status: "Active",
                        note: "Wird heute durch Backend-Service ersetzt",
                        revenue: 1250000,
                        lastContact: "2025-01-15"
                    },
                    {
                        id: "MOCK_002",
                        name: "Mock Customer 2", 
                        status: "Prospect",
                        note: "Wird heute durch CAP-Service ersetzt",
                        revenue: 850000,
                        lastContact: "2025-01-20"
                    }
                ],
                invoices: [
                    {
                        id: "INV_MOCK_001",
                        customerName: "Mock Customer 1",
                        amount: "15,750.50",
                        status: "PLACEHOLDER",
                        note: "Echte Daten kommen heute vom Backend"
                    }
                ],
                // Workshop-Status
                workshopStatus: {
                    previousWorkshopCompleted: true,
                    backendIntegrationReady: false,
                    capServicesReady: false
                }
            };

            // Mock-Daten Model setzen
            var oJsonModel = new JSONModel(oMockData);
            this.setModel(oJsonModel, "mockData");
            
            console.log("📊 Mock-Daten aus vorherigem Workshop geladen");
        },

        /**
         * Fragment-Referenzen für UI-Komponenten aus vorherigem Workshop
         */
        _setupFragmentReferences: function() {
            // Dialog-Referenzen aus vorherigem Workshop
            this._oCustomerDialog = null;
            this._oInvoiceDialog = null;
            
            // Fragment-Array für Verwaltung
            this._aLoadedFragments = [];
            
            console.log("🎭 Fragment-Referenzen für Backend-Integration vorbereitet");
        },

        /**
         * Backend-Integration Vorbereitung
         */
        _prepareBackendIntegration: function() {
            // Service-Status Model
            var oBackendStatus = new JSONModel({
                odataConnected: false,
                capServiceRunning: false,
                integrationTested: false,
                lastBackendCall: null,
                dataSource: "mock" // "mock" | "odata" | "cap"
            });
            
            this.setModel(oBackendStatus, "backendStatus");
            
            console.log("🔄 Backend-Integration vorbereitet");
        },

        /**
         * Customer Dialog öffnen (aus vorherigem Workshop)
         * HEUTE: Wird mit echten Backend-Daten gefüllt
         */
        onOpenCustomerDialog: function() {
            if (!this._oCustomerDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "workshop.bridge.view.fragments.CustomerDialog",
                    controller: this
                }).then(function(oDialog) {
                    this._oCustomerDialog = oDialog;
                    this.getView().addDependent(oDialog);
                    
                    // HOOK: Backend-Daten laden
                    this._loadCustomerDataFromBackend();
                    
                    oDialog.open();
                }.bind(this));
            } else {
                // HOOK: Daten-Refresh vom Backend
                this._loadCustomerDataFromBackend();
                this._oCustomerDialog.open();
            }
        },

        /**
         * Backend-Daten laden (HEUTE IMPLEMENTIERT)
         */
        _loadCustomerDataFromBackend: function() {
            MessageToast.show("🔄 Backend-Service wird heute verbunden...");
            
            // Backend-Service Call (wird heute implementiert)
            this._callBackendService("odata", "/CustomerSet", {
                $top: 10,
                $select: "CustomerID,CompanyName,Country"
            }).then(function(result) {
                console.log("📡 Backend-Response:", result);
                
                // UI-Update mit Backend-Daten
                this.getModel("backendStatus").setProperty("/lastBackendCall", new Date().toLocaleTimeString());
                this.getModel("backendStatus").setProperty("/dataSource", "backend");
                
                MessageBox.information(
                    "🎯 Backend-Integration erfolgreich!\n\n" +
                    "Heute implementiert:\n" +
                    "✅ OData-Service Verbindung\n" +
                    "✅ CAP-Service Integration\n" +
                    "✅ Live-Daten in UI5-Komponenten",
                    {
                        title: "Workshop-Fortschritt"
                    }
                );
            }.bind(this));
        },

        /**
         * Invoice List anzeigen (Vorbereitung für Aggregation Binding)
         */
        onShowInvoiceList: function() {
            MessageToast.show("📦 Invoice-Liste wird für Aggregation Binding vorbereitet");
            
            // Aggregation-Daten vorbereiten
            var oAggregationData = {
                invoices: {
                    results: [], // Wird heute mit Backend-Daten gefüllt
                    __count: 0   // Für UI5 Aggregation Binding optimiert
                },
                summary: {
                    totalAmount: 0,
                    averageAmount: 0,
                    pendingCount: 0
                }
            };
            
            var oAggregationModel = new JSONModel(oAggregationData);
            this.setModel(oAggregationModel, "aggregation");
            
            console.log("🎯 Aggregation Binding Struktur für nächsten Workshop vorbereitet");
        },

        /**
         * Backend-Status prüfen
         */
        onCheckBackendStatus: function() {
            var oStatus = this.getModel("backendStatus").getData();
            
            var sStatusMessage = "🔍 Backend-Services Status:\n\n";
            sStatusMessage += `📊 Datenquelle: ${oStatus.dataSource}\n`;
            sStatusMessage += `🔄 OData-Service: ${oStatus.odataConnected ? 'Verbunden' : 'Wird heute konfiguriert'}\n`;
            sStatusMessage += `⚙️ CAP-Service: ${oStatus.capServiceRunning ? 'Läuft' : 'Wird heute entwickelt'}\n`;
            sStatusMessage += `🧪 Integration: ${oStatus.integrationTested ? 'Getestet' : 'Wird heute implementiert'}\n`;
            
            if (oStatus.lastBackendCall) {
                sStatusMessage += `\n🕒 Letzter Backend-Call: ${oStatus.lastBackendCall}`;
            }
            
            MessageBox.information(sStatusMessage, {
                title: "Workshop-Status Check"
            });
        },

        /**
         * Mock-Daten vs. Backend-Daten Vergleich
         */
        onCompareMockVsBackend: function() {
            var sMockData = JSON.stringify(this.getModel("mockData").getData().customers[^0], null, 2);
            
            console.log("📊 Mock-Daten (Vorheriger Workshop):");
            console.log(sMockData);
            
            console.log("\n🌐 Backend-Daten (Heute implementiert):");
            console.log("Wird heute mit echten OData-Services gefüllt!");
            
            MessageToast.show("📋 Daten-Vergleich in der Browser-Console - F12 öffnen!");
        },

        /**
         * Workshop-Übergang demonstrieren
         */
        onDemonstrateWorkshopTransition: function() {
            MessageBox.information(
                "🚀 Workshop-Übergang:\n\n" +
                "✅ VORHERIGER WORKSHOP:\n" +
                "• Nested Views implementiert\n" +
                "• Dialogs funktional\n" +
                "• Fragments wiederverwendbar\n" +
                "• Mock-Daten in UI5-Komponenten\n\n" +
                "🎯 HEUTE (Backend-Integration):\n" +
                "• BTP-Services konfigurieren\n" +
                "• OData-Calls implementieren\n" +
                "• CAP-Services entwickeln\n" +
                "• Echte Daten in dieselben UI-Komponenten\n\n" +
                "🔮 NÄCHSTER WORKSHOP:\n" +
                "• UI5 Aggregation Binding\n" +
                "• Optimierte Datenvisualisierung",
                {
                    title: "Workshop-Kontinuum"
                }
            );
        }
    });
});