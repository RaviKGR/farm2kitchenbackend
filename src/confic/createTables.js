const { db } = require("./db");

// SQL statements for creating tables
const Users = `CREATE TABLE IF NOT EXISTS Users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NULL,
    email VARCHAR(255) UNIQUE NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const createAddressTable = `CREATE TABLE IF NOT EXISTS  Address (
    address_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);`;

const Category = `CREATE TABLE IF NOT EXISTS  Category (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_category_id BIGINT,
    deleted VARCHAR(5),
    FOREIGN KEY (parent_category_id) REFERENCES Category(category_id)
);`;

const SubCategory = `CREATE TABLE IF NOT EXISTS  SubCategory (
    subcategory_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Category(category_id)
);`;

const Packaging = `CREATE TABLE IF NOT EXISTS Packaging (
    packaging_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    material VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL
);`;

const Product = `CREATE TABLE IF NOT EXISTS Product (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    category_id BIGINT,
    status BOOLEAN DEFAULT TRUE,
    best_Seller BOOLEAN DEFAULT FALSE NOT NULL,
    deleted VARCHAR(5),
    FOREIGN KEY (category_id) REFERENCES Category(category_id)
); `;

const Supplier = `CREATE TABLE IF NOT EXISTS Supplier (
    supplier_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255),
    address_id BIGINT,
    FOREIGN KEY (address_id) REFERENCES Address(address_id)
);`;

const productvariant = `CREATE TABLE IF NOT EXISTS productVariant (
    variant_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    description TEXT,
    size INT NOT NULL,
    type VARCHAR(255),
    barcode VARCHAR(100) NOT NULL,
    status BOOLEAN DEFAULT TRUE,
    best_Seller BOOLEAN DEFAULT FALSE NOT NULL,
    deleted VARCHAR(5),
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
)`;

const Inventory = `CREATE TABLE IF NOT EXISTS Inventory (
    inventory_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    variant_id BIGINT NOT NULL,
    quantity_in_stock INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    reorder_level INT NOT NULL,
    discount_percentage decimal(5, 2),
    supplier_id BIGINT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES productvariant(variant_id),
    FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id)
);`;

const productPurchase = `CREATE TABLE IF NOT EXISTS productPurchase (
    purchase_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    variant_id BIGINT NOT NULL,
    quantity_in_stock INT NOT NULL,
    purchase_price decimal(10,2) NOT NULL,
    HST DECIMAL(5, 2),
    purchase_date date, 
    FOREIGN KEY (variant_id) REFERENCES productvariant(variant_id)
)`;

const favorites = `CREATE TABLE IF NOT EXISTS favorites (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL
);`;

const Offer = `CREATE TABLE IF NOT EXISTS Offer (
    offer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
	discountType VARCHAR(50) NOT NULL, 
    discountValue DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    deleted VARCHAR(5) NOT NULL
);`;

const couponOffer = `CREATE TABLE IF NOT EXISTS Coupon (
    coupon_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    coupon_code VARCHAR(30) NOT NULL,
    name VARCHAR(100),
    description TEXT,
	coupon_type VARCHAR(50) NOT NULL, 
    coupon_value DECIMAL(10, 2) NOT NULL,
    max_discount_amt DECIMAL(10, 2) NOT NULL,
    min_amount DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    coupon_applied VARCHAR(5),
    deleted VARCHAR(5) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);`;

const offerDetails = `CREATE TABLE IF NOT EXISTS Offer_Details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    offer_id BIGINT NOT NULL,
    offer_tag VARCHAR(255) NOT NULL,
    tag_id BIGINT NOT NULL,
    FOREIGN KEY (offer_id) REFERENCES Offer(offer_id)
);`;

const Order = `CREATE TABLE IF NOT EXISTS Orders (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    coupon_id BIGINT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
	order_status VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (coupon_id) REFERENCES Coupon(coupon_id)
);`;

const OrderItem = `CREATE TABLE IF NOT EXISTS OrderItem (
    order_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);`;

const DeliveryPerson = `CREATE TABLE IF NOT EXISTS DeliveryPerson (
    delivery_person_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255),
    vehicle_details VARCHAR(255)
);
`;

const Delivery = `CREATE TABLE IF NOT EXISTS Delivery (
    delivery_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    delivery_date TIMESTAMP,
    delivery_status VARCHAR(50) NOT NULL,
    delivery_address_id BIGINT NOT NULL,
    delivery_person_id BIGINT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (delivery_address_id) REFERENCES Address(address_id),
    FOREIGN KEY (delivery_person_id) REFERENCES DeliveryPerson(delivery_person_id)
);`;

const ProductImage = `CREATE TABLE IF NOT EXISTS ProductImage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_id BIGINT NOT NULL,                
    image_url VARCHAR(500) NOT NULL,
    image_tag VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    is_primary VARCHAR(5) NOT NULL
);`;

// Authentication Tables

const users_credentials = `
CREATE TABLE IF NOT EXISTS users_credentials (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;

const tokens = `
CREATE TABLE IF NOT EXISTS tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);`;

const roles = `
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);`;

const user_roles = `
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);`;

const permissions = `
CREATE TABLE IF NOT EXISTS permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(50) UNIQUE NOT NULL
);`;

const role_permissions = `
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT,
    permission_id INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
);`;

const otps = `
CREATE TABLE IF NOT EXISTS otps (
    otp_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users_credentials (user_id)
);`;

const cart = `CREATE TABLE IF NOT EXISTS cart (
    cart_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    variant_id BIGINT NOT NULL,
    quantity_count BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES productvariant(variant_id),
    FOREIGN KEY (user_id) REFERENCES users_credentials (user_id)

);`;

const serviceLocation = `CREATE TABLE IF NOT EXISTS serviceLocation (
    location_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    devilery_day DATE NOT NULL
)`;

const ProductSize = `CREATE TABLE IF NOT EXISTS ProductSize(
    sizeID INT AUTO_INCREMENT PRIMARY KEY,
    sizeName VARCHAR(50) NOT NULL
)`;

// Function to execute the queries
async function createTables() {
  try {
    await db.promise().query(Users);
    await db.promise().query(createAddressTable);
    await db.promise().query(Category);
    await db.promise().query(createAddressTable);
    await db.promise().query(SubCategory);
    await db.promise().query(Packaging);
    await db.promise().query(Product);
    await db.promise().query(Supplier);
    await db.promise().query(productvariant);
    await db.promise().query(Inventory);
    await db.promise().query(productPurchase);
    await db.promise().query(Offer);
    await db.promise().query(offerDetails);
    await db.promise().query(couponOffer);
    await db.promise().query(Order);
    await db.promise().query(OrderItem);
    await db.promise().query(DeliveryPerson);
    await db.promise().query(Delivery);
    await db.promise().query(ProductImage);
    await db.promise().query(users_credentials);
    await db.promise().query(tokens);
    await db.promise().query(roles);
    await db.promise().query(user_roles);
    await db.promise().query(permissions);
    await db.promise().query(role_permissions);
    await db.promise().query(otps);
    await db.promise().query(role_permissions);
    await db.promise().query(favorites);
    await db.promise().query(cart);
    await db.promise().query(serviceLocation);
    await db.promise().query(ProductSize);
    console.log("All tables created successfully.");
  } catch (error) {
    console.error("Error creating tables:", error.message);
  }
}

// Run the function to create tables

module.exports = createTables;
