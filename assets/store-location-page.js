(() => {
  // app/scripts/common/model/store-location.js
  var StoreLocation = class {
    constructor(container, mapID) {
      let { mapKey } = container.dataset;
      let stores = JSON.parse(container.querySelector("[data-location-list-json]").innerHTML);
      stores.features.forEach((store, i) => {
        store.properties.id = i;
      });
      mapboxgl.accessToken = mapKey;
      this.map = new mapboxgl.Map({
        container: mapID,
        style: "mapbox://styles/mapbox/streets-v11",
        center: stores.features[0].geometry.coordinates,
        zoom: 9
      });
      this.map.on("load", () => {
        this.buildLocationList(container, stores);
        this.addMarkers(stores);
        this.createPopup(stores.features[0]);
      });
      this.initFilterStore(container);
      this.handlerSelectedStoreLOcation(stores, container);
    }
    createPopup({ geometry, properties }) {
      const popUps = document.getElementsByClassName("mapboxgl-popup");
      if (popUps[0])
        popUps[0].remove();
      new mapboxgl.Popup({ offset: 25, closeOnClick: false }).setLngLat(geometry.coordinates).setText(properties["Full Address"]).addTo(this.map);
    }
    buildLocationList(container, stores) {
      let listings = container.querySelector(".js-find-store-location-list");
      listings.children.forEach((li) => {
        let { lat, long } = li.dataset;
        li.addEvent("click", () => {
          let store = stores.features.find(({ properties: { Latitude, Longitude } }) => {
            return Latitude == lat && Longitude == long;
          });
          AT.cookie.set("arn-selected-store-location", JSON.stringify(store), 14);
          document.dispatchEvent(new CustomEvent("store-location-change"));
          this.map.jumpTo({
            center: store.geometry.coordinates
          });
          this.createPopup(store);
        });
      });
    }
    addMarkers(stores) {
      for (const marker of stores.features) {
        const el = document.querySelector(".marker.template").cloneNode(true);
        el.removeClass("d-none", "template");
        el.id = `marker-${marker.properties.id}`;
        new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).addTo(this.map);
        el.addEventListener("click", (e) => {
          this.createPopup(marker);
        });
      }
    }
    initFilterStore(container) {
      let countrySelect = container.querySelector(".js-find-store-location-country");
      let citySelect = container.querySelector(".js-find-store-location-city");
      let storeList = container.querySelector(".js-find-store-location-list");
      countrySelect.addEvent("change", function() {
        let cities = JSON.parse(this.options[this.selectedIndex].dataset.cities);
        citySelect.innerHTML = citySelect.options[0].outerHTML;
        cities.forEach((city) => {
          let option = document.createElement("option");
          option.innerText = city;
          option.value = city;
          citySelect.appendChild(option);
        });
      });
      citySelect.addEvent("change", function() {
        let countrySelected = countrySelect.value;
        storeList.children.forEach((li) => {
          let { city, country } = li.dataset;
          if (countrySelected == country && city == this.value) {
            li.removeClass("d-none");
          } else {
            li.addClass("d-none");
          }
        });
      });
    }
    handlerSelectedStoreLOcation(stores, container) {
      let selectedStore = JSON.parse(AT.cookie.get("arn-selected-store-location"));
      if (!selectedStore) {
        return;
      }
      let { Country, City, Latitude, Longitude } = selectedStore.properties;
      let countrySelect = container.querySelector(".js-find-store-location-country");
      let citySelect = container.querySelector(".js-find-store-location-city");
      let storeList = container.querySelector(".js-find-store-location-list");
      countrySelect.value = Country;
      countrySelect.dispatchEvent(new Event("change"));
      citySelect.value = City;
      citySelect.dispatchEvent(new Event("change"));
      let li = [...storeList.children].find((li2) => li2.dataset.lat == Latitude && li2.dataset.long == Longitude);
      console.log(li);
      li && li.click();
    }
  };

  // app/scripts/store-location-page.js
  register("store-location", {
    onLoad() {
      new StoreLocation(this.container, "map");
    }
  });
  load("store-location");
  console.log("store-location-page.js loaded");
})();
