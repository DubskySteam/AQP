DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN SELECT t.table_name FROM information_schema.tables t WHERE t.table_schema = 'smartsocial'
    LOOP
        EXECUTE 'ALTER TABLE smartsocial.' || quote_ident(table_name) || ' OWNER TO smartuser;';
    END LOOP;

    EXECUTE 'ALTER SCHEMA smartsocial OWNER TO smartuser;';
END $$;
