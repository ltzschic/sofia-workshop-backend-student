// webapp/service/BackendService.js - NEU erstellen
sap.ui.define([
    "sap/ui/base/Object"
], function (BaseObject) {
    "use strict";

    return BaseObject.extend("workshop.ui5.bridge.service.BackendService", {

        constructor: function (oComponent) {
            this._oComponent = oComponent;
            this._oODataModel = oComponent.getModel("odata");
        },

        /**
         * Generischer OData Read mit Promise
         */
        read: function (sPath, mParameters) {
            return new Promise(function (resolve, reject) {
                this._oODataModel.read(sPath, {
                    urlParameters: mParameters?.urlParameters,
                    filters: mParameters?.filters,
                    sorters: mParameters?.sorters,
                    success: function (oData, oResponse) {
                        console.log("✅ BackendService.read:", sPath, oData);
                        resolve({
                            data: oData,
                            response: oResponse
                        });
                    },
                    error: function (oError) {
                        console.error("❌ BackendService.read:", sPath, oError);
                        reject(oError);
                    }
                });
            }.bind(this));
        },

        /**
         * Business-spezifische Methoden
         */
        loadInvoices: function (mFilters) {
            // Heute: Northwind Products
            // Morgen: Echte Invoice-Entities aus CAP
            return this.read("/Products", {
                urlParameters: {
                    "$top": mFilters?.top || "10",
                    "$select": "ProductID,ProductName,UnitPrice,UnitsInStock"
                }
            }).then(function (oResult) {
                // Datenformat für UI konvertieren
                return this._convertProductsToInvoices(oResult.data.results);
            }.bind(this));
        },

        loadSummary: function () {
            // Morgen: Echte Summary-Berechnung im CAP Service
            return Promise.resolve({
                totalCount: 150,
                totalAmount: 45230.75,
                avgAmount: 301.54
            });
        },

        _convertProductsToInvoices: function (aProducts) {
            return aProducts.map(function (oProduct) {
                return {
                    id: "PROD_" + oProduct.ProductID,
                    invoiceNumber: "INV-PROD-" + oProduct.ProductID,
                    customerName: oProduct.ProductName,
                    amount: parseFloat(oProduct.UnitPrice) || 0,
                    status: (oProduct.UnitsInStock > 0) ? "Verfügbar" : "Nicht verfügbar",
                    date: new Date().toISOString().split('T')[0],
                    description: "Backend-Produkt von OData Service"
                };
            });
        }
    });
});
