document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  const container = document.getElementById("product-details-container");

  let currentProduct = null;
  let timeEntered = Date.now(); // Start timer

  if (!productId) {
    container.innerHTML = "<p>Product not found.</p>";
    return;
  }

  container.innerHTML = "<p>Loading product details...</p>";

  // Fetch product from Supabase
  const { data: product, error } = await window.supabaseClient
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error || !product) {
    container.innerHTML =
      '<p style="color:red;">Error loading product or product does not exist.</p>';
    return;
  }

  currentProduct = product;

  // Render Product HTML
  container.innerHTML = `
        <div class="product-layout" style="display: flex; gap: 40px; flex-wrap: wrap; margin-top: 40px;">
            <div class="product-image-container" style="flex: 1; min-width: 300px;">
                <img src="${product.image_url}" alt="${product.name}" style="width: 100%; border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
            </div>
            
            <div class="product-info-container" style="flex: 1; min-width: 300px;">
                <span class="product-category" style="color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">${product.category}</span>
                <h1 style="font-size: 32px; margin: 10px 0;">${product.name}</h1>
                
                <div style="font-size: 18px; color: #f59e0b; margin-bottom: 20px;">
                    ★ ${product.rating} 
                    <span style="color: var(--text-muted); font-size: 14px; margin-left: 10px;">
                        ${product.stock > 0 ? `<span style="color: var(--secondary-color)">In Stock (${product.stock})</span>` : '<span style="color:red">Out of Stock</span>'}
                    </span>
                </div>
                
                <h2 style="font-size: 28px; color: var(--primary-color); margin-bottom: 20px;">$${product.price.toFixed(2)}</h2>
                
                <p style="color: var(--text-muted); line-height: 1.8; margin-bottom: 30px;">${product.description}</p>
                
                <div style="display: flex; gap: 15px; margin-bottom: 30px;">
                    <input type="number" id="qty-input" value="1" min="1" max="${product.stock}" style="width: 80px; padding: 10px; border-radius: var(--radius-md); border: 1px solid var(--border-color); font-size: 16px; text-align: center;" ${product.stock === 0 ? "disabled" : ""}>
                    
                    <button id="add-to-cart-btn" class="btn btn-primary" style="flex-grow: 1; font-size: 16px;" ${product.stock === 0 ? "disabled" : ""}>
                        ${product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                </div>
            </div>
        </div>
    `;

  // 1. Track that the user viewed this product
  trackBehavior("product_view", product.id, product.category);

  // 2. Track "Add to Cart" Clicks
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      const qty = parseInt(document.getElementById("qty-input").value);
      trackBehavior("add_to_cart", product.id, product.category);
      alert(
        `${qty} x ${product.name} added to cart! (Cart UI coming in next step)`,
      );
      // In the next step we will add actual database cart logic here
    });
  }

  // 3. Track Time Spent when the user leaves the page
  window.addEventListener("beforeunload", () => {
    const timeLeft = Date.now();
    const timeSpentSeconds = Math.floor((timeLeft - timeEntered) / 1000);

    // Cap time spent at 5 minutes (300 seconds) to prevent ruined data if they leave their computer
    const finalTime = timeSpentSeconds > 300 ? 300 : timeSpentSeconds;

    if (finalTime > 0) {
      // Because beforeunload is closing the page, we use a synchronous-like beacon if possible,
      // but tracking via supabase standard insert usually fires off just in time.
      trackBehavior(
        "time_spent",
        product.id,
        product.category,
        null,
        finalTime,
      );
    }
  });
});
