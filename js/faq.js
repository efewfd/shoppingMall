// 추천 상품 로딩
window.addEventListener("DOMContentLoaded", async () => {
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
                linkElement.href = `/productDetail.html?id=${product._id}`;
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

// 사용자 FAQ 목록 불러오기
let allFaqs = [];

window.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("faq-list");

    try {
        const res = await fetch("/api/faqs");
        allFaqs = await res.json(); // 전체 FAQ 저장
        renderFaqs("회원정보"); // 첫 로딩 시 "회원정보"만 보여줌
    } catch(err) {
        container.innerHTML = "<p>FAQ를 불러오는 데 실패했습니다.</p>";
    }

    // 탭 클릭시 필터링
    document.querySelectorAll(".faq-tabs .tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".faq-tabs .tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const category = tab.dataset.category;
            renderFaqs(category);
        });
    });
});

// 선택된 카테고리에 해당하는 FAQ만 출력
function renderFaqs(category) {
    const container = document.getElementById("faq-list");
    const filtered = allFaqs.filter(faq => faq.category === category);

    if (!filtered.length) {
        container.innerHTML = "<p>해당 카테고리에 FAQ가 없습니다.</p>";
        return;
    }

    container.innerHTML = filtered.map(faq => `
        <div class="faq-item">
            <div class="question">${faq.question} <span class="icon">◀</span></div>
            <div class="answer" style="display: none;">${faq.answer}</div>
        </div>
    `).join('');

    // 아코디언 기능
    document.querySelectorAll(".faq-item .question").forEach(q => {
        q.addEventListener("click", () => {
            const answer = q.nextElementSibling;
            const icon = q.querySelector("span");

            const isVisible = answer.style.display === "block";

            // 토글 동작
            answer.style.display = isVisible ? "none" : "block";
            icon.textContent = isVisible ? "◀" : "▼"; // ← 기본은 ◀, 펼치면 ▼
            // q.parentElement.classList.toggle("active");
        });
    });
}