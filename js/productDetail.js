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
    
    // 구매하기용 저장도 갱신 (장바구니용 데이터 저장)
    window.productForCart = {
      id: product._id,
      title: product.name,
      price: product.price,
      image: product.image_url,
      stock: product.stock
    };

  } catch (err) {
    console.error('상품 정보 불러오기 실패:', err);
  }
});

// 상품 장바구니에 담기
function addToCart(product) {
  console.log('[담기 시도]', product);
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  // 이미 존재하는 상품인지 확인
  const exists = cart.some(item => item.id === product.id);
  if (exists) {
    alert('이미 장바구니에 담긴 상품입니다!');
    return;
  }
  product.quantity = 1; // 수량 초기값 설정
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('장바구니에 담겼습니다!');
}


// 장바구니 담기 후 이동
function addToCartAndGo() {
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