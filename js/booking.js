document.addEventListener("DOMContentLoaded", () => {
    const user = getCurrentUser();
    if (!user) {
        showToast("Please login to book a car.", "error");
        setTimeout(() => window.location.href = "login.html", 1500);
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('car');
    
    if (!carId) {
        window.location.href = "cars.html";
        return;
    }

    const cars = db.get("cars");
    const car = cars.find(c => c.id === carId);

    if (!car || !car.availability) {
        showToast("Car not available.", "error");
        setTimeout(() => window.location.href = "cars.html", 1500);
        return;
    }

    // Render Car Summary
    const summaryContainer = document.getElementById("car-summary");
    summaryContainer.innerHTML = `
        <img src="${car.image}" alt="${car.model}" style="width:100%; height:250px; object-fit:cover; border-radius:8px; margin-bottom:1rem;">
        <h3>${car.brand} ${car.model}</h3>
        <p class="text-secondary mb-2">${car.year} • ${car.type}</p>
        
        <div class="summary-item">
            <span>Rate per Day</span>
            <strong>$${car.price_per_day}</strong>
        </div>
        <div class="summary-item">
            <span>Total Days</span>
            <strong id="totalDays">0</strong>
        </div>
        <div class="summary-item" style="border:none; font-size:1.25rem;">
            <span>Total Amount</span>
            <strong id="totalAmount" style="color:var(--primary-color)">$0.00</strong>
        </div>
    `;

    const pickupDate = document.getElementById("pickupDate");
    const returnDate = document.getElementById("returnDate");
    const totalDaysEl = document.getElementById("totalDays");
    const totalAmountEl = document.getElementById("totalAmount");
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    pickupDate.min = today;
    returnDate.min = today;

    function calculateTotal() {
        if (pickupDate.value && returnDate.value) {
            const start = new Date(pickupDate.value);
            const end = new Date(returnDate.value);
            const diffTime = end - start;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

            if (start > end) {
                showToast("Return date cannot be before pickup date", "error");
                returnDate.value = "";
                totalDaysEl.textContent = "0";
                totalAmountEl.textContent = "$0.00";
                return;
            }

            totalDaysEl.textContent = diffDays;
            totalAmountEl.textContent = utils.formatCurrency(diffDays * car.price_per_day);
        }
    }

    pickupDate.addEventListener("change", () => {
        returnDate.min = pickupDate.value;
        calculateTotal();
    });
    returnDate.addEventListener("change", calculateTotal);

    // Form Submission
    document.getElementById("bookingForm").addEventListener("submit", (e) => {
        e.preventDefault();
        
        if (!pickupDate.value || !returnDate.value) {
            showToast("Please select dates", "error");
            return;
        }

        const start = new Date(pickupDate.value);
        const end = new Date(returnDate.value);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        if(diffDays <= 0) {
            showToast("Invalid date range", "error");
            return;
        }

        const totalAmount = diffDays * car.price_per_day;

        const bookingId = utils.generateId("b");
        const paymentId = utils.generateId("p");
        
        // Save Booking
        const newBooking = {
            booking_id: bookingId,
            user_id: user.id,
            car_id: car.id,
            pickup_date: pickupDate.value,
            return_date: returnDate.value,
            total_amount: totalAmount,
            status: "Confirmed"
        };
        db.add("bookings", newBooking);

        // Save Payment
        const method = document.getElementById("paymentMethod").value;
        const newPayment = {
            payment_id: paymentId,
            booking_id: bookingId,
            amount: totalAmount,
            method: method,
            status: "Success",
            date: new Date().toISOString()
        };
        db.add("payments", newPayment);

        // Update Car Availability (simple approach: mark unavailable)
        db.update("cars", car.id, { availability: false });

        // Show Success
        const modal = document.getElementById("successModal");
        modal.classList.add("active");
        
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 2000);
    });
});
