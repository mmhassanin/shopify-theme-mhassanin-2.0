class SearchForm extends HTMLElement {
  constructor() {
    super();
    this.elms = {
      formContainer: this.querySelector("form[action*='/search']"),
      inputElement: this.querySelector("input[name='q']"),
      resultsContanier: this.querySelector(".js-results-container"),
      viewAllButton: this.querySelector(".js-view-all"),
    };
    this.initInputEvent();
    document.addEvent("click", ({ target }) => {
      if (!this.contains(target)) {
        this.setStatus("unvisible");
      }
    });
    this.addEvent("click", this.setStatus.bind(this, "visible"));
  }
  initInputEvent() {
    let { inputElement, formContainer, resultsContanier, viewAllButton } = this.elms;
    inputElement.addEvent(
      "input",
      AT.debounce(() => {
        let { value } = inputElement;
        if (!value.trim()) {
          this.setStatus("");
          this.setStatus("unvisible");
          return;
        }
        this.setStatus("visible");
        this.setStatus("loading");
        fetch(`${theme.routes.searchUrl}?view=ajax&${new URLSearchParams(new FormData(formContainer)).toString()}`, {
          dataType: "text",
        }).then((content) => {
          resultsContanier.innerHTML = content;
          if (content.trim()) {
            AT.debounce(this.setStatus("show"), 50);
          } else {
            this.setStatus("empty");
          }
        });
      }, 500),
    );

    viewAllButton.addEvent("click", () => this.elms.formContainer.submit());
  }
  setStatus(status) {
    switch (status) {
      case "loading":
        this.setAttribute("data-status", "loading");
        break;
      case "empty":
        this.setAttribute("data-status", "empty");
        break;
      case "visible":
        this.addClass("is-visible");
        break;
      case "unvisible":
        this.removeClass("is-visible");
        break;
      case "show":
        this.setAttribute("data-status", "show");
        break;
      default:
        this.setAttribute("data-status", "");
    }
  }
}
customElements.define("search-form", SearchForm);
console.log("search.js loaded");
