-- V4__add_fail_open_to_tenants.sql

ALTER TABLE tenants ADD COLUMN fail_open BOOLEAN NOT NULL DEFAULT TRUE;
