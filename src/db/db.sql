CREATE TABLE users (
    id VARCHAR(10) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    account VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (account)
);
CREATE TABLE payments (
    id SERIAL,
    client VARCHAR(50) NOT NULL,
    tranDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ticket VARCHAR(50) NOT NULL,
    amount INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (client) REFERENCES users(id)
);