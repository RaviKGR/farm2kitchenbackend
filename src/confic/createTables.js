const { db } = require("./db");


// SQL statements for creating tables
const Users = `CREATE TABLE IF NOT EXISTS Users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`


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
);`

const Category = `CREATE TABLE IF NOT EXISTS  Category (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_category_id BIGINT,
    category_deleted VARCHAR(5),
    FOREIGN KEY (parent_category_id) REFERENCES Category(category_id)
);`




const SubCategory = `CREATE TABLE IF NOT EXISTS  SubCategory (
    subcategory_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Category(category_id)
);`

const Packaging = `CREATE TABLE IF NOT EXISTS Packaging (
    packaging_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    material VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL
);`


const Product = `CREATE TABLE IF NOT EXISTS Product (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id BIGINT NOT NULL,
    packaging_id BIGINT NOT NULL,
	barcode VARCHAR(100) NOT NULL, 
    status BOOLEAN DEFAULT TRUE,
    product_deleted VARCHAR(5),
    FOREIGN KEY (category_id) REFERENCES Category(category_id),
    FOREIGN KEY (packaging_id) REFERENCES Packaging(packaging_id)
); `

const Supplier = `CREATE TABLE IF NOT EXISTS Supplier (
    supplier_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255),
    address_id BIGINT,
    FOREIGN KEY (address_id) REFERENCES Address(address_id)
);`

const Inventory = `CREATE TABLE IF NOT EXISTS Inventory (
    inventory_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    quantity_in_stock INT NOT NULL,
    reorder_level INT NOT NULL,
    supplier_id BIGINT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Product(product_id),
    FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id)
);`

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
    end_date DATE NOT NULL
	
);`

const Product_Offer = `CREATE TABLE IF NOT EXISTS Product_Offer (
    product_id BIGINT NOT NULL,
    offer_id BIGINT NOT NULL,
    PRIMARY KEY (product_id, offer_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id),
    FOREIGN KEY (offer_id) REFERENCES Offer(offer_id)
);`


const Order = `CREATE TABLE IF NOT EXISTS Orders (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
	order_status VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);`


const OrderItem = `CREATE TABLE IF NOT EXISTS OrderItem (
    order_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);`

const DeliveryPerson = `CREATE TABLE IF NOT EXISTS DeliveryPerson (
    delivery_person_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255),
    vehicle_details VARCHAR(255)
);
`

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
);`


const ProductImage = `CREATE TABLE IF NOT EXISTS ProductImage (
    image_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);`



// Authentication Tables

const users_credentials = `
CREATE TABLE IF NOT EXISTS users_credentials (
    uc_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES Users(user_id)
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
    user_id BIGINT,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);`



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
        await db.promise().query(Inventory);
        await db.promise().query(Offer);
        await db.promise().query(Product_Offer);
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
        console.log("All tables created successfully.");
    } catch (error) {
        console.error("Error creating tables:", error.message);
    }
}

// Run the function to create tables

module.exports = createTables;