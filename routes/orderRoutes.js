const express = require('express');
const router = express.Router();
const db = require('../js/db'); // ✅ DB 연결
const ProductModel = require('../models/product'); // mongoose 모델

// [GET] 전체 주문 목록 (관리자용)
router.get('/', async (req, res) => {
  try {
    const [orders] = await db.execute(`
      SELECT 
        o.id,
        o.user_id,
        u.name AS user_name,
        o.product_id,
        o.product_title,
        o.quantity,
        o.status,
        o.created_at
      FROM orders o
      LEFT JOIN users u ON o.user_id COLLATE utf8mb4_unicode_ci = u.user_id COLLATE utf8mb4_unicode_ci
      ORDER BY o.created_at DESC
    `);

    res.json(orders);
  } catch (err) {
    console.error('🛑 전체 주문 목록 조회 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 주문 조회
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [orders] = await db.execute(`
    SELECT id, product_id, quantity, status, created_at, product_title, product_image
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
  `, [userId]);

    const result = orders.map(order => ({
      quantity: order.quantity,
      status: order.status,
      createdAt: order.created_at,
      productId: order.product_id,
      product: {
        title: order.product_title,
        image: order.product_image
      }
    }));

    res.json(result);

  } catch (err) {
    console.error('🛑 주문 내역 불러오기 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});



// 주문 저장 API
router.post('/', async (req, res) => {
  const { userId, productId, status, product } = req.body;
  const rawQuantity = req.body.quantity;
  const quantity = parseInt(rawQuantity, 10);

  console.log("📦 요청 바디 전체:", req.body);
  console.log("📦 userId:", userId);
  console.log("📦 productId:", productId);
  console.log("📦 quantity:", quantity);
  console.log("📦 product.title:", product?.title);

  const productTitle = (typeof product?.title === 'string' ? product.title.trim() : '') || "제목없음";
  const productImage = product?.image || null;

  if (!userId || !productId || !productTitle || !Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: '필수 항목 누락 또는 유효하지 않은 수량' });
  }

  try {
    // ✅ MySQL에 주문 등록
    await db.execute(`
      INSERT INTO orders (
        user_id, product_id, quantity, status, product_title, product_image
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      userId,
      productId,
      quantity,
      status || '결제완료',
      productTitle,
      productImage
    ]);

    // ✅ 재고 확인
    const [check] = await db.execute('SELECT stock FROM products WHERE id = ?', [productId]);
    console.log("🔎 현재 MySQL 재고 조회:", check);

    // ✅ MySQL 재고 차감
    const [result] = await db.execute(`
      UPDATE products
      SET stock = stock - ?
      WHERE id = ? AND stock >= ?
    `, [quantity, productId, quantity]);

    console.log("🛠 UPDATE 결과 affectedRows:", result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: '재고 부족으로 주문이 실패했습니다.' });
    }

    res.status(201).json({ message: '주문 등록 성공' });
  } catch (err) {
    console.error('🛑 주문 등록 실패:', err);
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});





// PATCH /api/orders/:id
router.patch('/:id', async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  res.json({ message: '상태가 변경되었습니다.' });
});



module.exports = router;