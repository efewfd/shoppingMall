// 기존 배송 상태 로딩 외에 추천 상품 이미지 로딩도 포함
window.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 배송 상태 불러오기
    try {
      const res = await fetch(`/api/orders/${userId}`);
      if (!res.ok) throw new Error("주문 정보 조회 실패");

      const orders = await res.json();
      const counts = {
        "배송준비중": 0,
        "배송중": 0,
        "배송완료": 0,
        "취소": 0,
        "교환": 0,
        "반품": 0
      };

      orders.forEach(order => {
        if (counts[order.status] !== undefined) {
          counts[order.status]++;
        }
      });

      document.getElementById("prep-count").textContent = counts["배송준비중"];
      document.getElementById("shipping-count").textContent = counts["배송중"];
      document.getElementById("complete-count").textContent = counts["배송완료"];

      document.getElementById("status-footer").textContent =
        `취소: ${counts["취소"]}    교환: ${counts["교환"]}    반품: ${counts["반품"]}`;

    } catch (err) {
      console.error("배송 현황 로딩 실패:", err);
    }
    // 추천 상품 이미지 로딩
    try {
        const res = await fetch("/api/products/random-products?count=5");
        const products = await res.json();
        if (!Array.isArray(products) || products.length === 0) return;

        const imgElement = document.getElementById("recommend-image");
        const linkElement = document.getElementById("recommend-link");
        let index = 0;

        const updateImage = () => {
            imgElement.style.opacity = 0;
            setTimeout(() => {
                const product = products[index];
                imgElement.src = product.image_url;
                imgElement.alt = product.name;
                linkElement.href = `/productDetail.html?id=${product._id}`; // 상세페이지 링크 설정
                imgElement.style.opacity = 1;

                index = (index + 1) % products.length;
            }, 200);
        };

        updateImage();
        setInterval(updateImage, 3000);
    } catch(err) {
        console.error("추천 이미지 슬라이드 오류:", err);
    }
});