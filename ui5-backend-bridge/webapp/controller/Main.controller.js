// webapp/controller/Main.controller.js
sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (BaseController, MessageToast, MessageBox, Fragment) {
    "use strict";

    return BaseController.extend("workshop.bridge.controller.Main", {
        
        onInit: function() {
            // Initialisierung der UI-Komponenten aus dem vorherigen Workshop
            this._initializeFragments();
            this._setupDialogs();
            this._prepareDataModels();
            
            // Backend-Integration Vorbereitung
            this._initializeBackendConnections();
            
            MessageToast.show("UI5 Frontend bereit - Backend Integration wird vorbereitet");
        },

        /**
         * Fragment-Initialisierung (Referenz zum vorherigen Workshop)
         * Zeigt konkret, wo der vorherige Workshop endete
         */
        _initializeFragments: function() {
            // Nested Views Struktur aus vorherigem Workshop
            this._oNestedViewContainer = this.byId("nestedViewContainer");
            
            // Fragment-Referenzen für spätere Backend-Integration
            this._aLoadedFragments = [];
            
            console.log("✅ Fragments und Nested Views aus vorherigem Workshop verfügbar");
        },

        /**
         * Dialog-Setup (Referenz zum vorherigen Workshop)
         * Diese Dialogs werden später mit Backend-Daten gefüllt
         */
        _setupDialogs: function() {
            // Customer Dialog aus vorherigem Workshop
            this._oCustomerDialog = null;
            this._oInvoiceDialog = null;
            
            // Placeholder für Backend-Daten
            this._oDialogData = {
                customers: [], // Wird heute mit Backend-Service gefüllt
                invoices: []   // Wird heute mit CAP-Service gefüllt
            };
            
            console.log("✅ Dialog-Struktur aus vorherigem Workshop bereit für Backend-Integration");
        },

        /**
         * Datenmodell-Vorbereitung
         * Hier wird der Übergang von Mock-Daten zu echten Backend-Services vorbereitet
         */
        _prepareDataModels: function() {
            // JSON Model mit Mock-Daten (Endpunkt des vorherigen Workshops)
            var oMockData = {
                customers: [
                    {
                        id: "MOCK_001",
                        name: "Mock Customer 1",
                        status: "Placeholder",
                        note: "Wird heute durch Backend-Service ersetzt"
                    },
                    {
                        id: "MOCK_002", 
                        name: "Mock Customer 2",
                        status: "Placeholder",
                        note: "Wird heute durch CAP-Service ersetzt"
                    }
                ],
                invoices: [
                    {
                        id: "INVOICE_MOCK_001",
                        customerName: "Mock Customer 1",
                        amount: "0.00",
                        status: "PLACEHOLDER",
                        note: "Echte Daten kommen heute vom Backend"
                    }
                ]
            };

            // Model setzen (wird später durch Backend-Services ersetzt)
            var oJsonModel = new sap.ui.model.json.JSONModel(oMockData);
            this.getView().setModel(oJsonModel, "mockData");
            
            console.log("✅ Mock-Datenmodell gesetzt - Bereit für Backend-Ersetzung");
        },

        /**
         * Backend-Verbindungen initialisieren
         * Dies ist der zentrale Hook für die heutige Workshop-Session
         */
        _initializeBackendConnections: function() {
            // Placeholder für OData-Services (heute implementiert)
            this._oDataServiceUrl = null;
            this._oCAPServiceUrl = null;
            
            // Service-Status für Workshop-Monitoring
            this._oServiceStatus = {
                odata: false,
                cap: false,
                integration: false
            };
            
            console.log("🔄 Backend-Hooks bereit - Integration startet heute");
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
                    
                    // HOOK: Hier werden heute Backend-Daten geladen
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
         * Dies ist der zentrale Punkt für die Backend-Integration
         */
        _loadCustomerDataFromBackend: function() {
            // TODO: Wird heute implementiert
            MessageToast.show("🔄 Backend-Service wird verbunden... (heute implementiert)");
            
            // Placeholder für OData-Call
            this._makeODataCall();
        },

        /**
         * OData-Service Call (HEUTE IMPLEMENTIERT)
         * Konkreter Anknüpfungspunkt für Backend-Integration
         */
        _makeODataCall: function() {
            // TODO: Heute implementiert
            console.log("📡 OData-Service wird heute implementiert");
            
            // Simulation der Service-Antwort für Workshop-Zwecke
            setTimeout(function() {
                MessageBox.information(
                    "Backend-Service Verbindung wird heute hergestellt!\n\n" +
                    "Nächste Schritte:\n" +
                    "1. BTP-Account Setup ✅\n" +
                    "2. OData-Service Konfiguration 🔄\n" +
                    "3. CAP-Service Integration 🔄\n" +
                    "4. Live-Daten in UI5-Komponenten 🔄",
                    {
                        title: "Workshop-Status"
                    }
                );
            }, 1500);
        },

        /**
         * Invoice List anzeigen (aus vorherigem Workshop)
         * HEUTE: Vorbereitung für Aggregation Binding
         */
        onShowInvoiceList: function() {
            if (!this._oInvoiceListFragment) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "workshop.bridge.view.fragments.InvoiceList",
                    controller: this
                }).then(function(oFragment) {
                    this._oInvoiceListFragment = oFragment;
                    this.getView().addDependent(oFragment);
                    
                    // HOOK: Vorbereitung für Aggregation Binding (nächster Workshop)
                    this._prepareAggregationBinding();
                    
                    // Fragment in Nested View Container einbetten
                    this._oNestedViewContainer.addContent(oFragment);
                }.bind(this));
            }
        },

        /**
         * Aggregation Binding Vorbereitung
         * Brücke zum nächsten Workshop: "Walkthrough Application: Aggregation Bindung"
         */
        _prepareAggregationBinding: function() {
            // Vorbereitung der Datenstruktur für den nächsten Workshop
            var oAggregationData = {
                invoices: {
                    results: [], // Wird heute mit Backend-Daten gefüllt
                    __count: 0   // Für Aggregation Binding optimiert
                }
            };
            
            // Model für nächsten Workshop vorbereiten
            var oAggregationModel = new sap.ui.model.json.JSONModel(oAggregationData);
            this.getView().setModel(oAggregationModel, "aggregation");
            
            console.log("🎯 Aggregation Binding Struktur für nächsten Workshop vorbereitet");
        },

        /**
         * Backend-Status prüfen (Workshop-Monitoring)
         */
        onCheckBackendStatus: function() {
            var sStatusMessage = "Backend-Services Status:\n\n";
            sStatusMessage += "🔄 OData-Service: Wird heute konfiguriert\n";
            sStatusMessage += "🔄 CAP-Service: Wird heute entwickelt\n";
            sStatusMessage += "🔄 Integration Suite: Wird heute eingerichtet\n";
            sStatusMessage += "🎯 Aggregation Binding: Für nächsten Workshop vorbereitet";
            
            MessageBox.information(sStatusMessage, {
                title: "Workshop-Fortschritt Tag 1"
            });
        }
    });
});
