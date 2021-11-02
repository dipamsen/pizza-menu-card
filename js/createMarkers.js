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

        const dishRatingPlane = document.createElement("a-entity");
        dishRatingPlane.setAttribute("id", `rating-plane-${dish.id}`);
        dishRatingPlane.setAttribute("position", { x: 2, y: 0, z: 0.5 });
        dishRatingPlane.setAttribute("geometry", {
          primitive: "plane",
          width: 1.5,
          height: 0.3,
        });
        dishRatingPlane.setAttribute("material", {
          color: "pink",
        });
        dishRatingPlane.setAttribute("rotation", {
          x: -90,
          y: 0,
          z: 0,
        });
        dishRatingPlane.setAttribute("visible", false);

        const rating = document.createElement("a-entity");
        rating.setAttribute("id", `rating-${dish.id}`);
        rating.setAttribute("position", { x: 0, y: 0.05, z: 0.1 });

        rating.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        rating.setAttribute("text", {
          font: "mozillavr",
          color: "black",
          width: 2.4,
          align: "center",
          value: `CUSTOMER RATING: ${dish.last_rating}`,
        });

        dishRatingPlane.appendChild(rating);
        marker.appendChild(dishRatingPlane);

        const dishReviewPlane = document.createElement("a-entity");
        dishReviewPlane.setAttribute("id", `review-plane-${dish.id}`);
        dishReviewPlane.setAttribute("position", { x: 2, y: 0, z: 0 });
        dishReviewPlane.setAttribute("geometry", {
          primitive: "plane",
          width: 1.5,
          height: 0.5,
        });
        dishReviewPlane.setAttribute("material", { color: "lightblue" });
        dishReviewPlane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
        dishReviewPlane.setAttribute("visible", false);

        const review = document.createElement("a-entity");
        review.setAttribute("id", `review-${dish.id}`);
        review.setAttribute("position", { x: 0, y: 0.05, z: 0.1 });
        review.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        review.setAttribute("text", {
          font: "mozillavr",
          color: "black",
          width: 2.4,
          align: "center",
          value: `CUSTOMER REVIEW: \n${dish.last_review}`,
        });

        dishReviewPlane.appendChild(review);
        marker.appendChild(dishReviewPlane);
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
