// 장바구니 불러오기
const cart = JSON.parse(localStorage.getItem('cart')) || [];
const hasItems = cart.length > 0;

document.querySelector('.cart-table.empty').style.display = hasItems ? 'none' : '';
document.querySelector('.cart-table.full').style.display = hasItems ? '' : 'none';
document.querySelector('.cart-summary').style.display = hasItems ? '' : 'none';
document.querySelector('.cart-buttons').style.display = hasItems ? '' : 'none';

if (hasItems) {
  const tbody = document.querySelector('.cart-table.full tbody');
  tbody.innerHTML = ''; // 초기화

  let totalPrice = 0;

  cart.forEach(item => {
    const quantity = item.quantity || 1;    // 수량 사용
    const price = parseInt(item.price);
    const itemTotal = price * quantity;
    totalPrice += itemTotal;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" /></td>
      <td><img src="${item.image}" alt="${item.title}" class="item-img" /></td>
      <td>${item.title}</td>
      <td>${price.toLocaleString()}원</td>
      <td>
        <button onclick="changeQuantity('${item.id}', -1)">-</button>
        <span id="qty-${item.id}">${item.quantity || 1}</span>
        <button onclick="changeQuantity('${item.id}', 1)">+</button>
        <button onclick="updateQuantity('${item.id}')">수정</button>
      </td>
      <td>무료배송</td>
      <td>0원</td>
      <td>${itemTotal.toLocaleString()}원</td>
      <td>
        <button>주문하기</button>
        <button onclick="removeItem('${item.id}')">삭제하기</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // 총합 출력
  document.querySelector('.cart-summary').innerHTML = 
    `총 구매금액: ${totalPrice.toLocaleString()}원 + 배송료: 0원 = <strong>${totalPrice.toLocaleString()}원</strong>`;
}

// 상품 삭제 함수
function removeItem(id) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const updatedCart = cart.filter(item => item.id !== id); // 클릭한 상품 제외

  localStorage.setItem('cart', JSON.stringify(updatedCart));
  window.location.reload(); // 삭제 후 화면 갱신
}

// 수량 변겅 함수
async function changeQuantity(id, diff) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const index = cart.findIndex(item => item.id === id);

  if (index !== -1) {
    const currentQty = cart[index].quantity || 1;
    const stock = cart[index].stock || 1;
    const newQty = currentQty + diff;

    if (newQty < 1) {
      alert('최소 수량은 1개입니다.');
      return;
    } 

    if (newQty > stock) {
      alert(`최대 주문 가능 수량은 ${stock}개입니다.`);
      return;
    }

    console.log('[📤 fetch 실행]', { productId: id, quantity: newQty });
    cart[index].quantity = newQty;
    localStorage.setItem('cart', JSON.stringify(cart));

    await fetch('/api/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id, quantity })
    });

    window.location.reload(); // 페이지 새로고침으로 반영
  }
}

// 수량 변경(MongoDB)
async function updateQuantity(id) {
  const span = document.getElementById(`qty-${id}`);
  const quantity = parseInt(span.textContent);

  if (isNaN(quantity) || quantity < 1) {
    alert('수량이 유효하지 않습니다.');
    return;
  }

  // MongoDB에 반영
  await fetch('/api/cart/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: id, quantity })
  });

  alert('수정 완료!');
  window.location.reload();
}

async function clearCart() {
  const confirmed = confirm('정말로 모든 상품을 삭제하시겠습니까?');

  if (confirmed) {
    // DB에서도 삭제
    await fetch('/api/cart/clear', { method: 'POST' });

    // 브라우저에서도 삭제
    localStorage.removeItem('cart');

    window.location.reload();
  }
}

