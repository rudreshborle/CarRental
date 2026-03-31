document.addEventListener("DOMContentLoaded", () => {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Populate user info
    document.getElementById("userName").textContent = user.name;
    document.getElementById("userEmail").textContent = user.email;

    // Load data
    const allBookings = db.get("bookings").filter(b => b.user_id === user.id);
    const allPayments = db.get("payments"); // filter based on bookings below
    const allCars = db.get("cars");

    const today = new Date().toISOString().split('T')[0];
    const activeBookings = allBookings.filter(b => b.return_date >= today && b.status === "Confirmed");
    const historyBookings = allBookings.filter(b => b.return_date < today || b.status === "Cancelled");

    // Render Active
    const activeList = document.getElementById("activeBookingsList");
    if(activeBookings.length === 0) activeList.innerHTML = "<p class='text-secondary'>No active bookings.</p>";
    activeBookings.forEach(b => {
        const car = allCars.find(c => c.id === b.car_id);
        const carName = car ? `${car.brand} ${car.model}` : 'Unknown Car';
        activeList.innerHTML += `
            <div class="booking-item">
                <div>
                    <h4>${carName}</h4>
                    <p class="text-secondary mt-1">🗓️ ${utils.formatDate(b.pickup_date)} - ${utils.formatDate(b.return_date)}</p>
                    <p class="mt-1"><strong>Total:</strong> $${b.total_amount}</p>
                </div>
                <div style="text-align:right;">
                    <span class="status-badge status-confirmed mb-2" style="display:inline-block;">${b.status}</span><br>
                    <button class="btn btn-danger btn-sm" style="padding: 0.5rem 1rem;" onclick="cancelBooking('${b.booking_id}', '${b.car_id}')">Cancel Booking</button>
                </div>
            </div>
        `;
    });

    // Render History
    const historyList = document.getElementById("bookingHistoryList");
    if(historyBookings.length === 0) historyList.innerHTML = "<p class='text-secondary'>No past bookings.</p>";
    historyBookings.forEach(b => {
        const car = allCars.find(c => c.id === b.car_id);
        const carName = car ? `${car.brand} ${car.model}` : 'Unknown Car';
        const statusClass = b.status === "Confirmed" ? "status-confirmed" : "status-cancelled";
        historyList.innerHTML += `
            <div class="booking-item">
                <div>
                    <h4>${carName}</h4>
                    <p class="text-secondary mt-1">🗓️ ${utils.formatDate(b.pickup_date)} - ${utils.formatDate(b.return_date)}</p>
                </div>
                <div>
                    <span class="status-badge ${statusClass}">${b.status}</span>
                </div>
            </div>
        `;
    });

    // Render Payments
    const paymentList = document.getElementById("paymentHistoryList");
    const userPaymentList = allPayments.filter(p => allBookings.some(b => b.booking_id === p.booking_id));
    if(userPaymentList.length === 0) paymentList.innerHTML = "<p class='text-secondary'>No payments found.</p>";
    userPaymentList.forEach(p => {
        paymentList.innerHTML += `
            <div class="booking-item">
                <div>
                    <h4>Receipt #${p.payment_id}</h4>
                    <p class="text-secondary mt-1">Date: ${utils.formatDate(p.date.split('T')[0])}</p>
                    <p class="mt-1">Method: ${p.method}</p>
                </div>
                <div style="text-align:right;">
                    <strong style="font-size:1.25rem;">$${p.amount}</strong><br>
                    <span class="status-badge status-confirmed mt-1" style="display:inline-block;">${p.status}</span>
                </div>
            </div>
        `;
    });
});

window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

window.cancelBooking = function(bookingId, carId) {
    if(confirm("Are you sure you want to cancel this booking?")) {
        db.update("bookings", bookingId, { status: "Cancelled" });
        db.update("cars", carId, { availability: true });
        showToast("Booking cancelled successfully", "success");
        setTimeout(() => window.location.reload(), 1500);
    }
}
