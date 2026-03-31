document.addEventListener("DOMContentLoaded", () => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        window.location.href = "login.html";
        return;
    }

    const cars = db.get("cars");
    const bookings = db.get("bookings");
    const payments = db.get("payments");

    // Stats
    document.getElementById("totalBookingsStat").textContent = bookings.length;
    const rev = payments.reduce((acc, p) => acc + (p.status === 'Success' ? p.amount : 0), 0);
    document.getElementById("totalRevenueStat").textContent = utils.formatCurrency(rev);
    document.getElementById("fleetSizeStat").textContent = cars.length;

    // Render Cars Table
    const carsTbody = document.querySelector("#carsTable tbody");
    cars.forEach(car => {
        const statusBadge = car.availability 
            ? `<span style="color:var(--success-color); font-weight:bold;">Available</span>`
            : `<span style="color:var(--danger-color); font-weight:bold;">Rented</span>`;
            
        carsTbody.innerHTML += `
            <tr>
                <td>${car.id}</td>
                <td><strong>${car.brand} ${car.model}</strong><br><small class="text-secondary">${car.year}</small></td>
                <td>${car.type}</td>
                <td>$${car.price_per_day}</td>
                <td>${statusBadge}</td>
                <td style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                    <button class="btn btn-primary btn-sm" style="padding:0.25rem 0.5rem;" onclick="openEditModal('${car.id}')">Edit</button>
                    <button class="btn btn-secondary btn-sm" style="padding:0.25rem 0.5rem;" onclick="toggleAvailability('${car.id}')">Toggle</button>
                    <button class="btn btn-danger btn-sm" style="padding:0.25rem 0.5rem;" onclick="deleteCar('${car.id}')">Delete</button>
                </td>
            </tr>
        `;
    });

    // Render Bookings Table
    const bookingsTbody = document.querySelector("#bookingsTable tbody");
    bookings.sort((a,b) => b.pickup_date.localeCompare(a.pickup_date)).slice(0, 10).forEach(b => {
        const statusColor = b.status === "Confirmed" ? 'var(--success-color)' : 'var(--danger-color)';
        bookingsTbody.innerHTML += `
            <tr>
                <td>${b.booking_id}</td>
                <td>${b.user_id}</td>
                <td>${b.car_id}</td>
                <td>${utils.formatDate(b.pickup_date)} - ${utils.formatDate(b.return_date)}</td>
                <td>$${b.total_amount}</td>
                <td style="color:${statusColor}; font-weight:600;">${b.status}</td>
                <td>
                    ${b.status === 'Confirmed' ? `<button class="btn btn-danger btn-sm" style="padding:0.25rem 0.5rem;" onclick="cancelBookingAdmin('${b.booking_id}', '${b.car_id}')">Cancel</button>` : ''}
                </td>
            </tr>
        `;
    });

    // Add Car Form
    document.getElementById("addCarForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const newCar = {
            id: utils.generateId("c"),
            brand: document.getElementById("carBrand").value,
            model: document.getElementById("carModel").value,
            year: parseInt(document.getElementById("carYear").value),
            type: document.getElementById("carType").value,
            price_per_day: parseFloat(document.getElementById("carPrice").value),
            availability: true,
            image: document.getElementById("carImage").value
        };
        db.add("cars", newCar);
        showToast("Car added successfully!", "success");
        setTimeout(() => window.location.reload(), 1000);
    });
});

window.deleteCar = function(id) {
    if(confirm("Are you sure you want to delete this car?")) {
        db.remove("cars", id);
        showToast("Car deleted.", "success");
        setTimeout(() => window.location.reload(), 1000);
    }
}

window.openEditModal = function(id) {
    const car = db.get("cars").find(c => c.id === id);
    if (!car) return;
    document.getElementById("editCarId").value = car.id;
    document.getElementById("editCarBrand").value = car.brand;
    document.getElementById("editCarModel").value = car.model;
    document.getElementById("editCarYear").value = car.year;
    document.getElementById("editCarType").value = car.type;
    document.getElementById("editCarPrice").value = car.price_per_day;
    document.getElementById("editCarImage").value = car.image;
    document.getElementById("editCarModal").classList.add("active");
}

document.getElementById("editCarForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("editCarId").value;
    const updatedCar = {
        brand: document.getElementById("editCarBrand").value,
        model: document.getElementById("editCarModel").value,
        year: parseInt(document.getElementById("editCarYear").value),
        type: document.getElementById("editCarType").value,
        price_per_day: parseFloat(document.getElementById("editCarPrice").value),
        image: document.getElementById("editCarImage").value
    };
    db.update("cars", id, updatedCar);
    showToast("Car updated successfully!", "success");
    setTimeout(() => window.location.reload(), 1000);
});

window.toggleAvailability = function(id) {
    const car = db.get("cars").find(c => c.id === id);
    if (car) {
        db.update("cars", id, { availability: !car.availability });
        showToast("Car availability toggled.", "success");
        setTimeout(() => window.location.reload(), 500);
    }
}

window.cancelBookingAdmin = function(bookingId, carId) {
    if(confirm("Override and cancel this user booking?")) {
        db.update("bookings", bookingId, { status: "Cancelled" });
        db.update("cars", carId, { availability: true });
        showToast("Booking cancelled successfully", "success");
        setTimeout(() => window.location.reload(), 1000);
    }
}
