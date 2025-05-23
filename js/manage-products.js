// 1차 카테고리에 따라 2차 카테고리를 자동 변경하는 매핑
const categoryMap = {
  top: ['basic', 'blouse', 'casual', 'shirt', 'hoddie', 'sweatshirt'],
  bottom: ['denim', 'short', 'cotton', 'leggings'],
  outerwear: ['coat', 'jacket', 'cardigan', 'vest'],
  dress: ['dress-min', 'dress-long'],
  skirt: ['skirt-min', 'skirt-long']
};

// select 요소 가져오기
const category1Select = document.querySelector('select[name="category1"]');
const category2Select = document.querySelector('select[name="category2"]');

// 1차 카테고리 변경 시, 관련된 2차 카테고리 옵션으로 갱신
category1Select.addEventListener('change', () => {
  const selectedCategory1 = category1Select.value;
  const subCategories = categoryMap[selectedCategory1] || [];

  // 2차 카테고리 초기화
  category2Select.innerHTML = '<option value="">2차 카테고리</option>';

  // 새로운 옵션 추가
  subCategories.forEach(sub => {
    const option = document.createElement('option');
    option.value = sub;
    option.textContent = sub;
    category2Select.appendChild(option);
  });
});

// 상품 등록
document.querySelector("#product-form").addEventListener("submit", async (e) => {
    e.preventDefault(); // 새로고침 막기
    const form = e.target;
    const formData = new FormData(form);  // form 데이터 추출

    console.log("선택한 1차 카테고리:", form.category1.value);
    console.log("선택한 2차 카테고리:", form.category2.value);

  
    // 서버에 상품 등록 요청 보내기 (POST)
    const res = await fetch("/api/products", {
      method: "POST",
      body: formData
    });
  
    const data = await res.json();
    alert(data.message);
    form.reset(); // 폼 초기화
    loadProducts(); // 목록 다시 불러오기
  });
  
  // 상품 목록 불러오기
  async function loadProducts() {
    const res = await fetch("/api/products");
    const products = await res.json();
  
    const tbody = document.querySelector("#product-table tbody");
    tbody.innerHTML = "";
  
    // 각 상품마다 테이블 행 생성
    products.forEach(product => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><img src="${product.image_url}" width="60" /></td>
        <td><input type="text" value="${product.name}" id="name-${product._id}" /></td>
        <td><input type="number" value="${product.price}" id="price-${product._id}" /></td>
        <td><input type="number" value="${product.stock}" id="stock-${product._id}" /></td>
        <td>${product.category1}</td>
        <td>${product.category2.join(', ')}</td>
        <td>
          <button onclick="updateProduct('${product._id}')">수정</button>
          <button onclick="deleteProduct('${product._id}')">삭제</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }
  
  // 상품 삭제
  function deleteProduct(id) {
    console.log('삭제 요청 ID:', id);  // 실행 확인용
    if (confirm('정말 삭제할까요?')) {
      fetch(`/api/products/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          loadProducts(); // 목록 갱신
        });
    }
  }
  
  // 상품 수정
  function updateProduct(id) {
    // 입력값 가져오기
    const name = document.getElementById(`name-${id}`).value;
    const price = document.getElementById(`price-${id}`).value;
    const stock = document.getElementById(`stock-${id}`).value;

    // 서버에 수정 요청 보내기 (PUT)
    fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, stock })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        loadProducts(); // 목록 갱신
      });
  }
  
  // 페이지 로드 시 상품 목록 불러오기
  window.addEventListener("DOMContentLoaded", loadProducts);