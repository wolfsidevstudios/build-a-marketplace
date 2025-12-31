const PROJECT_ID = 'proj_i0fod7om6';

async function executeQuery(sql) {
    const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: PROJECT_ID, sql })
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
}

let currentCategory = null;
let currentSearch = '';
let currentState = '';

async function init() {
    await loadCategories();
    await loadListings();
    setupEventListeners();
}

async function loadCategories() {
    try {
        const categories = await executeQuery('SELECT * FROM categories ORDER BY name ASC');
        const list = document.getElementById('categoryList');
        const select = document.getElementById('categorySelect');
        
        categories.forEach(cat => {
            const li = document.createElement('li');
            li.className = 'cursor-pointer hover:text-blue-600 transition';
            li.textContent = cat.name;
            li.onclick = () => filterByCategory(cat.id);
            list.appendChild(li);

            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error('Error loading categories:', err);
    }
}

async function loadListings() {
    const grid = document.getElementById('listingsGrid');
    const empty = document.getElementById('emptyState');
    grid.innerHTML = '<div class="col-span-full text-center py-10">Cargando...</div>';

    let sql = `
        SELECT l.*, c.name as category_name 
        FROM listings l 
        JOIN categories c ON l.category_id = c.id 
        WHERE 1=1
    `;

    if (currentCategory) sql += ` AND l.category_id = ${currentCategory}`;
    if (currentState) sql += ` AND l.location_state = '${currentState}'`;
    if (currentSearch) sql += ` AND (l.title ILIKE '%${currentSearch}%' OR l.description ILIKE '%${currentSearch}%')`;
    
    sql += ' ORDER BY l.created_at DESC';

    try {
        const listings = await executeQuery(sql);
        grid.innerHTML = '';
        
        if (listings.length === 0) {
            empty.classList.remove('hidden');
            return;
        }
        
        empty.classList.add('hidden');
        listings.forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer border border-gray-100';
            card.innerHTML = `
                <div class="aspect-square bg-gray-200 overflow-hidden">
                    <img src="${item.image_url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop'}" 
                         class="w-full h-full object-cover" 
                         onerror="this.src='https://via.placeholder.com/400x400?text=Sin+Imagen'">
                </div>
                <div class="p-4">
                    <div class="text-xl font-bold text-gray-900">$${parseFloat(item.price).toLocaleString('es-MX')}</div>
                    <h3 class="text-gray-700 truncate">${item.title}</h3>
                    <div class="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        📍 ${item.location_city}, ${item.location_state}
                    </div>
                    <div class="mt-3 pt-3 border-t flex justify-between items-center">
                        <span class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">${item.category_name}</span>
                        <button onclick="contactSeller('${item.seller_contact}')" class="text-blue-600 text-sm font-semibold">Contactar</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        grid.innerHTML = '<div class="col-span-full text-red-500 text-center">Error al cargar anuncios.</div>';
        console.error(err);
    }
}

function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        currentSearch = e.target.value;
        loadListings();
    });

    document.getElementById('stateFilter').addEventListener('change', (e) => {
        currentState = e.target.value;
        loadListings();
    });

    document.getElementById('postForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        const sql = `
            INSERT INTO listings (title, description, price, category_id, location_state, location_city, image_url, seller_name, seller_contact)
            VALUES ('${data.title}', '${data.description}', ${data.price}, ${data.category_id}, '${data.location_state}', '${data.location_city}', '${data.image_url}', '${data.seller_name}', '${data.seller_contact}')
        `;

        try {
            await executeQuery(sql);
            alert('¡Anuncio publicado con éxito!');
            closeModal('postModal');
            e.target.reset();
            loadListings();
        } catch (err) {
            alert('Error al publicar: ' + err.message);
        }
    });
}

function filterByCategory(id) {
    currentCategory = id;
    loadListings();
}

function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
    document.getElementById(id).classList.add('flex');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
    document.getElementById(id).classList.remove('flex');
}

function contactSeller(contact) {
    alert('Contacta al vendedor en: ' + contact);
}

init();