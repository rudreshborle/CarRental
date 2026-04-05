/** Bump when the default fleet catalog changes so localStorage picks up the new list. */
const FLEET_CATALOG_VERSION = "v2-indian";

const DUMMY_CARS = [
    {
        id: "c_4",
        model: "X5",
        brand: "BMW",
        year: 2023,
        type: "Luxury SUV",
        price_per_day: 9200,
        availability: true,
        image: "assets/images/bmw.png"
    },
    {
        id: "c_6",
        model: "911 Carrera",
        brand: "Porsche",
        year: 2024,
        type: "Luxury Sports",
        price_per_day: 25200,
        availability: true,
        image: "assets/images/porsche.png"
    },
    {
        id: "c_7",
        model: "Swift",
        brand: "Maruti Suzuki",
        year: 2023,
        type: "Hatchback",
        price_per_day: 1500,
        availability: true,
        image: "assets/images/swift.png"
    },
    {
        id: "c_8",
        model: "Nexon",
        brand: "Tata",
        year: 2024,
        type: "SUV",
        price_per_day: 2500,
        availability: true,
        image: "assets/images/nexon.png"
    },
    {
        id: "c_9",
        model: "Thar",
        brand: "Mahindra",
        year: 2023,
        type: "SUV",
        price_per_day: 3500,
        availability: true,
        image: "assets/images/thar.png"
    },
    {
        id: "c_10",
        model: "Creta",
        brand: "Hyundai",
        year: 2024,
        type: "SUV",
        price_per_day: 3200,
        availability: true,
        image: "assets/images/creta.png"
    },
    {
        id: "c_11",
        model: "Seltos",
        brand: "Kia",
        year: 2024,
        type: "SUV",
        price_per_day: 3000,
        availability: true,
        image: "assets/images/seltos.png"
    },
    {
        id: "c_12",
        model: "Dzire",
        brand: "Maruti Suzuki",
        year: 2023,
        type: "Sedan",
        price_per_day: 1800,
        availability: true,
        image: "assets/images/dzire.png"
    },
    {
        id: "c_13",
        model: "Tiago",
        brand: "Tata",
        year: 2023,
        type: "Hatchback",
        price_per_day: 1400,
        availability: true,
        image: "assets/images/tiago.png"
    },
    {
        id: "c_14",
        model: "Scorpio N",
        brand: "Mahindra",
        year: 2024,
        type: "SUV",
        price_per_day: 4200,
        availability: true,
        image: "assets/images/scorpio.png"
    },
    {
        id: "c_15",
        model: "Hector",
        brand: "MG",
        year: 2023,
        type: "SUV",
        price_per_day: 3800,
        availability: true,
        image: "assets/images/hector.png"
    },
    {
        id: "c_16",
        model: "Ertiga",
        brand: "Maruti Suzuki",
        year: 2024,
        type: "MPV",
        price_per_day: 2200,
        availability: true,
        image: "assets/images/ertiga.png"
    },
    {
        id: "c_17",
        model: "Punch",
        brand: "Tata",
        year: 2024,
        type: "SUV",
        price_per_day: 2000,
        availability: true,
        image: "assets/images/punch.png"
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

// Replace cached fleet when the default catalog changes (one-time per version)
(function migrateFleetCatalog() {
    const vKey = "carRental_fleetVersion";
    if (localStorage.getItem(vKey) === FLEET_CATALOG_VERSION) return;
    localStorage.setItem("cars", JSON.stringify(DUMMY_CARS));
    localStorage.setItem(vKey, FLEET_CATALOG_VERSION);
})();

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
    formatCurrency: (amount) => `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
};

// Auto-patch for existing cached prices to override to INR values
(function patchPrices() {
    let currentCars = JSON.parse(localStorage.getItem("cars") || "[]");
    let modified = false;
    currentCars.forEach(car => {
        const matchingCar = DUMMY_CARS.find(c => c.id === car.id);
        if (matchingCar && car.price_per_day !== matchingCar.price_per_day) {
            car.price_per_day = matchingCar.price_per_day;
            modified = true;
        }
    });

    DUMMY_CARS.forEach(dummyCar => {
        if (!currentCars.some(c => c.id === dummyCar.id)) {
            currentCars.push(dummyCar);
            modified = true;
        }
    });

    if (modified) {
        localStorage.setItem("cars", JSON.stringify(currentCars));
    }
})();

// Auto-patch for existing cached images to override to local assets
(function patchBrokenImages() {
    let currentCars = JSON.parse(localStorage.getItem("cars") || "[]");
    let modified = false;
    currentCars.forEach(car => {
        if (car.image.includes("unsplash.com")) {
            const newMatchingCar = DUMMY_CARS.find(c => c.id === car.id);
            if (newMatchingCar) {
                car.image = newMatchingCar.image;
                modified = true;
            }
        }
    });
    if (modified) {
        localStorage.setItem("cars", JSON.stringify(currentCars));
    }
})();
