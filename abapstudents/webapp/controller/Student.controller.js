sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/comp/library",
    "sap/ui/model/type/String",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/m/SearchField",
    "sap/m/Token",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/table/Column",
    "sap/m/Column",
    "sap/m/Text",
    "sap/ui/core/Fragment",
  ],
  function (
    Controller,
    History,
    JSONModel,
    Filter,
    FilterOperator,
    CompLibrary,
    TypeString,
    ColumnListItem,
    Label,
    SearchField,
    Token,
    ODataModel,
    UIColumn,
    MColumn,
    Text,
    Fragment
  ) {
    "use strict";

    return Controller.extend("abapstudents.controller.Student", {
      onInit: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("RouteStudent")
          .attachPatternMatched(this._onRouteMatched, this);
        var oMultiInput, oMultiInputWithSuggestions;
        // Value Help Dialog standard use case with filter bar without filter suggestions
        oMultiInput = this.byId("multiInput");
        oMultiInput.addValidator(this._onMultiInputValidate);
        this._oMultiInput = oMultiInput;
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

      onValueHelpRequested: function () {
        this._oBasicSearchField = new SearchField();
        Fragment.load({
          name: "abapstudents.view.fragments.ValueHelpDialogFilterbar",
        }).then(
          function (oDialog) {
            var oFilterBar = oDialog.getFilterBar(),
              oColumnGameID,
              oColumnGameName;
            this._oVHD = oDialog;

            this.getView().addDependent(oDialog);

            // Set key fields for filtering in the Define Conditions Tab
            oDialog.setRangeKeyFields([
              {
                label: "Game ID",
                key: "GameID",
                type: "string",
                typeInstance: new TypeString(
                  {},
                  {
                    maxLength: 8,
                  }
                ),
              },
            ]);

            // Set Basic Search for FilterBar
            oFilterBar.setFilterBarExpanded(false);
            oFilterBar.setBasicSearch(this._oBasicSearchField);

            // Trigger filter bar search when the basic search is fired
            this._oBasicSearchField.attachSearch(function () {
              oFilterBar.search();
            });

            oDialog.getTableAsync().then(
              function (oTable) {
                oTable.setModel(this.oGamesModel);

                // For Desktop and tabled the default table is sap.ui.table.Table
                if (oTable.bindRows) {
                  // Bind rows to the ODataModel and add columns
                  oTable.bindAggregation("rows", {
                    path: "/ZAS_113_C_GAMES",
                    model: "cds",
                    events: {
                      dataReceived: function () {
                        oDialog.update();
                      },
                    },
                  });
                  oColumnGameID = new UIColumn({
                    label: new Label({ text: "Game ID" }),
                    template: new Text({
                      wrapping: false,
                      text: "{cds>GameID}",
                    }),
                  });
                  oColumnGameID.data({
                    fieldName: "Game ID",
                  });
                  oColumnGameName = new UIColumn({
                    label: new Label({ text: "Game Name" }),
                    template: new Text({
                      wrapping: false,
                      text: "{cds>Name}",
                    }),
                  });
                  oColumnGameName.data({
                    fieldName: "Game Name",
                  });
                  oTable.addColumn(oColumnGameID);
                  oTable.addColumn(oColumnGameName);
                }

                // For Mobile the default table is sap.m.Table
                if (oTable.bindItems) {
                  // Bind items to the ODataModel and add columns
                  oTable.bindAggregation("items", {
                    path: "/ZAS_113_C_GAMES",
                    model: "cds",
                    template: new ColumnListItem({
                      cells: [
                        new Label({ text: "{cds>GameID}" }),
                        new Label({ text: "{cds>Name}" }),
                      ],
                    }),
                    events: {
                      dataReceived: function () {
                        oDialog.update();
                      },
                    },
                  });
                  oTable.addColumn(
                    new MColumn({ header: new Label({ text: "GameID" }) })
                  );
                  oTable.addColumn(
                    new MColumn({ header: new Label({ text: "Game Name" }) })
                  );
                }
                oDialog.update();
              }.bind(this)
            );

            oDialog.setTokens(this._oMultiInput.getTokens());
            oDialog.open();
          }.bind(this)
        );
      },

      onValueHelpOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        this._oMultiInput.setTokens(aTokens);
        this._oVHD.close();
      },

      onValueHelpCancelPress: function () {
        this._oVHD.close();
      },

      onValueHelpAfterClose: function () {
        this._oVHD.destroy();
      },
    });
  }
);
