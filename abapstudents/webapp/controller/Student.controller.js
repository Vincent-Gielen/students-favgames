sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/m/SearchField",
    "sap/ui/table/Column",
    "sap/m/Column",
    "sap/m/Text",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
  ],
  function (
    Controller,
    Filter,
    FilterOperator,
    ColumnListItem,
    Label,
    SearchField,
    UIColumn,
    MColumn,
    Text,
    Fragment,
    MessageBox
  ) {
    "use strict";
    let sStudentId;
    return Controller.extend("abapstudents.controller.Student", {
      onInit: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("RouteStudent")
          .attachPatternMatched(this._onRouteMatched, this);
        var oMultiInput;
        // value help zie SAP
        // Value Help Dialog standard use case with filter bar without filter suggestions
        oMultiInput = this.byId("multiInput");
        oMultiInput.addValidator(this._onMultiInputValidate);
        this._oMultiInput = oMultiInput;
      },

      _onRouteMatched: function (oEvent) {
        sStudentId = oEvent.getParameter("arguments").Studentid;
        // console.log("sStudentId:", sStudentId);

        if (sStudentId) {
          this.getView().bindElement({
            path: "/StudentSet('" + sStudentId + "')",
            // parameters: {
            //   expand: "to_favouriteGames",
            // },
          });

          this._filtergames();
        }
      },

      _filtergames: function () {
        const oModel = this.getView().getModel();
        const oGamesList = this.byId("gamesList");

        oModel.read("/StudentSet('" + sStudentId + "')/to_favouriteGames", {
          success: (oData) => {
            const gameIds = (oData.results || []).map((game) => game.Gameid);
            console.log("Favourite games IDs:", gameIds);

            if (oGamesList && gameIds.length > 0) {
              const aFilters = gameIds.map(
                (id) => new Filter("GameID", FilterOperator.EQ, id)
              );
              oGamesList.getBinding("items").filter(
                new Filter({
                  filters: aFilters,
                  and: false,
                })
              );
            } else if (oGamesList) {
              // Als er geen favoriete games zijn, tonen we de default game 0
              oGamesList
                .getBinding("items")
                .filter(new Filter("GameID", FilterOperator.EQ, 0));
            }
          },
          error: (oError) => {
            console.error("Failed to fetch favourite games:", oError);
          },
        });
      },

      onValueHelpRequested: function () {
        this._oBasicSearchField = new SearchField();
        Fragment.load({
          name: "abapstudents.view.fragments.ValueHelpDialogFilterbar",
          controller: this,
        }).then(
          function (oDialog) {
            var oFilterBar = oDialog.getFilterBar(),
              //oColumnGameID,
              oColumnName,
              oColumnGenre,
              oColumnPlatform,
              oColumnDetails;
            this._oVHD = oDialog;

            this.getView().addDependent(oDialog);

            // Define Conditions staat zo uit
            // Set key fields for filtering in the Define Conditions Tab
            // oDialog.setRangeKeyFields([
            //   {
            //     label: "Game ID",
            //     key: "GameID",
            //     type: "string",
            //     typeInstance: new TypeString(
            //       {},
            //       {
            //         maxLength: 8,
            //       }
            //     ),
            //   },
            // ]);

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
                  // oColumnGameID = new UIColumn({
                  //   label: new Label({ text: "Game ID" }),
                  //   template: new Text({
                  //     wrapping: false,
                  //     text: "{cds>GameID}",
                  //   }),
                  // });
                  // oColumnGameID.data({
                  //   fieldName: "Game ID",
                  // });
                    oColumnName = new UIColumn({
                    label: new Label({ text: "Game Title" }),
                    template: new Text({
                      wrapping: false,
                      text: "{cds>Name}",
                    }),
                    });
                    oColumnName.data({
                    fieldName: "Game Title",
                    });
                    oColumnGenre = new UIColumn({
                    label: new Label({ text: "Game Genre" }),
                    template: new Text({
                      wrapping: false,
                      text: "{cds>Genre}",
                    }),
                    });
                    oColumnGenre.data({
                    fieldName: "Game Genre",
                    });
                    oColumnPlatform = new UIColumn({
                    label: new Label({ text: "Game Platform" }),
                    template: new Text({
                      wrapping: false,
                      text: "{cds>Platform}",
                    }),
                    });
                    oColumnPlatform.data({
                    fieldName: "Game Platform",
                    });
                    oColumnDetails = new UIColumn({
                    label: new Label({ text: "Game Details" }),
                    template: new sap.m.Button({
                      icon: "sap-icon://information",
                      tooltip: "{i18n>gamesTable.button.details.tooltip}",
                      type: "Transparent",
                      press: this.handleDetailPress.bind(this)
                    }),
                    width: "12%"
                    });
                    oColumnDetails.data({
                    fieldName: "Game Details",
                    });
                  
                  //oTable.addColumn(oColumnGameID);
                  oTable.addColumn(oColumnName);
                  oTable.addColumn(oColumnGenre);
                  oTable.addColumn(oColumnPlatform);
                  oTable.addColumn(oColumnDetails);
                }

                // Niet nodig denk ik, aangezien ik niet op mobile werk
                // For Mobile the default table is sap.m.Table
                // if (oTable.bindItems) {
                //   // Bind items to the ODataModel and add columns
                //   oTable.bindAggregation("items", {
                //     path: "/ZAS_113_C_GAMES",
                //     model: "cds",
                //     template: new ColumnListItem({
                //       cells: [
                //         new Label({ text: "{cds>GameID}" }),
                //         new Label({ text: "{cds>Name}" }),
                //       ],
                //     }),
                //     events: {
                //       dataReceived: function () {
                //         oDialog.update();
                //       },
                //     },
                //   });
                //   oTable.addColumn(
                //     new MColumn({ header: new Label({ text: "GameID" }) })
                //   );
                //   oTable.addColumn(
                //     new MColumn({ header: new Label({ text: "Game Name" }) })
                //   );
                // }
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
        //console.log("op cancel geklikt");

        this._oVHD.close();
      },

      onValueHelpAfterClose: function () {
        this._oVHD.destroy();
      },

      // voor de filters in de value help dialog
      onFilterBarSearch: function (oEvent) {
        var sSearchQuery = this._oBasicSearchField.getValue(),
          aSelectionSet = oEvent.getParameter("selectionSet");

        var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
          if (oControl.getValue()) {
            aResult.push(
              new Filter({
                path: oControl.getName(),
                operator: FilterOperator.Contains,
                value1: oControl.getValue(),
              })
            );
          }

          return aResult;
        }, []);

        aFilters.push(
          new Filter({
            filters: [
              new Filter({
                path: "Name",
                operator: FilterOperator.Contains,
                value1: sSearchQuery,
              }),
              new Filter({
                path: "Genre",
                operator: FilterOperator.Contains,
                value1: sSearchQuery,
              }),
              new Filter({
                path: "Platform",
                operator: FilterOperator.Contains,
                value1: sSearchQuery,
              }),
            ],
            and: false,
          })
        );

        this._filterTable(
          new Filter({
            filters: aFilters,
            and: true,
          })
        );
      },

      _filterTable: function (oFilter) {
        var oVHD = this._oVHD;

        oVHD.getTableAsync().then(function (oTable) {
          if (oTable.bindRows) {
            oTable.getBinding("rows").filter(oFilter);
          }
          // if (oTable.bindItems) {
          //   oTable.getBinding("items").filter(oFilter);
          // }

          // This method must be called after binding update of the table.
          oVHD.update();
        });
      },

      onPressAddGame: function () {
        const oView = this.getView();
        const oMultiInput = this._oMultiInput;
        const aTokens = oMultiInput.getTokens();
        const oModel = oView.getModel();
        //console.log("sStudentId:", sStudentId);

        // Dit moet om ze niet in 1 batch te doen, dan gaat het niet
        oModel.setUseBatch(false);

        if (aTokens.length === 0) {
          MessageBox.show("Please select at least one game to add.");
          return;
        }

        // Moet met promises om daarna te kunnen filteren
        const createPromises = aTokens.map((oToken) => {
          const sGameId = oToken.getKey();
          if (!sGameId) {
            return Promise.resolve(); // skip if no key
          }

          return new Promise((resolve, reject) => {
            oModel.create(
              "/FavouriteGamesSet",
              {
                Studentid: sStudentId,
                // Gameid is een integer, dus parseInt gebruiken
                Gameid: parseInt(sGameId, 10),
              },
              {
                success: () => {
                  console.log("Game added successfully:", sGameId);

                  resolve();
                },
                error: (oError) => {
                  console.error("Error adding game:", sGameId, oError);
                  // resolve anyway to not block all if one fails
                  resolve();
                },
              }
            );
          });
        });

        // Nadat alle games zijn toegevoegd, toon bericht en filter opnieuw de games tabel
        Promise.all(createPromises).then(() => {
          MessageBox.show("Games added successfully!");
          this._filtergames();
          oMultiInput.removeAllTokens();
        });
      },

      handleDetailPress: function (oEvent) {
        const oButton = oEvent.getSource();
        const oView = this.getView();
        const oContext = oButton.getBindingContext("cds"); // Use correct model name

        if (!this._pPopover) {
          this._pPopover = Fragment.load({
            id: oView.getId(),
            name: "abapstudents.view.fragments.GameDetails",
            controller: this,
          }).then(function (oPopover) {
            oView.addDependent(oPopover);
            return oPopover;
          });
        }

        this._pPopover.then(function (oPopover) {
          // Always update the binding context
          oPopover.bindElement({
            path: oContext.getPath(),
            model: "cds",
          });
          oPopover.openBy(oButton);
        });
      },

      onSuggestionItemSelected: function (oEvent) {
        const oSelectedItem = oEvent.getParameter("selectedRow");
        const oMultiInput = this.byId("multiInput");

        if (oSelectedItem) {
          const oContext = oSelectedItem.getBindingContext("cds");
          const oGame = oContext.getObject();

          console.log("Selected game:", oGame);
          console.log("Game ID:", oGame.GameID);
          console.log("Game Name:", oGame.Name);
          
          
          

          const oToken = new sap.m.Token({
            key: oGame.GameID, 
            text: oGame.Name,
          });

          oMultiInput.addToken(oToken);
        }
      },

      onPressRemoveGame: function (oEvent) {
        const oView = this.getView();
        const oModel = oView.getModel();
        const sGameID = oEvent
          .getSource()
          .getBindingContext("cds")
          .getProperty("GameID");
        const sGameName = oEvent
          .getSource()
          .getBindingContext("cds")
          .getProperty("Name");
        const sPath = `/FavouriteGamesSet(Studentid='${sStudentId}',Gameid=${sGameID})`;
        console.log(sPath);

        // Store reference to 'this'
        const that = this;

        MessageBox.confirm(
          `Are you sure you want to delete "${sGameName}" from favourites?`,
          {
            title: "Confirm Deletion",
            onClose: function (sAction) {
              if (sAction === MessageBox.Action.OK) {
                oModel.remove(sPath, {
                  success: function () {
                    MessageBox.show(
                      `${sGameName} removed from favourites successfully.`
                    );
                    that._filtergames();
                  },
                  error: function () {
                    MessageBox.error("Failed to remove game from favourites.");
                  },
                });
              }
            },
          }
        );
      },
    });
  }
);
