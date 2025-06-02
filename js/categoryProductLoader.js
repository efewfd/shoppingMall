// 페이지가 처음 로드되면 loadCategoryProducts() 함수 실행
window.addEventListener('DOMContentLoaded', loadCategoryProducts);

// HTML에서 카테고리 정보를 읽고, 서버에서 해당 카테고리 상품만 불러와서 출력하는 함수
async function loadCategoryProducts() {
  // HTML <body> 태그에서 data-category1 / data-category2 값 읽기
  // ex) <body data-category1="top" data-category2="sweatshirt">
  const category1 = document.body.dataset.category1 || ''; 
  const category2 = document.body.dataset.category2 || '';

  // 서버 요청 URL 구성: 기본은 category1 필터, category2가 있을 경우 추가
  const params = new URLSearchParams();
  if (category1) params.append('category1', category1);
  if (category2) params.append('category2', category2);
  const url = '/api/products?' + params.toString();

  // 디버깅 출력
  console.log("요청 URL:", url);
  console.log("category1:", category1);
  console.log("category2:", category2);

  try{
    // 서버에 GET 요청을 보냄 → /api/products
    const res = await fetch(url);
    // 응답 데이터를 JSON 형식으로 파싱
    const products = await res.json();

    const validatedProducts = [];

    for (const item of products) {
      // 상품 ID 유효성 체크 (빈 문자열, undefined 등 제거)
      if (!item || !item._id || typeof item._id !== 'string') {
        console.warn("유효하지 않은 상품 ID:", item);
        continue;
      }

      // 상품이 백엔드에 존재하는지 확인
      try {
        const res = await fetch(`/api/products/${item._id}`);
        if (!res.ok) {
          console.warn(`삭제된 상품 ID: ${item._id}`);
          continue;
        }

        const product = await res.json();
        if (product && product.name) {
          validatedProducts.push(product);
        }
      } catch (err) {
        console.warn("상품 확인 실패:", item._id);
      }
    }
    
    // 상품을 표시할 HTML 요소를 가져옴
    const container = document.getElementById('product-list');
    container.innerHTML = ''; // 기존 내용을 비움

    if (validatedProducts.length === 0) {
      container.innerHTML = '<p>해당 카테고리에 등록된 상품이 없습니다.</p>';
      return;
    }

    // 상품 배열을 반복해서 화면에 카드 형태로 출력
    validatedProducts.forEach(product => {
      // 상품 카드 div 생성
      const card = document.createElement('div');
      card.className = 'product-card'; // 스타일을 위한 클래스, CSS 적용되게 class도 붙임

      // 상품 정보를 HTML로 구성
      card.innerHTML = `
        <a href="/productDetail.html?id=${product._id}">
          <img src="${product.image_url}" alt="${product.name}" />
          <p class="product-name">${product.name}</p>
          <p class="product-price">${parseInt(product.price).toLocaleString()}원</p>
        </a>
      `;

      // 카드 요소를 상품 리스트 영역에 추가
      container.appendChild(card);
    });
  } catch (err) {
    console.error('상품 불러오기 실패:', err);
  }
}