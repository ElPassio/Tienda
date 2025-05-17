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
                  <button class="btn"><i class="mdi mdi-cart"></i></button>
                </div>
            </div>`;
  });
  document.getElementById("page-content").innerHTML = productsHTML;
}

async function loadProducts() {
  productList = await (await fetch("/api/products")).json();
}
const routes = {
  "/": () => displayProducts(productList),
  "/carrito": () => '<h1>Carrito</h1>',
  "/contacto": () => '<h1>Contacto</h1>',
};
