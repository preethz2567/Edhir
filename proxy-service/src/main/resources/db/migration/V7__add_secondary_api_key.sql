ALTER TABLE tenants
ADD COLUMN secondary_api_key VARCHAR(255),
ADD COLUMN secondary_key_expires_at TIMESTAMP;
