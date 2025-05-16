sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
  ],
  function (Controller, Fragment, JSONModel) {
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

      onEditStudent: function (oEvent) {
        const oContext = oEvent.getSource().getBindingContext();
        const oStudentData = Object.assign({}, oContext.getObject());
        this._inputModel.setData(oStudentData);
        this._openStudentDialog();
      },

      _openStudentDialog: async function () {
        if (!this._studentDialog) {
          this._loadDialog("CreateProduct").then((oDialog) => {
            this._oCreateProductDialog = oDialog;
            oDialog.open();
          });
        } else {
          this._oCreateProductDialog.open();
        }
      },

      onSaveStudent: function () {
        const oData = this._inputModel.getData();

        // Optional: Add validation here before saving

        if (!oData.Name) {
          this._validationModel.setProperty("/Name", false);
          return;
        } else {
          this._validationModel.setProperty("/Name", true);
        }

        // Submit to backend (create or update logic here)
        // Example: Check if Studentid exists, then update, else create

        // Close dialog
        this._studentDialog.close();
      },

      onCancelStudent: function () {
        this._studentDialog.close();
      },

      onAfterCloseDialog: function () {
        this._inputModel.setData({});
        this._validationModel.setData({});
      },

      _loadDialog(sFragmentName) {
        return new Promise((resolve, reject) => {
          Fragment.load({
            id: this.getView().getId(),
            name: `ui5.product.list.view.fragments.${sFragmentName}`,
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
