DELIMITER //

CREATE PROCEDURE InsertUserAndProfile(
    IN email VARCHAR(255),
    IN password VARCHAR(255),
    IN code TEXT
)
BEGIN
    DECLARE new_user_id INT;

    -- Insert into users table
    INSERT INTO users (email, password) VALUES (email, password);
    
    -- Get the ID of the newly inserted user
    SET new_user_id = LAST_INSERT_ID();
    
    -- Insert into user_profiles table
    INSERT INTO otps (user_id, otp_code,expires_at) VALUES (new_user_id, code,5);
END //

DELIMITER ;
