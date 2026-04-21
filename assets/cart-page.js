(() => {
  // app/scripts/cart-page.js
  var CartTemplate = {
    onLoad() {
      this.elms = {
        cartSubtotalPrice: this.container.querySelector(".js-cart-subtotal-price"),
        cartTotalPrice: this.container.querySelector(".js-cart-total-price"),
        lineItemList: this.container.getElementsByClassName("js-cart-line-item"),
        lineItemsContainer: this.container.querySelector("#cart-line-items"),
        estimateShipping: this.container.querySelector("#shipping-calculator"),
        cartForm: this.container.querySelector("#cart-form"),
        cartNote: this.container.querySelector("#cart-note"),
        checkoutSubmitButton: this.container.querySelector("#checkout-submit-button")
      };
      document.addEvent("cart-change", this.onCartChangeHandler.bind(this));
      document.addEvent("cart-add", this.onCartAddHandler.bind(this));
      this.initEstimateShipping();
      this.initCartNote();
      this.initCheckoutSubmitButton();
    },
    onCartAddHandler({ detail: { sections, ...lineItem } }) {
      let { lineItemsContainer } = this.elms;
      lineItemsContainer.innerHTML = sections["cart-template"];
      let lineItemElement = lineItemsContainer.querySelector(`cart-line-item[data-key='${lineItem.key}']`);
      AT.scrollTo(lineItemElement, 1e3, 300).then(() => {
        lineItemElement.addClass("line-item--highlight");
        AT.debounce(() => lineItemElement.removeClass("line-item--highlight"), 1e3);
      });
    },
    onCartChangeHandler({ detail: { original_total_price, total_price, item_count } }) {
      let { cartSubtotalPrice, cartTotalPrice } = this.elms;
      cartSubtotalPrice.innerHTML = original_total_price.toCurrency();
      cartTotalPrice.innerHTML = total_price.toCurrency();
      this.container.setAttribute("data-status", item_count);
    },
    initEstimateShipping() {
      let { estimateShipping } = this.elms;
      if (!estimateShipping) {
        return;
      }
      let estimateShippingForm = estimateShipping.querySelector("form");
      let countryElement = estimateShipping.querySelector("#shipping-calculator-country");
      let provinceElement = estimateShipping.querySelector("#shipping-calculator-province");
      let provinceParentElement = provinceElement.closest(".province");
      let messageContainer = estimateShipping.querySelector(".js-message-container");
      let errorMessage = estimateShipping.querySelector(".js-error-message");
      let resultsElement = estimateShipping.querySelector(".js-shipping-calculator-results");
      let placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
      let listNoDecimalsFormat = "amount_no_decimals,amount_no_decimals_with_comma_separator,amount_no_decimals_with_space_separator";
      let defaultCountry = countryElement.dataset.default;
      countryElement.addEvent("change", function() {
        let provinceList = JSON.parse(this.options[this.selectedIndex].dataset.provinces);
        if (provinceList.length) {
          provinceParentElement.removeClass("d-none");
          provinceList.forEach((item) => {
            let option = document.createElement("option");
            option.value = item[0];
            option.innerHTML = item[1];
            provinceElement.append(option);
          });
        } else {
          provinceParentElement.addClass("d-none");
          provinceElement.value = "";
        }
      });
      if (defaultCountry) {
        countryElement.value = defaultCountry;
        countryElement.dispatchEvent(new Event("change"));
      }
      estimateShippingForm.addEvent("submit", function(e) {
        e.preventDefault();
        let formData = new FormData(this);
        let searchParams = new URLSearchParams(formData).toString();
        this.addClass("pending");
        fetch(`/cart/shipping_rates.json?${searchParams}`, {
          dataType: "json"
        }).then(({ shipping_rates }) => {
          messageContainer.addClass("d-none");
          console.log(shipping_rates);
          if (shipping_rates.length) {
            resultsElement.querySelector("p").innerHTML = shipping_rates.length > 1 ? theme.strings.shipping.manyRates.replace("{{number}}", shipping_rates.length) : theme.strings.shipping.oneRate;
            resultsElement.querySelector("ul").innerHTML = shipping_rates.reduce((accu, rate) => {
              accu += `<li>${rate.name}: ${(listNoDecimalsFormat.includes(theme.currency.format.match(placeholderRegex)[1]) ? rate.price * 100 : rate.price).toCurrency()}</li>`;
              return accu;
            }, "");
          } else {
            resultsElement.querySelector("ul").innerHTML = "";
            resultsElement.querySelector("p").innerHTML = theme.strings.shipping.notFoundRate;
          }
          resultsElement.removeClass("d-none");
        }).catch((error) => {
          let key = Object.keys(error)[0];
          errorMessage.innerHTML = `${key} ${error[key]}`;
          messageContainer.removeClass("d-none");
          resultsElement.addClass("d-none");
          console.log("check");
        }).finally(() => this.removeClass("pending"));
      });
    },
    initCartNote() {
      let { cartNote, cartForm } = this.elms;
      if (cartNote) {
        cartNote.querySelector("textarea").addEvent("input", function(e) {
          cartNote.querySelector(".js-char-counter").innerHTML = this.value.length;
          cartForm.querySelector("textarea[name='note']").value = this.value;
        });
      }
    },
    initCheckoutSubmitButton() {
      let { cartForm, checkoutSubmitButton } = this.elms;
      if (checkoutSubmitButton) {
        checkoutSubmitButton.addEvent("click", function() {
          this.addClass("pending");
          cartForm.querySelector("button[name='checkout']").click();
        });
      }
    }
  };
  var CartLineItem = class extends HTMLElement {
    constructor() {
      super();
      this.elms = {
        totalPrice: this.querySelector(".js-total-price"),
        removeButton: this.querySelector(".js-remove-btn"),
        quantityInput: this.querySelector("quantity-input")
      };
      this.onChangeHandler();
      this.onRemoveHandler();
    }
    onChangeHandler() {
      let { quantityInput, totalPrice } = this.elms;
      customElements.whenDefined("quantity-input").then(() => {
        quantityInput.onChange((quantity) => {
          Cart.change(this.dataset.id, quantity).then((res) => {
            let { final_line_price } = res.items.find((item) => item.id == this.dataset.id);
            totalPrice.innerHTML = final_line_price.toCurrency();
            document.dispatchEvent(new CustomEvent("cart-change", { detail: res }));
          });
        });
      });
    }
    onRemoveHandler() {
      let { removeButton } = this.elms;
      removeButton.addEvent("click", (e) => {
        e.preventDefault();
        removeButton.addClass("pending");
        this.css("height", this.offsetHeight + "px");
        Cart.remove(this.dataset.id).then((res) => {
          document.dispatchEvent(new CustomEvent("cart-remove", { detail: res }));
          this.addClass("is-removing");
          AT.debounce(() => {
            this.remove();
          }, 500)();
        });
      });
    }
  };
  !customElements.get("cart-line-item") && customElements.define("cart-line-item", CartLineItem);
  register("cart-template", CartTemplate);
  load("cart-template");
  console.log("cart-page loaded");
})();
