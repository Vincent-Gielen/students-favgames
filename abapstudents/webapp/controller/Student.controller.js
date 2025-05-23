sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
  function (Controller, History) {
    "use strict";

    return Controller.extend("abapstudents.controller.Student", {
      onInit: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("RouteStudent")
          .attachPatternMatched(this._onRouteMatched, this);
      },

      _onRouteMatched: function (oEvent) {
        var sStudentId = oEvent.getParameter("arguments").Studentid;
        if (sStudentId) {
          // Bind the view to the student path
          this.getView().bindElement({
            path: "/StudentSet('" + sStudentId + "')",
            events: {
              dataRequested: function () {
                // optionally show a loading indicator here
              },
              dataReceived: function () {
                // optionally hide loading indicator here
              },
            },
          });
        }
      },

      onNavBack: function () {
        var oHistory = History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.back();
        } else {
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("appHome", {}, true); // fallback route
        }
      },
    });
  }
);
