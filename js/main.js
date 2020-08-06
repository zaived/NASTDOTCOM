const client = ShopifyBuy.buildClient({
  domain: "awge-2018.myshopify.com",
  storefrontAccessToken: "2482ade8fa6727be64158d23a4590599"
});

$(() => {
  let checkoutId = localStorage.getItem("checkoutId");
  if (checkoutId == null) {
    client.checkout.create().then(checkout => {
      localStorage.setItem("checkoutId", checkout.id);
      checkoutId = checkout.id;
    });
  } else {
    client.checkout
      .fetch(checkoutId)
      .then(checkout => {
        console.log(checkout.lineItems);
      })
      .catch(err => {
        client.checkout.create().then(checkout => {
          localStorage.setItem("checkoutId", checkout.id);
          checkoutId = checkout.id;
        });
      });
  }
  let allProducts = [];
  const currentIndex = 0;
  client.product.fetchAll().then(products => {
    allProducts = products;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      let newElem = $(`
<div class="shop-item">
<img class="shop-item-image" src=${product.images[0].src} />
<h1 class="shop-item-title">${product.title}</h1>
<p class="shop-item-description">${product.descriptionHtml}</p>
<p class="shop-item-price">$${product.variants[0].price.split(".")[0]}</p>
<div class="shop-size-selector">
</div>
<button class="shop-add-to-cart">ADD TO CART</button>
</div>
`);
      for (let j = 0; j < product.variants.length; j++) {
        if (!product.variants[j].available) {
          newElem
            .find(".shop-size-selector")
            .append(
              `<div class='shop-size' data-variant-id=${product.variants[j].id}><span class="shop-sold-out">\\</span><p>${product.variants[j].selectedOptions[0].value}</p></div>`
            );
        } else {
          newElem
            .find(".shop-size-selector")
            .append(
              `<div class='shop-size' data-variant-id=${product.variants[j].id}><p>${product.variants[j].selectedOptions[0].value}</p></div>`
            );
        }
      }
      newElem[0].value = product;
      $("#shop-wrap").append(newElem);
      newElem
        .find(".shop-size-selector > div:first-child")
        .eq(0)
        .trigger("click");
    }
  });

  $(document).on("click", ".shop-size", function() {
    const parentElem = $(this).closest(".shop-item");
    const product = parentElem.eq(0)[0].value;
    if (product.variants[$(this).index()].available) {
      parentElem.find(".shop-size").removeClass("shop-active");
      $(this).addClass("shop-active");
      parentElem.find(".shop-add-to-cart").text("ADD TO CART");
      parentElem.find(".shop-add-to-cart").prop("disabled", false);
      parentElem.find(".shop-messages").text("");
    } else {
      parentElem.find(".shop-add-to-cart").text("SOLD OUT");
      parentElem.find(".shop-add-to-cart").prop("disabled", true);
    }
  });

  $(document).on("click", ".shop-add-to-cart", function() {
    const id = $(this)
      .closest(".shop-item")
      .find(".shop-active")
      .attr("data-variant-id");
    const lineItem = {
      variantId: id,
      quantity: 1
    };
    client.checkout.addLineItems(checkoutId, lineItem).then(checkout => {
      window.location.href = "/cart/";
    });
  });
});