const DUMMY_CARS = [
    {
        id: "c_1",
        model: "Model S",
        brand: "Tesla",
        year: 2023,
        type: "Electric",
        price_per_day: 120,
        availability: true,
        image: "assets/images/tesla.png"
    },
    {
        id: "c_2",
        model: "Mustang GT",
        brand: "Ford",
        year: 2022,
        type: "Sports",
        price_per_day: 150,
        availability: true,
        image: "assets/images/mustang.png"
    },
    {
        id: "c_3",
        model: "Civic",
        brand: "Honda",
        year: 2021,
        type: "Sedan",
        price_per_day: 45,
        availability: true,
        image: "assets/images/civic.png"
    },
    {
        id: "c_4",
        model: "X5",
        brand: "BMW",
        year: 2023,
        type: "SUV",
        price_per_day: 110,
        availability: true,
        image: "assets/images/bmw.png"
    },
    {
        id: "c_5",
        model: "Wrangler",
        brand: "Jeep",
        year: 2022,
        type: "SUV",
        price_per_day: 80,
        availability: true,
        image: "assets/images/jeep.png"
    },
    {
        id: "c_6",
        model: "911 Carrera",
        brand: "Porsche",
        year: 2024,
        type: "Sports",
        price_per_day: 300,
        availability: true,
        image: "assets/images/porsche.png"
    }
];

function initializeDatabase() {
    if (!localStorage.getItem("cars")) {
        localStorage.setItem("cars", JSON.stringify(DUMMY_CARS));
    }
    if (!localStorage.getItem("users")) {
        localStorage.setItem("users", JSON.stringify([
            {
                id: "admin_1",
                name: "System Admin",
                email: "admin@rentals.com",
                phone: "000-0000",
                address: "HQ",
                license: "N/A",
                username: "admin",
                password: "adminpassword", // simulated password for admin
                role: "admin"
            }
        ]));
    }
    if (!localStorage.getItem("bookings")) {
        localStorage.setItem("bookings", JSON.stringify([]));
    }
    if (!localStorage.getItem("payments")) {
        localStorage.setItem("payments", JSON.stringify([]));
    }
}

// Call init immediately
initializeDatabase();

// DB Utility functions
const db = {
    get: (collection) => JSON.parse(localStorage.getItem(collection) || "[]"),
    set: (collection, data) => localStorage.setItem(collection, JSON.stringify(data)),
    add: (collection, item) => {
        const data = db.get(collection);
        data.push(item);
        db.set(collection, data);
    },
    update: (collection, id, updatedItem) => {
        const data = db.get(collection);
        const index = data.findIndex(i => i.id === id || i.booking_id === id || i.payment_id === id);
        if (index > -1) {
            data[index] = { ...data[index], ...updatedItem };
            db.set(collection, data);
        }
    },
    remove: (collection, id) => {
        const data = db.get(collection);
        const filtered = data.filter(i => i.id !== id && i.booking_id !== id && i.payment_id !== id);
        db.set(collection, filtered);
    }
};

const utils = {
    generateId: (prefix) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`,
    formatDate: (dateString) => new Date(dateString).toLocaleDateString(),
    formatCurrency: (amount) => `$${parseFloat(amount).toFixed(2)}`
};

// Auto-patch for existing cached images to override to local assets
(function patchBrokenImages() {
    let currentCars = JSON.parse(localStorage.getItem("cars") || "[]");
    let modified = false;
    currentCars.forEach(car => {
        if (car.image.includes("unsplash.com")) {
            const newMatchingCar = DUMMY_CARS.find(c => c.id === car.id);
            if(newMatchingCar) {
                car.image = newMatchingCar.image;
                modified = true;
            }
        }
    });
    if (modified) {
        localStorage.setItem("cars", JSON.stringify(currentCars));
    }
})();
