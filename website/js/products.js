const supabase = window.supabaseClient;

// Helper function to create a product card HTML string
function createProductCard(product) {
  return `
        <div class="product-card">
            <img src="${product.image_url}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <div style="font-size: 14px; color: #f59e0b; margin-bottom: 10px;">
                    ★ ${product.rating} 
                    <span style="color: var(--text-muted); font-size: 12px; margin-left: 5px;">
                        ${product.stock > 0 ? "In Stock" : '<span style="color:red">Out of Stock</span>'}
                    </span>
                </div>
                <div class="product-footer">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <a href="product.html?id=${product.id}" class="btn btn-primary btn-sm" style="padding: 5px 15px; font-size: 14px;">View</a>
                </div>
            </div>
        </div>
    `;
}

// Fetch popular products for the Homepage
async function loadPopularProducts() {
  const grid = document.getElementById("popular-grid");
  if (!grid) return; // Only run on homepage

  grid.innerHTML = "<p>Loading products...</p>";

  // Fetching the first 8 products as "Popular" for now
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .limit(8);

  if (error) {
    console.error("Error fetching products:", error);
    grid.innerHTML = '<p style="color:red;">Failed to load products.</p>';
    return;
  }

  if (products.length === 0) {
    grid.innerHTML = "<p>No products found in the database.</p>";
    return;
  }

  grid.innerHTML = products.map(createProductCard).join("");
}

// Global Search Handler (Navbar)
function initializeSearch() {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        // Redirect to products page with search query
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
      }
    });
  }
}

// Initialize scripts
document.addEventListener("DOMContentLoaded", () => {
  initializeSearch();
  loadPopularProducts(); // Runs if #popular-grid exists
});
