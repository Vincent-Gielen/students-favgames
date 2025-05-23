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

    return Controller.extend("abapstudents.controller.App", {
      onInit: function () {
        this._inputModel = new JSONModel(); // For input binding
        this._validationModel = new JSONModel(); // For validation states
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
        var oView = this.getView();
        var oModel = oView.getModel();
        const oContext = oEvent.getSource().getBindingContext();
        var sPath = oContext.getPath();
        var oData = oContext.getObject();

        MessageBox.confirm(
          `Are you sure you want to delete student "${oData.Name}"?`,
          {
            title: "Confirm Deletion",
            onClose: function (sAction) {
              if (sAction === sap.m.MessageBox.Action.OK) {
                oModel.remove(sPath, {
                  success: function () {
                    MessageToast.show("Student deleted successfully.");
                    // Refresh the table binding
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
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        var oContext = oEvent.getSource().getBindingContext();
        var sStudentId = oContext.getProperty("Studentid");
        console.log(oRouter);
        console.log(oContext);
        console.log(sStudentId);
        
        oRouter.navTo("RouteStudent", { Studentid: sStudentId });
        console.log("na nav");
        
      },

      onSaveStudent: function () {
        var oView = this.getView();
        var oData = Object.assign({}, this._inputModel.getData());
        var oModel = oView.getModel();
        var that = this;

        // Basic validation
        if (!oData.Name) {
          this._validationModel.setProperty("/Name", false);
          return;
        } else {
          this._validationModel.setProperty("/Name", true);
        }

        if (oData.Studentid) {
          // Update existing student
          var sPath = "/StudentSet('" + oData.Studentid + "')";
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
          // Create new student
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
        var oView = this.getView();

        var sName = oView.byId("filterName").getValue().trim().toUpperCase();
        var sGender = oView.byId("filterGender").getSelectedKey();
        var sDegree = oView
          .byId("filterDegree")
          .getValue()
          .trim()
          .toUpperCase();
        var sConsole = oView.byId("filterConsole").getSelectedKey();

        var aFilters = [];

        if (sName) {
          aFilters.push(new Filter("Name", FilterOperator.EQ, sName));
        }
        if (sGender) {
          aFilters.push(new Filter("Gender", FilterOperator.EQ, sGender));
        }
        if (sDegree) {
          aFilters.push(new Filter("Degree", FilterOperator.EQ, sDegree));
        }
        if (sConsole) {
          aFilters.push(new Filter("Console", FilterOperator.EQ, sConsole));
        }

        var oTable = oView.byId("studentsTable");
        var oBinding = oTable.getBinding("items");
        oBinding.filter(aFilters);
      },

      _loadDialog(sFragmentName) {
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
