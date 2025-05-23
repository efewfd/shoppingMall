document.querySelector("#product-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
  
    const res = await fetch("/api/products", {
      method: "POST",
      body: formData,
    });
  
    const data = await res.json();
    alert(data.message);
  });
  