// 페이지 로드 시 localAtorage에서 선택된 카테고리 불러와서 강조
window.addEventListener('DOMContentLoaded', () => {
    const savedCategory = localStorage.getItem('selectedCategory');
    const links = document.querySelectorAll('.sub-bar a');

    links.forEach(link => {
        const category = link.getAttribute('data-category');
        if(category === savedCategory) {
            // 클릭된 항목에 active 추가
            link.classList.add('active');
        }
    });
});

// 카테고리 클릭 시 선택한 항목 기억
document.querySelectorAll('.sub-bar a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') e.preventDefault(); // 링크 없는 경우 새로고침 방지

        const category = link.getAttribute('data-category');
        localStorage.setItem('selectedCategory', category);
    });
});