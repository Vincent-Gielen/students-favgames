sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
  ],
  function (
    Controller,
    Fragment,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox
  ) {
    "use strict";

    return Controller.extend("abapstudents.controller.Main", {
      onInit: function () {
        this._inputModel = new JSONModel();
        this._validationModel = new JSONModel();
        this.getView().setModel(this._inputModel, "input");
        this.getView().setModel(this._validationModel, "validation");
        this._loadDropdownValues("filterGenre", "Genre");
        this._loadDropdownValues("filterPlatform", "Platform");
      },

      onPressCreateNewStudent: function () {
        const oInitialData = {
          Name: "",
          Gender: "",
          Degree: "",
          Console: "",
        };
        this._inputModel.setData(oInitialData);
        this._openStudentDialog();
      },

      onPressEditStudent: function (oEvent) {
        const oContext = oEvent.getSource().getBindingContext();
        const oStudentData = oContext.getObject();
        this._inputModel.setData(oStudentData);
        this._openStudentDialog();
      },

      _openStudentDialog: async function () {
        if (!this._studentDialog) {
          this._loadDialog("CreateStudent").then((oDialog) => {
            this._studentDialog = oDialog;
            oDialog.open();
          });
        } else {
          this._studentDialog.open();
        }
      },

      onPressDeleteStudent: function (oEvent) {
        const oView = this.getView();
        const oModel = oView.getModel();
        const oContext = oEvent.getSource().getBindingContext();
        const sPath = oContext.getPath();
        const oData = oContext.getObject();

        console.log(sPath);

        MessageBox.confirm(
          `Are you sure you want to delete student "${oData.Name}"?`,
          {
            title: "Confirm Deletion",
            onClose: function (sAction) {
              if (sAction === MessageBox.Action.OK) {
                oModel.remove(sPath, {
                  success: function () {
                    MessageBox.show("Student deleted successfully.");
                    oView.byId("studentsTable").getBinding("items").refresh();
                  },
                  error: function () {
                    MessageBox.error("Failed to delete student.");
                  },
                });
              }
            },
          }
        );
      },

      onPressStudent: function (oEvent) {
        const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        const oContext = oEvent.getSource().getBindingContext();
        const sStudentId = oContext.getProperty("Studentid");
        oRouter.navTo("RouteStudent", { Studentid: sStudentId });
      },

      onSaveStudent: function () {
        const oView = this.getView();
        const oData = Object.assign({}, this._inputModel.getData());

        console.log(oData);

        // Convert all input fields to uppercase before saving
        if (oData.Name) oData.Name = oData.Name.toUpperCase();
        if (oData.Gender) oData.Gender = oData.Gender.toUpperCase();
        if (oData.Degree) oData.Degree = oData.Degree.toUpperCase();
        if (oData.Console) oData.Console = oData.Console.toUpperCase();

        const oModel = oView.getModel();
        const that = this;

        if (!oData.Name) {
          this._validationModel.setProperty("/Name", false);
          return;
        } else {
          this._validationModel.setProperty("/Name", true);
        }

        if (oData.Studentid) {
          const sPath = "/StudentSet('" + oData.Studentid + "')";
          oModel.update(sPath, oData, {
            success: function () {
              MessageBox.show(`${oData.Name} was updated successfully!`);
              that._studentDialog.close();
              oView.byId("studentsTable").getBinding("items").refresh();
            },
            error: function () {
              MessageBox.error("Error updating student");
            },
          });
        } else {
          oModel.create("/StudentSet", oData, {
            success: function () {
              MessageBox.show(`${oData.Name} was added successfully!`);
              that._studentDialog.close();
              oView.byId("studentsTable").getBinding("items").refresh();
            },
            error: function () {
              MessageBox.error("Error adding student");
            },
          });
        }
      },

      onCancelStudent: function () {
        this._studentDialog.close();
      },

      onAfterCloseDialog: function () {
        this._inputModel.setData({});
        this._validationModel.setData({});
      },

      onFilterChange: function () {
        const oView = this.getView();
        const sName = oView.byId("filterName").getValue().trim();
        const sGender = oView.byId("filterGender").getSelectedKey();
        const sDegree = oView.byId("filterDegree").getValue().trim();
        const sConsole = oView.byId("filterConsole").getSelectedKey();

        const aFilters = [];
        if (sName) {
          aFilters.push(new Filter("Name", FilterOperator.EQ, sName));
          aFilters.push(
            new Filter("Name", FilterOperator.EQ, sName.toLowerCase())
          );
          aFilters.push(
            new Filter("Name", FilterOperator.EQ, sName.toUpperCase())
          );
        }
        if (sGender)
          aFilters.push(new Filter("Gender", FilterOperator.EQ, sGender));
        if (sDegree) {
          aFilters.push(new Filter("Degree", FilterOperator.EQ, sDegree));
          aFilters.push(
            new Filter("Degree", FilterOperator.EQ, sDegree.toLowerCase())
          );
          aFilters.push(
            new Filter("Degree", FilterOperator.EQ, sDegree.toUpperCase())
          );
        }
        if (sConsole)
          aFilters.push(new Filter("Console", FilterOperator.EQ, sConsole));

        const oTable = oView.byId("studentsTable");
        const oBinding = oTable.getBinding("items");
        oBinding.filter(aFilters);
      },

      onPressClearStudentFilters: function () {
        const oView = this.getView();

        // 1. Clear input fields
        const aFilterInputs = [
          oView.byId("filterName"),
          oView.byId("filterDegree"),
          oView.byId("filterGender"),
          oView.byId("filterConsole"),
        ];

        // het is of een select (met key) of een input (met value)
        aFilterInputs.forEach((oControl) => {
          if (oControl.setSelectedKey) {
            oControl.setSelectedKey("");
          } else if (oControl.setValue) {
            oControl.setValue("");
          }
        });

        // 2. Clear table filters
        const oTable = oView.byId("studentsTable");
        if (oTable) {
          const oBinding = oTable.getBinding("items");
          if (oBinding) {
            oBinding.filter([]); // Remove all filters
          }
        }
      },

      onPressStudentFilter: function () {
        MessageBox.information(
          "All filters are updated dynamically as you type or select."
          + "\n\nName and Degree must be written in full to match a Name or Degree."
          + "\n\nName and Degree filters are case-insensitive."
          + "\n\nTo clear filters, use the 'Clear' button."
        );
      },

      _loadDialog: function (sFragmentName) {
        return new Promise((resolve, reject) => {
          Fragment.load({
            id: this.getView().getId(),
            name: `abapstudents.view.fragments.${sFragmentName}`,
            controller: this,
          }).then((oDialog) => {
            this.getView().addDependent(oDialog);
            resolve(oDialog);
          });
        });
      },

      onGamesFilterChange: function () {
        const oView = this.getView();
        const sTitel = oView.byId("filterTitle").getValue().trim();
        const sGenre = oView.byId("filterGenre").getSelectedKey();
        const sPlatform = oView.byId("filterPlatform").getSelectedKey();
        const sPublisher = oView.byId("filterPublisher").getValue().trim();

        console.log(sTitel, sGenre);

        const aFilters = [];
        // we voegen het toe in alle cases, zodat we zeker een match hebben
        // ignore case bestaat niet, maar contains gaat hier wel, want odatav4?
        if (sTitel) {
          aFilters.push(new Filter("Name", FilterOperator.Contains, sTitel));
          aFilters.push(
            new Filter("Name", FilterOperator.Contains, sTitel.toLowerCase())
          );
          aFilters.push(
            new Filter("Name", FilterOperator.Contains, sTitel.toUpperCase())
          );
        }
        if (sGenre)
          aFilters.push(new Filter("Genre", FilterOperator.EQ, sGenre));
        if (sPublisher) {
          aFilters.push(
            new Filter("Publisher", FilterOperator.Contains, sPublisher)
          );
          aFilters.push(
            new Filter(
              "Publisher",
              FilterOperator.Contains,
              sPublisher.toLowerCase()
            )
          );
          aFilters.push(
            new Filter(
              "Publisher",
              FilterOperator.Contains,
              sPublisher.toUpperCase()
            )
          );
        }
        if (sPlatform)
          aFilters.push(new Filter("Platform", FilterOperator.EQ, sPlatform));

        const oTable = oView.byId("gamesTable");
        const oBinding = oTable.getBinding("items");
        oBinding.filter(aFilters);
      },

      // deze wordt gebruikt om de dropdowns te vullen, herbruikbare code
      _loadDropdownValues: function (sSelectId, sField) {
        const oSelect = this.byId(sSelectId);
        const oModel = this.getView().getModel("cds");

        // dit moet, anders is model nog niet geladen
        if (!oModel) {
          console.warn(`OData model not ready yet for ${sField}. Retrying...`);
          setTimeout(() => this._loadDropdownValues(sSelectId, sField), 200);
          return;
        }

        oModel.read("/ZAS_113_C_GAMES", {
          success: function (oData) {
            const aValues = [
              ...new Set(oData.results.map((g) => g[sField]).filter(Boolean)),
            ].sort();

            oSelect.destroyItems();
            oSelect.addItem(new sap.ui.core.Item({ key: "", text: "All" }));

            aValues.forEach(function (val) {
              oSelect.addItem(new sap.ui.core.Item({ key: val, text: val }));
            });
          },
          error: function (oError) {
            console.error(`Failed to load distinct ${sField} values`, oError);
          },
        });
      },
    });
  }
);
