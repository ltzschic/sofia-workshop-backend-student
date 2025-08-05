sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/core/BusyIndicator",
    "workshop/ui5/bridge/service/BackendService"
], function (Controller, MessageToast, MessageBox, Fragment, ODataModel, BusyIndicator, BackendService) {
    "use strict";

    return Controller.extend("workshop.ui5.bridge.controller.Main", {

        /**
         * Controller Initialisierung
         * Hier wird der BackendService initialisiert
         */
        onInit: function () {
            console.log("UI5 Frontend Controller initialisiert");
            
            // BackendService-Instanz erstellen
            this._oBackendService = new BackendService(this.getOwnerComponent());
            
            // Beide Models sind verfügbar:
            // - Default Model (JSON): für Mock-Daten
            // - OData Model: für Backend-Services
            var oODataModel = this.getOwnerComponent().getModel("odata");
            console.log("OData Model verfügbar:", !!oODataModel);
            console.log("BackendService initialisiert:", !!this._oBackendService);
            
            MessageToast.show("UI5 App geladen - Backend Service bereit!");
        },

        /**
         * METHODE 1: Direkter OData-Call (wie vorher implementiert)
         * Für Lernzwecke und Debugging
         */
        onLoadFromBackend: function () {
            MessageToast.show("Lade Daten vom Backend (direkt)...");
            
            // Loading-Indikator anzeigen
            BusyIndicator.show(0);
            
            // OData Model holen
            var oODataModel = this.getOwnerComponent().getModel("odata");
            
            if (!oODataModel) {
                BusyIndicator.hide();
                MessageBox.error("OData Model nicht verfügbar. Prüfen Sie die manifest.json Konfiguration.");
                return;
            }
            
            // Direkter Service-Call
            oODataModel.read("/Products", {
                urlParameters: {
                    "$top": "10",
                    "$select": "ProductID,ProductName,UnitPrice,UnitsInStock"
                },
                success: function (oData, oResponse) {
                    BusyIndicator.hide();
                    
                    console.log("✅ Direkter OData Call erfolgreich:", oData);
                    console.log("Response Details:", oResponse);
                    
                    var iCount = oData.results ? oData.results.length : 0;
                    MessageToast.show("✅ " + iCount + " Produkte direkt vom Backend geladen!");
                    
                    // Daten für UI aufbereiten und anzeigen
                    this._updateUIWithBackendData(oData.results);
                    
                }.bind(this),
                
                error: function (oError) {
                    BusyIndicator.hide();
                    
                    console.error("❌ Direkter OData Call Fehler:", oError);
                    
                    var sErrorMsg = "Backend-Verbindung fehlgeschlagen.\n\n";
                    if (oError.responseText) {
                        try {
                            var oErrorData = JSON.parse(oError.responseText);
                            sErrorMsg += "Details: " + (oErrorData.error?.message?.value || "Unbekannter Fehler");
                        } catch (e) {
                            sErrorMsg += "HTTP Status: " + oError.statusCode;
                        }
                    }
                    
                    MessageBox.error(sErrorMsg, {
                        title: "Backend-Fehler",
                        actions: [MessageBox.Action.OK, "Retry"],
                        onClose: function (sAction) {
                            if (sAction === "Retry") {
                                this.onLoadFromBackend();
                            }
                        }.bind(this)
                    });
                }.bind(this)
            });
        },

        /**
         * METHODE 2: Über BackendService (empfohlener Weg)
         * Abstrahierte Service-Nutzung mit Promise-basierter API
         */
        onLoadFromBackendService: function () {
            MessageToast.show("Lade Daten über BackendService...");
            BusyIndicator.show(0);
            
            // Service-Call über Abstraktion
            this._oBackendService.loadInvoices({ top: "15" })
                .then(function (aInvoices) {
                    BusyIndicator.hide();
                    
                    console.log("✅ BackendService Call erfolgreich:", aInvoices);
                    
                    // UI Model direkt aktualisieren
                    this._updateUIWithBackendData(aInvoices);
                    
                    MessageToast.show("✅ " + aInvoices.length + " Einträge über BackendService geladen");
                    
                }.bind(this))
                .catch(function (oError) {
                    BusyIndicator.hide();
                    
                    console.error("❌ BackendService Fehler:", oError);
                    MessageBox.error(
                        "Backend Service Fehler:\n\n" + 
                        (oError.message || oError.responseText || "Unbekannter Fehler"),
                        {
                            title: "Service-Fehler",
                            actions: [MessageBox.Action.OK, "Retry"],
                            onClose: function (sAction) {
                                if (sAction === "Retry") {
                                    this.onLoadFromBackendService();
                                }
                            }.bind(this)
                        }
                    );
                }.bind(this));
        },

        /**
         * METHODE 3: Summary-Daten über BackendService laden
         */
        onLoadSummaryFromService: function () {
            BusyIndicator.show(0);
            
            Promise.all([
                this._oBackendService.loadInvoices({ top: "50" }),
                this._oBackendService.loadSummary()
            ]).then(function (aResults) {
                BusyIndicator.hide();
                
                var aInvoices = aResults[0];
                var oSummary = aResults[1];
                
                console.log("✅ Summary und Invoices geladen:", { invoices: aInvoices, summary: oSummary });
                
                // UI komplett aktualisieren
                var oModel = this.getView().getModel();
                var oData = oModel.getData();
                
                // Invoices ersetzen
                oData.invoices = aInvoices;
                
                // Summary aktualisieren
                oData.summary = {
                    totalAmount: oSummary.totalAmount,
                    openAmount: this._calculateOpenAmount(aInvoices),
                    paidAmount: oSummary.totalAmount - this._calculateOpenAmount(aInvoices)
                };
                
                oModel.setData(oData);
                
                MessageToast.show("✅ Daten und Summary komplett aktualisiert");
                
            }.bind(this)).catch(function (oError) {
                BusyIndicator.hide();
                MessageBox.error("Fehler beim Laden der Summary-Daten");
                console.error("Summary Load Error:", oError);
            });
        },

        /**
         * Backend-Daten für UI aufbereiten
         * Konvertiert verschiedene Datenformate in unser UI-Schema
         */
        _updateUIWithBackendData: function (aBackendData) {
            var aInvoices;
            
            // Prüfen ob Daten bereits konvertiert sind (von BackendService)
            if (aBackendData.length > 0 && aBackendData[0].invoiceNumber) {
                // Bereits konvertierte Daten vom BackendService
                aInvoices = aBackendData;
            } else {
                // Rohdaten von direktem OData-Call - konvertieren
                aInvoices = aBackendData.map(function (oProduct, iIndex) {
                    return {
                        id: oProduct.ProductID ? oProduct.ProductID.toString() : "BACKEND_" + iIndex,
                        invoiceNumber: "PROD-" + (oProduct.ProductID || iIndex),
                        customerName: oProduct.ProductName || "Unbekanntes Produkt",
                        amount: parseFloat(oProduct.UnitPrice) || 0,
                        status: (oProduct.UnitsInStock > 0) ? "Verfügbar" : "Nicht verfügbar",
                        date: new Date().toISOString().split('T')[0],
                        description: "Backend-Produkt: " + (oProduct.ProductName || "N/A")
                    };
                });
            }
            
            // JSON Model holen und aktualisieren
            var oJSONModel = this.getView().getModel();
            var oCurrentData = oJSONModel.getData();
            
            // Backend-Daten zu bestehenden Mock-Daten hinzufügen
            // (in Produktion würden Mock-Daten ersetzt werden)
            oCurrentData.invoices = oCurrentData.invoices.concat(aInvoices);
            
            // Summary neu berechnen
            oCurrentData.summary.totalAmount = this._calculateTotal(oCurrentData.invoices);
            oCurrentData.summary.openAmount = this._calculateOpenAmount(oCurrentData.invoices);
            oCurrentData.summary.paidAmount = oCurrentData.summary.totalAmount - oCurrentData.summary.openAmount;
            
            // Model aktualisieren (triggert automatisches UI-Update)
            oJSONModel.setData(oCurrentData);
            
            console.log("✅ UI Model aktualisiert mit", aInvoices.length, "neuen Einträgen");
            console.log("Aktuelle Daten:", oCurrentData);
        },

        /**
         * Alternative: Direkte OData-Bindung an Tabelle
         */
        onBindTableToOData: function () {
            MessageBox.information(
                "Soll die Tabelle direkt an OData-Service gebunden werden?\n\n" +
                "✅ Vorteile: Automatische Updates, Server-side Filtering/Sorting\n" +
                "⚠️  Nachteile: Andere Datenstruktur als Mock-Daten\n" +
                "🔄 Demo-Zweck: Zeigt verschiedene Binding-Strategien",
                {
                    title: "OData Binding Demo",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.YES) {
                            this._bindTableToODataDirectly();
                        }
                    }.bind(this)
                }
            );
        },

        _bindTableToODataDirectly: function () {
            var oTable = this.byId("invoiceTable");
            
            // Tabelle Header ändern
            oTable.setHeaderText("Produkte direkt vom OData Service");
            
            // Neue Column List Item Template für OData-Struktur
            var oTemplate = new sap.m.ColumnListItem({
                cells: [
                    new sap.m.Text({ text: "PROD-{odata>ProductID}" }),
                    new sap.m.Text({ text: "{odata>ProductName}" }),
                    new sap.m.Text({ text: "{odata>UnitPrice} USD" }),
                    new sap.m.ObjectStatus({ 
                        text: "{odata>UnitsInStock} Stück",
                        state: {
                            path: "odata>UnitsInStock",
                            formatter: this.formatStockStatus
                        }
                    }),
                    new sap.m.Button({ 
                        icon: "sap-icon://detail-view",
                        press: this.onShowProductDetails,
                        tooltip: "Produkt-Details"
                    })
                ]
            });
            
            // Direkt an OData Service binden
            oTable.bindItems({
                path: "odata>/Products",
                parameters: {
                    "$top": 25,
                    "$select": "ProductID,ProductName,UnitPrice,UnitsInStock"
                },
                template: oTemplate
            });
            
            MessageToast.show("✅ Tabelle direkt an OData-Service gebunden!");
        },

        /**
         * Advanced OData Tests für Demonstrationszwecke
         */
        onTestAdvancedOData: function () {
            MessageToast.show("Führe erweiterte OData-Tests aus...");
            BusyIndicator.show(0);
            
            // Multiple Service-Calls parallel ausführen
            Promise.all([
                this._oBackendService.read("/Products", {
                    urlParameters: {
                        "$top": "5",
                        "$orderby": "UnitPrice desc",
                        "$select": "ProductID,ProductName,UnitPrice"
                    }
                }),
                this._oBackendService.read("/Categories", {
                    urlParameters: {
                        "$top": "3",
                        "$select": "CategoryID,CategoryName"
                    }
                }),
                this._oBackendService.read("/Suppliers", {
                    urlParameters: {
                        "$top": "3",
                        "$select": "SupplierID,CompanyName,Country"
                    }
                })
            ]).then(function (aResults) {
                BusyIndicator.hide();
                
                var oProducts = aResults[0].data;
                var oCategories = aResults[1].data;
                var oSuppliers = aResults[2].data;
                
                var sMessage = "✅ Multiple OData-Calls erfolgreich:\n\n" +
                    "• " + oProducts.results.length + " teure Produkte\n" +
                    "• " + oCategories.results.length + " Kategorien\n" +
                    "• " + oSuppliers.results.length + " Lieferanten\n\n" +
                    "Details in der Browser-Konsole.";
                
                MessageBox.success(sMessage, {
                    title: "Advanced OData Test Erfolgreich"
                });
                
                console.log("🏷️ Teure Produkte:", oProducts.results);
                console.log("📂 Kategorien:", oCategories.results);
                console.log("🏢 Lieferanten:", oSuppliers.results);
                
            }).catch(function (oError) {
                BusyIndicator.hide();
                MessageBox.error(
                    "Mindestens ein OData-Call ist fehlgeschlagen.\n\n" + 
                    "Details in der Browser-Konsole.",
                    { title: "Advanced Test Fehler" }
                );
                console.error("Advanced OData Test Error:", oError);
            });
        },

        /**
         * Mock-Daten zurücksetzen (für Demo-Zwecke)
         */
        onResetToMockData: function () {
            MessageBox.confirm(
                "Möchten Sie alle Backend-Daten entfernen und zu den ursprünglichen Mock-Daten zurückkehren?",
                {
                    title: "Mock-Daten wiederherstellen",
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            this._resetToOriginalMockData();
                        }
                    }.bind(this)
                }
            );
        },

        _resetToOriginalMockData: function () {
            // Originale Mock-Daten wiederherstellen
            var oOriginalData = {
                invoices: [
                    {
                        id: "1",
                        invoiceNumber: "INV-2025-001",
                        customerName: "Firma Mueller GmbH",
                        amount: 15750.50,
                        status: "Offen",
                        date: "2025-08-01",
                        description: "Beratungsleistungen Q2/2025"
                    },
                    {
                        id: "2", 
                        invoiceNumber: "INV-2025-002",
                        customerName: "Tech Solutions AG",
                        amount: 8900.00,
                        status: "Bezahlt",
                        date: "2025-08-02",
                        description: "Software-Entwicklung"
                    },
                    {
                        id: "3",
                        invoiceNumber: "INV-2025-003", 
                        customerName: "StartUp Innovations",
                        amount: 3200.75,
                        status: "Überfällig",
                        date: "2025-07-15",
                        description: "Web-Design Services"
                    }
                ],
                summary: {
                    totalAmount: 27851.25,
                    openAmount: 18950.50,
                    paidAmount: 8900.75
                }
            };
            
            var oModel = this.getView().getModel();
            oModel.setData(oOriginalData);
            
            // Tabelle zurück auf JSON-Binding setzen
            var oTable = this.byId("invoiceTable");
            oTable.setHeaderText("Rechnungen/Produkte ({/invoices/length})");
            
            MessageToast.show("✅ Mock-Daten wiederhergestellt");
        },

        // ──────────────────────────────────────────────
        // FORMATTER-FUNKTIONEN
        // ──────────────────────────────────────────────

        formatStatus: function (sStatus) {
            switch (sStatus) {
                case "Bezahlt":
                case "Verfügbar":
                    return "Success";
                case "Offen":
                    return "Warning"; 
                case "Überfällig":
                case "Nicht verfügbar":
                    return "Error";
                default:
                    return "None";
            }
        },

        formatStockStatus: function (iStock) {
            if (iStock > 50) return "Success";
            if (iStock > 10) return "Warning";
            return "Error";
        },

        // ──────────────────────────────────────────────
        // HELPER-FUNKTIONEN
        // ──────────────────────────────────────────────

        _calculateTotal: function (aInvoices) {
            return aInvoices.reduce(function (sum, invoice) {
                return sum + parseFloat(invoice.amount || 0);
            }, 0);
        },

        _calculateOpenAmount: function (aInvoices) {
            return aInvoices.filter(function (invoice) {
                return invoice.status === "Offen" || invoice.status === "Verfügbar";
            }).reduce(function (sum, invoice) {
                return sum + parseFloat(invoice.amount || 0);
            }, 0);
        },

        // ──────────────────────────────────────────────
        // BESTEHENDE UI5-FUNKTIONALITÄT (bleibt unverändert)
        // ──────────────────────────────────────────────

        /**
         * Dialog für neue Rechnung öffnen (aus vorherigem Workshop)
         */
        onAddInvoice: function () {
            if (!this._oDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "workshop.ui5.bridge.view.fragments.AddItemDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._oDialog = oDialog;
                    this.getView().addDependent(this._oDialog);
                    this._oDialog.open();
                }.bind(this));
            } else {
                this._oDialog.open();
            }
        },

        /**
         * Neue Rechnung speichern
         */
        onSaveNewInvoice: function () {
            // TODO: Morgen mit CAP Service implementieren
            MessageToast.show("Neue Rechnung würde im Backend gespeichert - CAP Integration folgt morgen!");
            this._oDialog.close();
        },

        /**
         * Dialog schließen
         */
        onCancelDialog: function () {
            this._oDialog.close();
        },

        /**
         * Details anzeigen
         */
        onShowDetails: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sInvoiceId = oContext.getProperty("id");
            var sCustomerName = oContext.getProperty("customerName");
            
            MessageBox.information(
                "Details für Eintrag:\n\n" +
                "ID: " + sInvoiceId + "\n" +
                "Kunde/Produkt: " + sCustomerName + "\n\n" +
                "Detailansicht folgt im nächsten Workshop-Modul.",
                { title: "Detail-Information" }
            );
        },

        /**
         * Produktdetails für OData-gebundene Einträge
         */
        onShowProductDetails: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("odata");
            var oProduct = oContext.getObject();
            
            var sDetails = "Produkt-Details:\n\n" +
                "ID: " + oProduct.ProductID + "\n" +
                "Name: " + oProduct.ProductName + "\n" +
                "Preis: " + oProduct.UnitPrice + " USD\n" +
                "Lager: " + oProduct.UnitsInStock + " Stück";
            
            MessageBox.information(sDetails, {
                title: "Northwind Produkt"
            });
        }
    });
});
