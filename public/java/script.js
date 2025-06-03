let newsItems = [];

function showAddForm() {
    document.getElementById('modalTitle').textContent = 'Add News';
    document.getElementById('newsModal').style.display = 'block';
    document.getElementById('newsForm').reset();
}

function closeModal() {
    document.getElementById('newsModal').style.display = 'none';
}

function addNews(event) {
    event.preventDefault();
    
    const imageFile = document.getElementById('newsImage').files[0];
    const date = document.getElementById('newsDate').value;
    const description = document.getElementById('newsDescription').value;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const newNews = {
            id: Date.now(),
            image: e.target.result,
            date: date,
            description: description
        };
        
        newsItems.push(newNews);
        renderNews();
        closeModal();
    };
    
    reader.readAsDataURL(imageFile);
}

function deleteNews(id) {
    newsItems = newsItems.filter(item => item.id !== id);
    renderNews();
}

function editNews(id) {
    const news = newsItems.find(item => item.id === id);
    if (news) {
        document.getElementById('modalTitle').textContent = 'Edit News';
        document.getElementById('newsDate').value = news.date;
        document.getElementById('newsDescription').value = news.description;
        document.getElementById('newsModal').style.display = 'block';
        
        // Update the form submission handler to handle edit
        const form = document.getElementById('newsForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            news.date = document.getElementById('newsDate').value;
            news.description = document.getElementById('newsDescription').value;
            
            const imageFile = document.getElementById('newsImage').files[0];
            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    news.image = e.target.result;
                    renderNews();
                    closeModal();
                };
                reader.readAsDataURL(imageFile);
            } else {
                renderNews();
                closeModal();
            }
        };
    }
}

function renderNews() {
    const grid = document.getElementById('newsGrid');
    grid.innerHTML = '';
    
    newsItems.forEach(news => {
        const newsElement = document.createElement('div');
        newsElement.className = 'news-item';
        newsElement.innerHTML = `
            <img src="${news.image}" alt="News Image">
            <div class="news-content">
                <div class="news-date">${news.date}</div>
                <p>${news.description}</p>
                <div class="news-actions">
                    <button class="edit-btn" onclick="editNews(${news.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteNews(${news.id})">Delete</button>
                </div>
            </div>
        `;
        grid.appendChild(newsElement);
    });
}

// Initialize
document.getElementById('newsForm').addEventListener('submit', addNews);
window.onclick = function(event) {
    if (event.target === document.getElementById('newsModal')) {
        closeModal();
    }
}