document.addEventListener("DOMContentLoaded", () => {
    const carsContainer = document.getElementById("cars-container");
    const searchInput = document.getElementById("searchInput");
    const typeFilter = document.getElementById("typeFilter");
    const priceFilter = document.getElementById("priceFilter");

    let cars = db.get("cars");

    function renderCars(filteredCars) {
        carsContainer.innerHTML = "";
        if (filteredCars.length === 0) {
            carsContainer.innerHTML = '<p class="text-secondary" style="grid-column: 1/-1; text-align:center;">No cars found matching your criteria.</p>';
            return;
        }

        filteredCars.forEach(car => {
            const btnHtml = car.availability 
                ? `<a href="booking.html?car=${car.id}" class="btn btn-primary text-center">Book Now</a>`
                : `<button class="btn btn-secondary" style="width:100%" disabled>Unavailable</button>`;

            carsContainer.innerHTML += `
                <div class="card car-card">
                    <img src="${car.image}" alt="${car.model}" class="car-img" loading="lazy">
                    <div class="car-details">
                        <div class="car-title">${car.brand} ${car.model}</div>
                        <div class="car-specs">
                            <span>🗓️ ${car.year}</span>
                            <span>🏎️ ${car.type}</span>
                        </div>
                        <div class="car-price">$${car.price_per_day} <span style="font-size:0.9rem; color:var(--text-secondary); font-weight:normal;">/ day</span></div>
                        ${btnHtml}
                    </div>
                </div>
            `;
        });
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const type = typeFilter.value;
        const maxPrice = priceFilter.value ? parseFloat(priceFilter.value) : Infinity;

        const filtered = cars.filter(car => {
            const matchesSearch = car.brand.toLowerCase().includes(searchTerm) || car.model.toLowerCase().includes(searchTerm);
            const matchesType = type === "All" || car.type === type;
            const matchesPrice = car.price_per_day <= maxPrice;
            return matchesSearch && matchesType && matchesPrice;
        });

        renderCars(filtered);
    }

    // Event Listeners
    if(searchInput) searchInput.addEventListener("input", applyFilters);
    if(typeFilter) typeFilter.addEventListener("change", applyFilters);
    if(priceFilter) priceFilter.addEventListener("input", applyFilters);

    // Initial render
    renderCars(cars);
});
