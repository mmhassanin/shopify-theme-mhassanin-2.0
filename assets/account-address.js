(() => {
  // app/scripts/common/model/popup-component.js
  var PopupComponent = class extends HTMLElement {
    constructor() {
      super();
      this.getElementsByClassName("js-popup-close").addEvents("click", this.close.bind(this));
    }
    close() {
      this.removeClass("is-open");
      AT.enableScroll();
    }
    open() {
      this.addClass("is-open");
      AT.disableScroll();
    }
  };

  // app/scripts/common/model/popup-address.js
  var PopupAddress = class extends PopupComponent {
    constructor() {
      super();
      this.elms = {
        form: this.querySelector("form"),
        firstName: this.querySelector("input[name='address[first_name]']"),
        lastName: this.querySelector("input[name='address[last_name]']"),
        company: this.querySelector("input[name='address[company]']"),
        address1: this.querySelector("input[name='address[address1]']"),
        address2: this.querySelector("input[name='address[address2]']"),
        city: this.querySelector("input[name='address[city]']"),
        country: this.querySelector("select[name='address[country]']"),
        province: this.querySelector("select[name='address[province]']"),
        zip: this.querySelector("input[name='address[zip]']"),
        phone: this.querySelector("input[name='address[phone]']"),
        defaultCheckbox: this.querySelector("input[name='address[default]']"),
        method: this.querySelector("input[name='_method']"),
        heading: this.querySelector(".popup-component_box_header"),
        submitButton: this.querySelector("button[type='submit']")
      };
      this.settings = {
        action: this.elms.form.getAttribute("action")
      };
      this.onCountryChange();
    }
    open(action, data) {
      this.resetForm();
      action == "edit" && this.setForm(data);
      console.log(data);
      this.addClass("is-open");
      AT.disableScroll();
    }
    resetForm() {
      let {
        form,
        firstName,
        lastName,
        company,
        address1,
        address2,
        city,
        country,
        province,
        zip,
        phone,
        defaultCheckbox,
        method,
        heading,
        submitButton
      } = this.elms;
      heading.innerHTML = theme.strings.address.addTitle;
      submitButton.innerHTML = theme.strings.address.add;
      firstName.value = "";
      lastName.value = "";
      company.value = "";
      address1.value = "";
      address2.value = "";
      city.value = "";
      zip.value = "";
      phone.value = "";
      province.closest("tr").addClass("d-none");
      province.value = "";
      country.value = country.options[0].value;
      defaultCheckbox.checked = false;
      method.value = "";
      form.setAttribute("action", this.settings.action);
    }
    setForm(data) {
      let {
        form,
        firstName,
        lastName,
        company,
        address1,
        address2,
        city,
        country,
        province,
        zip,
        phone,
        defaultCheckbox,
        method,
        heading,
        submitButton
      } = this.elms;
      heading.innerHTML = theme.strings.address.editTitle;
      submitButton.innerHTML = theme.strings.address.update;
      firstName.value = data.first_name;
      lastName.value = data.last_name;
      company.value = data.company;
      address1.value = data.address1;
      address2.value = data.address2;
      city.value = data.city;
      zip.value = data.zip;
      phone.value = data.phone;
      form.setAttribute("action", `${this.settings.action}/${data.id}`);
      province.closest("tr").addClass("d-none");
      country.value = data.country;
      method.value = "put";
      defaultCheckbox.checked = data.default;
      country.dispatchEvent(new Event("change"));
      province.value = data.province || "";
    }
    onCountryChange() {
      let { country, province } = this.elms;
      country.addEvent("change", function() {
        let provinceList = JSON.parse(country.options[country.selectedIndex].dataset.provinces) || [];
        if (provinceList.length) {
          province.innerHTML = "";
          provinceList.forEach((provinceItem) => {
            let option = document.createElement("option");
            option.innerHTML = provinceItem[0];
            option.value = provinceItem[0];
            province.append(option);
          });
          province.closest("tr").removeClass("d-none");
        } else {
          province.closest("tr").addClass("d-none");
        }
      });
    }
  };

  // app/scripts/account-address.js
  (() => {
    register("account-address", {
      onLoad() {
        this.elms = {
          popupAddress: this.container.querySelector("#popup-address"),
          addButton: this.container.querySelector(".js-btn-add-new"),
          editButtons: this.container.querySelectorAll(".js-btn-edit")
        };
        customElements.define("popup-address", PopupAddress);
        this.initEvent();
      },
      initEvent() {
        let { addButton, editButtons, popupAddress } = this.elms;
        addButton.addEvent("click", () => {
          popupAddress.open("add");
        });
        editButtons.addEvents("click", function() {
          let data = JSON.parse(this.dataset.json);
          console.log(data);
          popupAddress.open("edit", data);
        });
      }
    });
    load("account-address");
  })();
})();
