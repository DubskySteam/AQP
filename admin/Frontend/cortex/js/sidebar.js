/**
 * Author: Clemens Maas
 */

document.addEventListener('DOMContentLoaded', function() {
    const categories = document.querySelectorAll('.category-title');

    categories.forEach(category => {
        category.addEventListener('click', function() {
            const icon = this.querySelector('.icon');
            const subPages = this.nextElementSibling;

            subPages.classList.toggle('active');

            if (!subPages.classList.contains('active')) {
                icon.textContent = '▼';
            } else {
                icon.textContent = '▶';
            }
        });
    });
});
