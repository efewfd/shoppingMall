window.addEventListener('DOMContentLoaded', async () => {
  const Params = new URLSearchParams(window.location.search);
  const productId = Params.get('id');

  if (!productId) return;

  try {
    const res = await fetch(`/api/products/${productId}`);
    const product = await res.json();

    // 이미지, 텍스트 연결
    document.querySelector('.detail-image img').src = product.image_url;
    document.querySelector('.product-code').textContent = `상품번호: ${product._id}`;
    document.querySelector('.product-title').textContent = product.name;
    document.querySelector('.original-price').textContent = `${parseInt(product.price).toLocaleString()}원`;
    
    // 구매하기용 저장도 갱신 (장바구니/찜용 데이터 저장)
    window.productForCart = {
      id: product._id,
      title: product.name,
      price: product.price,
      image: product.image_url,
      stock: product.stock
    };

    // 초기 찜 상태 반영
    const wishBtn = document.querySelector('.wishlist');
    if(wishBtn) {
      wishBtn.addEventListener("click", () => {
        console.log("찜 버튼 눌림");
        toggleWishlist(window.productForCart, wishBtn);
      });

      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      if(wishlist.some(item => item.id === product._id)) {
        wishBtn.textContent = "찜 취소";
        wishBtn.classList.add("active");
      }
    }

  } catch (err) {
    console.error('상품 정보 불러오기 실패:', err);
  }
});

// 상품 장바구니에 담기
// function addToCart(product) {
//   console.log('[담기 시도]', product);
//   const cart = JSON.parse(localStorage.getItem('cart')) || [];
//   // 이미 존재하는 상품인지 확인
//   const exists = cart.some(item => item.id === product.id);
//   if (exists) {
//     alert('이미 장바구니에 담긴 상품입니다!');
//     return;
//   }
//   product.quantity = 1; // 수량 초기값 설정
//   cart.push(product);
//   localStorage.setItem('cart', JSON.stringify(cart));
//   alert('장바구니에 담겼습니다!');
// }

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
  const exists = cart.some(item => item.id === product.id);
  if (exists) {
    alert('이미 장바구니에 담긴 상품입니다!');
    return;
  }

  product.quantity = 1;
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
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
  const exists = cart.some(item => item.id === product.id);
  if (exists) {
    alert('이미 장바구니에 담긴 상품입니다.');
    window.location.href = 'cart.html';
    return;
  }
  product.quantity = 1; // 수량 초기값 설정
  cart.push(product);
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
    alert('로그인 후 사용할 수 있습니다.');
    return;
  }

  try {
    const checkRes = await fetch(`/api/wishlist/${userId}`);
    if(!checkRes.ok) throw new Error('404 or Server Error');

    const wishlist = await checkRes.json();
    const exists = wishlist.find(item => item.productId === product.id);

    if(exists) {
      const deleteRes = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ userId, productId: product.id })
      });

      if(!deleteRes.ok) throw new Error('찜 삭제 실패');

      buttonElement.textContent = "찜하기";
      buttonElement.classList.remove("active");
    } else {
      const postRes = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ userId, productId: product.id, product: {title: product.title, price: product.price, image: product.image, stock: product.stock} })
      });

      if (!postRes.ok) throw new Error('찜 등록 실패');

      const result = await postRes.json();  // 안전하게 json 파싱 가능
      console.log("✅ 찜 등록 응답:", result);

      buttonElement.textContent = "찜 취소";
      buttonElement.classList.add("active");
    }
  } catch(error) {
    console.error('찜 처리 실패:', error);
    alert('오류가 발생했습니다.');
  }
}