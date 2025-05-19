let productList = [];
function router() {
  const path = window.location.pathname;
  const view = routes[path];

  if (typeof view === "function") {
    const result = view(); // Ejecuta la función

    if (typeof result === "string") {
      document.getElementById("page-content").innerHTML = result;
    }
  } else {
    document.getElementById("page-content").innerHTML =
      "<h1>404 - Página no encontrada</h1>";
  }
}

function navigateTo(url) {
  history.pushState(null, null, url);
  router();
}

document.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    navigateTo(e.target.href);
  }
});

window.addEventListener("load", async () => {
  await loadProducts();
  router();
});
window.addEventListener("popstate", router);

function displayProducts(productList) {
  let productsHTML = "";
  productList.forEach((product) => {
    productsHTML += `
      <div class="product-container">
        <div class="stock">${product.stock}x</div>
        <h3>${product.name}</h3>
        <img src="${product.image}" alt="${product.name}"/>
        <h1>$${product.price}</h1>
        <div class="input-wrapper">
          <input type="text" value="1" class="input-quantity"/>
          <button class="btn" data-id="${product.id}">
            <i class="mdi mdi-cart"></i>
          </button>
        </div>
      </div>`;
  });
  document.getElementById("page-content").innerHTML = productsHTML;
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const productId = parseInt(e.currentTarget.getAttribute("data-id"));
      const quantityInput = e.currentTarget
        .closest(".input-wrapper")
        .querySelector(".input-quantity");
      const quantity = parseInt(quantityInput.value);
      const product = productList.find((p) => p.id === productId);

      if (product) {
        cart.addItem({ ...product, quantity });
        alert(`Agregado ${quantity}x ${product.name} al carrito`);
      }
    });
  });
}
 


async function loadProducts() {
  productList = await (await fetch("/api/products")).json();
}
const routes = {
  "/": () => displayProducts(productList),
  "/carrito": () => {
    if (cart.items.length === 0) {
    return "<h1>Carrito vacío</h1>";
  }
  let html = "<h1>Carrito</h1><ul>";
  cart.items.forEach((item) => {
    html += `<li>${item.quantity}x ${item.name} - $${item.price * item.quantity}</li>`;
  });

  html += "</ul>";
  return html;
  },
  "/contacto": () => '<h1>Contacto</h1>',
};

const cart = {
  items: [],

  addItem: function (item) {
    const existingItem = this.items.find((i) => i.id === item.id);

    if (existingItem) {
      existingItem.quantity += item.quantity; // 👈 suma cantidades
    } else {
      this.items.push(item);
    }
  },

  removeItem: function (item) {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
    }
  },

  clearCart: function () {
    this.items = [];
  },
};

