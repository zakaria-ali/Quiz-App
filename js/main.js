const getQuizzesCategories = async () => {
    try {
        const response = await fetch('https://the-trivia-api.com/v2/categories');
        const categories = await response.json();
        console.log("categories", categories);

        // Generate the custom dropdown menu
        const dropdown = Object.entries(categories).map(([category, subcategories]) => {
            const imageUrl = `../images/${category}.png`;
            const subcategoryLinks = subcategories.map(subcategory => {
                return `<li><a href="../html/Quiz.html?category=${subcategory}">${subcategory}</a></li>`;
            }).join('');

            return `
                <div class="dropdown">
                    <img src="${imageUrl}" alt="${category}" class="category-image">
                    <span class="category-name">${category}</span>
                    <div class="dropdown-content">
                        <ul>${subcategoryLinks}</ul>
                    </div>
                </div>
            `;
        }).join('');

        // Populate the custom dropdown menu
        document.querySelector(".categories").innerHTML = dropdown;
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
};

// Call the function to fetch categories when the page loads
getQuizzesCategories();
