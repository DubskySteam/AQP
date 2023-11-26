-- Check if the SmartSocial schema exists, and if it does, drop it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'SmartSocial') THEN
        DROP SCHEMA SmartSocial CASCADE;
    END IF;
END
$$;

