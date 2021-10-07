AFRAME.registerComponent("create-markers", {
  async init() {
    const mainScene = document.querySelector("#scene");
    const dishes = await this.getDishes();

    dishes.map((dish) => {
      const marker = document.createElement("a-marker");
      marker.setAttribute("id", dish.id);
      marker.setAttribute("type", "pattern");
      marker.setAttribute("url", dish.marker_patt_url);
      marker.setAttribute("cursor", {
        rayOrigin: "mouse",
      });
      marker.setAttribute("markerhandler", {});
      mainScene.appendChild(marker);

      const todaysDate = new Date();
      const todaysDay = todaysDate.getDay();
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      if (!dish.unavailable_days.includes(days[todaysDay])) {
        const model = document.createElement("a-entity");
        model.setAttribute("id", `model-${dish.id}`);
        model.setAttribute("position", dish.model_geometry.position);
        model.setAttribute("rotation", dish.model_geometry.rotation);
        model.setAttribute("scale", dish.model_geometry.scale);
        model.setAttribute("gltf-model", `url(${dish.model_url})`);
        model.setAttribute("gesture-handler", {});
        model.setAttribute("visible", false);
        marker.appendChild(model);

        const mainPlane = document.createElement("a-plane");
        mainPlane.setAttribute("id", `mainplane-${dish.id}`);
        mainPlane.setAttribute("position", {
          x: 0,
          y: 0,
          z: 0,
        });
        mainPlane.setAttribute("rotation", {
          x: -90,
          y: 0,
          z: 0,
        });
        mainPlane.setAttribute("width", 1.7);
        mainPlane.setAttribute("height", 1.5);
        marker.appendChild(mainPlane);

        const title = document.createElement("a-entity");
        title.setAttribute("id", `title-${dish.id}`);
        title.setAttribute("position", { x: 0, y: 0, z: 0.1 });
        title.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        title.setAttribute("text", {
          font: "monoid",
          color: "black",
          width: 1.8,
          height: 1,
          align: "center",
          value: dish.dish_name.toUpperCase(),
        });
        mainPlane.appendChild(title);

        const ingrList = document.createElement("a-entity");
        ingrList.setAttribute("id", `ingred-${dish.id}`);
        ingrList.setAttribute("position", {
          x: 0.3,
          y: 0,
          z: 0.1,
        });
        ingrList.setAttribute("rotation", {
          x: 0,
          y: 0,
          z: 0,
        });
        ingrList.setAttribute("text", {
          font: "monoid",
          color: "red",
          width: 2,
          align: "left",
          value: `${dish.ingredients.join("\n\n")}`,
        });
        mainPlane.appendChild(ingrList);

        const pricePlane = document.createElement("a-image");
        pricePlane.setAttribute("id", `priceplane-${dish.id}`);
        pricePlane.setAttribute(
          "src",
          "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/black-circle.png"
        );
        pricePlane.setAttribute("width", 0.8);
        pricePlane.setAttribute("height", 0.8);
        pricePlane.setAttribute("position", { x: -1.3, y: 0, z: 0.3 });
        pricePlane.setAttribute("rotation", { x: -90, y: 0, z: 0 });

        const price = document.createElement("a-entity");
        price.setAttribute("id", `price-${dish.id}`);
        price.setAttribute("position", { x: 0.03, y: 0.05, z: 0.1 });
        price.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        price.setAttribute("text", {
          font: "mozillavr",
          color: "white",
          width: 3,
          align: "center",
          value: `Only \n $${dish.price}`,
        });
        pricePlane.appendChild(price);

        marker.appendChild(pricePlane);
      }
    });
  },
  async getDishes() {
    const db = firebase.firestore();
    return await db
      .collection("dishes")
      .get()
      .then((snapshot) => snapshot.docs.map((doc) => doc.data()));
  },
});
