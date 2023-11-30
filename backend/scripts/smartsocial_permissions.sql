ALTER SCHEMATA smartuser.smartsocial TO OWNER smartuser

DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN SELECT tablename FROM pg_tables WHERE schemaname = 'smartsocial' LOOP
        EXECUTE 'ALTER TABLE smartsocial.' || quote_ident(table_record.tablename) || ' OWNER TO smartuser';
    END LOOP;
END
$$;
