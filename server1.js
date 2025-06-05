const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const Product = require('./models/product');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const userRoutes = require('./routes/userRoutes');
const Wishlist = require('./models/wishlist');
const faqRoutes = require('./routes/faqRoutes');
const wishlistRouter = require('./routes/wishlist');
const Order = require('./models/Order');
const reviewRoutes = require('./routes/reviewRoutes');
const Review = require('./models/review');
const orderRoutes = require('./routes/orderRoutes');
const popularRoutes = require('./routes/popularRoutes');
const db = require('./js/db');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());  // JSON 전송용

app.use((req, res, next) => {
  console.log(`📡 요청 수신됨: ${req.method} ${req.url}`);
  next();
});

// MongoDB 연결
mongoose.connect('mongodb+srv://cd1:capstonedesign1@cluster0.snijqi4.mongodb.net/shopdb?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB 연결 완료'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 이미지 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// userId 받아서 찜 목록 조회
// app.get('/api/wishlist/:userId', async (req, res) => {
//   const { userId } = req.params;
//   const wishlist = await Wishlist.find({ userId });
//   res.json(wishlist);
// });

// 세션 설정
app.use(session({
  secret: 'secret-key', // 나중에 env로 빼기
  resave: false, 
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false   // HTTPS가 아닌 로컬환경일 경우 false여야 작동함
  }
}));


// 요청 본문 파싱
app.use(express.urlencoded({extended: true}));  // form 전송용

// 미들웨어
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/css', express.static(path.join(__dirname, 'Css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/html', express.static(path.join(__dirname, 'Html')));
app.use('/admin', express.static(path.join(__dirname, 'Html', 'admin')));


// 상품 API 연결
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes); //
app.use('/api/users', userRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/wishlist', wishlistRouter); //
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/popular-products', popularRoutes); //

// 쇼핑몰 라우팅
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Html', 'home.html'));
});
app.use('/top', express.static(path.join(__dirname, 'Html', 'top'))); // 정적으로 처리 -> top 파일 안의 html 자동으로 매핑
app.use('/bottom', express.static(path.join(__dirname, 'Html', 'bottom'))); // 정적으로 처리 -> bottom 파일 안의 html 자동으로 매핑
app.use('/dress', express.static(path.join(__dirname, 'Html', 'dress'))); // 정적으로 처리 -> dress 파일 안의 html 자동으로 매핑
app.use('/outerwear', express.static(path.join(__dirname, 'Html', 'outerwear'))); // 정적으로 처리 -> outerwear 파일 안의 html 자동으로 매핑
app.use('/skirt', express.static(path.join(__dirname, 'Html', 'skirt'))); // 정적으로 처리 -> skirt 파일 안의 html 자동으로 매핑
app.use('/', express.static(path.join(__dirname, 'Html'))); // 정적으로 처리 -> Html 파일 안의 html

// public 폴더 정적 경로 설정
app.use(express.static('public'));

// 관리자 페이지 라우팅
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'Html', 'admin', 'admin.html'));
});
app.get('/admin/manage-products', (req, res) => {
  res.sendFile(path.join(__dirname, 'Html', 'admin', 'manage-products.html'));
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

// POST /api/orders - 주문 저장
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, productId, quantity, status, product } = req.body;
    console.log("product.title in server:", product?.title);

    if (!userId || !productId) {
      return res.status(400).json({ message: '필수값 누락' });
    }

    console.log("저장될 상품명:", product?.title); // 콘솔 찍어서 디버깅 확인

    const sql = `
      INSERT INTO orders (user_id, product_id, quantity, status, product_title, product_image)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      userId,
      productId,
      quantity,
      status,
      product?.title || '',    // product_title 저장!
      product?.image || ''
    ];

    await db.execute(sql, values);
    res.status(201).json({ message: '주문 저장 완료' });

  } catch (err) {
    console.error('주문 저장 중 에러:', err.message);
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});



// GET /api/orders/:userId - 소비자용 배송조회
app.get('/api/orders/:userId', async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId });
  res.json(orders);
});

// GET /api/orders - 관리자용 전체 조회
app.get('/api/orders', async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId });
  res.json(orders);
});

// // PATCH /api/orders/:id - 관리자용 상태 변경
// app.patch('/api/orders/:id', async (req, res) => {
//   const { status } = req.body;
//   const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
//   res.json(order);
// });