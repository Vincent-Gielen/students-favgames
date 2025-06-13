sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  function (
    Controller,
    Fragment,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox
  ) {
    "use strict";

    return Controller.extend("abapstudents.controller.Main", {
      onInit: function () {
        this._inputModel = new JSONModel();
        this._validationModel = new JSONModel();
        this.getView().setModel(this._inputModel, "input");
        this.getView().setModel(this._validationModel, "validation");
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
                    MessageToast.show("Student deleted successfully.");
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
              MessageToast.show("Student updated successfully!");
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
              MessageToast.show("Student added successfully!");
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
    });
  }
);
