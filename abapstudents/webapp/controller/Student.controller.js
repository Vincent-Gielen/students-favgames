sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
  ],
  function (Controller, History, JSONModel, Filter) {
    "use strict";

    return Controller.extend("abapstudents.controller.Student", {
      onInit: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("RouteStudent")
          .attachPatternMatched(this._onRouteMatched, this);
      },

      _onRouteMatched: function (oEvent) {
        let sStudentId = oEvent.getParameter("arguments").Studentid;
        let gameIds;
        const oModel = this.getView().getModel();

        if (sStudentId) {
          this.getView().bindElement({
            path: "/StudentSet('" + sStudentId + "')",
            // parameters: {
            //   expand: "to_favouriteGames",
            // },
          });

          // Get the favourite games IDs from the expanded data (if available)
          oModel.read("/StudentSet('" + sStudentId + "')/to_favouriteGames", {
            success: (oData) => {
              gameIds = (oData.results || []).map((game) => game.Gameid);
              console.log("Favourite games IDs:", gameIds);
              this._filtergames(gameIds);
            },
            error: (oError) => {
              console.error("Failed to fetch favourite games:", oError);
            },
          });
        }
      },

      _filtergames: function (gameIds) {
        const oGamesList = this.byId("gamesList");
        if (oGamesList && gameIds.length > 0) {
          console.log("2. Favourite games IDs:", gameIds);

          console.log("hallo");

          const aFilters = [new Filter("GameID", "EQ", gameIds[0])];
          for (let i = 1; i < gameIds.length; i++) {
            aFilters.push(new Filter("GameID", "EQ", gameIds[i]));
          }
          oGamesList.getBinding("items").filter(
            new Filter({
              filters: aFilters,
              and: false,
            })
          );
        } else if (oGamesList) {
          oGamesList.getBinding("items").filter(new Filter("GameID", "EQ", 0));
        }
      },
    });
  }
);
