// 별점 페이지 상태 변수
let selectedRating = 0;
let currentPage = 1;  // 현재 페이지 번호
const pageSize = 10;  // 한 번에 불러올 리뷰 개수
let totalReviews = 0; // 전체 리뷰 수(서버에서 받아옴)


window.addEventListener('DOMContentLoaded', async () => {

  initReviewEvents(); // 초기화 함수 실행

  const Params = new URLSearchParams(window.location.search);
  const productId = Params.get('id');

  if (!productId) return;

  try {
    console.log(Params.get('id'))
    const res = await fetch(`/api/products/${productId}`);

    if (!res.ok) {
    throw new Error("서버 응답 실패");
    }
    const product = await res.json();

    // null 체크
    if (!product || !product.image_url) {
      throw new Error("상품이 존재하지 않거나 이미지 정보 없음");
    }

    // 이미지, 텍스트 연결
    document.querySelector('.detail-image img').src = product.image_url;
    document.querySelector('.product-code').textContent = `상품번호: ${product._id}`;
    document.querySelector('.product-title').textContent = product.name;
    document.querySelector('.original-price').textContent = `${parseInt(product.price).toLocaleString()}원`;
    
    // 구매하기용 저장도 갱신 (장바구니/찜용 데이터 저장)
    window.productForCart = {
      id: product._id,
      code: product._id,  // 찜 토글에 사용
      title: product.name,
      price: product.price,
      image: product.image_url,
      stock: product.stock
    };
    console.log("productForCart 저장됨:", window.productForCart);

    const wishBtn = document.querySelector('.wishlist');
    if (!window.productForCart) {
      alert('상품 정보를 불러오는 중입니다.');
      return;
    }

    if(wishBtn) {
      wishBtn.addEventListener("click", () => {
        console.log("찜 버튼 눌림");
        toggleWishlist(window.productForCart, wishBtn);
      });

      // 초기 찜 상태 반영
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      if(wishlist.some(item => item.id === product._id)) {
        wishBtn.textContent = "찜 취소";
        wishBtn.classList.add("active");
      }
    }

  } catch (err) {
    console.error('상품 정보 불러오기 실패:', err);
    alert('상품 정보를 불러올 수 없습니다.');
    window.location.href = "/home.html";
  }
});

// 상품 장바구니에 담기
async function addToCart(product) {
  // 로그인 여부 먼저 확인
  const auth = await fetch('/api/auth/user');
  const data = await auth.json();

  if (!data.loggedIn) {
    alert('로그인 후 장바구니를 이용해주세요.');
    window.location.href = '/Login.html';
    return;
  }

  // 기존 로직 유지
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.some(item => item.id === product.id)) {
    alert('이미 장바구니에 담긴 상품입니다!');
    return;
  }

  const newItem = {
    id: product.id,
    code: product.code,
    title: product.title || product.name,     // 안전하게 넣기
    price: product.price,
    image: product.image,
    stock: product.stock,
    quantity: 1
  };

  cart.push(newItem);
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('장바구니에 담겼습니다!');
}

// 장바구니 담기 후 이동
async function addToCartAndGo() {
  const auth = await fetch('/api/auth/user');
  const data = await auth.json();

  if (!data.loggedIn) {
    alert('로그인 후 장바구니를 이용해주세요.');
    window.location.href = '/Login.html';
    return;
  }

  const product = window.productForCart;
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  // 이미 있는 상품인지 확인
  if (cart.some(item => item.id === product.id)) {
    alert('이미 장바구니에 담긴 상품입니다.');
    window.location.href = 'cart.html';
    return;
  }

  const newItem = {
    id: product.id,
    code: product.code,
    title: product.title || product.name,    // 여기도 추가
    price: product.price,
    image: product.image,
    stock: product.stock,
    quantity: 1
  };

  cart.push(newItem);
  localStorage.setItem("cart", JSON.stringify(cart));
  window.location.href = "cart.html";
}

// 찜 불러오기
function addToWishlist(product) {
  if(!product) {
    alert("상품 정보를 불러오는 중입니다.");
    return;
  }

  // 기존 찜 리스트 불러오기
  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

  // 중복 방지(상품 코드 기준)
  const exists = wishlist.find(item => item.id === product.code);
  if(exists) {
    alert("이미 찜한 상품입니다.");
    return;
  }

  // 추가 후 저장
  wishlist.push(product);
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  alert("찜한 상품에 추가되었습니다.");
}

// 찜
async function toggleWishlist(product, buttonElement) {
  const userId = localStorage.getItem('userId');
  console.log('userId:', userId);
  console.log('product.code:', product.id);

  if(!userId) {
    alert('로그인 후 찜할 수 있습니다.');
    return;
  }

  const isWished = buttonElement.classList.contains("active");

  try {
    if (isWished) {
      // 이미 찜된 상태 → 삭제 요청
      const deleteRes = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId: product.code })
      });

      if (!deleteRes.ok) throw new Error('찜 삭제 실패');

      buttonElement.textContent = "찜하기";
      buttonElement.classList.remove("active");
    } else {
      // 아직 안 찜된 상태 → 등록 요청
      const postRes = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productId: product.code,
          product: {
            title: product.title,
            price: product.price,
            image: product.image,
            stock: product.stock
          }
        })
      });

      if (!postRes.ok) throw new Error('찜 등록 실패');

      const result = await postRes.json();
      console.log("찜 등록 응답:", result);
      buttonElement.textContent = "찜 취소";
      buttonElement.classList.add("active");
    }
  } catch (error) {
    console.error('찜 처리 실패:', error);
    alert('오류가 발생했습니다.');
  }
}

window.addToCart = addToCart;
window.addToCartAndGo = addToCartAndGo;

// 구매후기 버튼 -> 전체 영역 보이기 + 리뷰 리스트 불러오기
document.getElementById('toggle-review-list-btn').addEventListener('click', async () => {
  const area = document.getElementById('review-area');
  const isVisible = area.style.display === 'block';

  if (!isVisible) {
    area.style.display = 'block';
    await loadReviews();
  } else {
    area.style.display = 'none';
  }
});

// 리뷰쓰기 버튼 -> 입력창 토글
document.getElementById('toggle-review-write-btn').addEventListener('click', async () => {
  // 로그인 여부 확인
  const res = await fetch('/api/auth/user');
  const data = await res.json();

  if (!data.loggedIn) {
    alert('로그인 후 리뷰를 작성할 수 있습니다.');
    window.location.href = '/Login.html';
    return;
  }
  // 로그인 되어 있으면 입력창 토글
  const form = document.getElementById('review-form');
  form.style.display = form.style.display === 'block' ? 'none' : 'block';
});

// 리뷰 목록 불러오기
async function loadReviews(reset = false) {
  const Params = new URLSearchParams(window.location.search);
  const productId = Params.get('id');
  const sort = document.getElementById('review-sort').value;

  // reset=true면 리스트 초기화(리뷰쓰기/필터 변경 시 사용)
  if(reset) {
    currentPage = 1;
    document.getElementById('review-list').innerHTML = '';
  }

  // 서버로 요청: 페이지, 정렬 기준 포함
  const res = await fetch(`/api/reviews/${productId}?sort=${sort}&page=${currentPage}&limit=${pageSize}`);
  const data = await res.json();
  const { reviews, total } = data;

  totalReviews = total; // 총 개수 저장

  const list = document.getElementById('review-list');

  // 리뷰 내용이 다 불러오면 '불러오는 중' 제거
  const loadingMsg = document.querySelector('#review-list p');
  if (loadingMsg && loadingMsg.textContent.includes('불러오는 중')) {
    loadingMsg.remove();
  }

  // 첫 페이지부터 데이터 없으면 메시지 출력
  if (reviews.length === 0 && currentPage === 1) {
    list.innerHTML = '<p>등록된 후기가 없습니다.</p>';
    document.getElementById('load-more-btn').style.display = 'none';
    return;
  }

  // HTML로 이어붙이기 (누적)
  list.innerHTML += reviews.map(r => `
    <div class="review-item" style="margin-bottom: 10px;">
      <div><strong>${r.userId || '익명'}</strong> ${'⭐'.repeat(r.rating || 0)}</div>
      <div>${r.content}</div>
    </div>
  `).join('');

  // 더보기 버튼
  const totalPages = Math.ceil(totalReviews / pageSize);
  if(currentPage < totalPages) {
    document.getElementById('load-more-btn').style.display = 'block'; // 더보기 표시
  } else {
    document.getElementById('load-more-btn').style.display = 'none';  // 더 이상 없음
  }

  currentPage++;  // 다음 페이지 준비

}

// 리뷰 등록
async function submitReview() {
  const content = document.getElementById('review-content').value.trim();
  const Params = new URLSearchParams(window.location.search);
  const productId = Params.get('id');
  const userId = localStorage.getItem('userId');

  if (!content || selectedRating === 0) {
    alert('내용과 별점을 모두 입력해주세요');
    return;
  }

  await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, userId, content, rating: selectedRating })
  });

  alert('리뷰가 등록되었습니다.');
  document.getElementById('review-content').value = '';
  selectedRating = 0;
  highlightStars(0);
  document.getElementById('review-form').style.display = 'none';
  await loadReviews(true);
}

// window.addEventListener('DOMContentLoaded', () => {
//   initReviewEvents(); // 초기화 함수 실행
// });

function highlightStars(count) {
  document.querySelectorAll('#rating-stars span').forEach(star => {
    const val = parseInt(star.dataset.value);
    star.textContent = val <= count ? '⭐' : '☆';
  });
}

function initReviewEvents() {

  document.querySelectorAll('#rating-stars span').forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.value);
      highlightStars(selectedRating);
    });
  });

  document.getElementById('review-sort').addEventListener('change', () => {
    loadReviews(true); // 정렬 기준 변경 시 리뷰 새로 불러오기
  });
}

// 더보기 버튼 클릭 시 -> 다음 페이지 리뷰 추가로 로드
document.getElementById('load-more-btn').addEventListener('click', () => {
  loadReviews(); // reset 없이 누적
});