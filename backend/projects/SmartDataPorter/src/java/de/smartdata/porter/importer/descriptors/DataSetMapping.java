package de.smartdata.porter.importer.descriptors;

import de.bytefish.pgbulkinsert.mapping.AbstractMapping;
import de.bytefish.postgisbulkinsert.PostgisExtensions;
import java.time.LocalDateTime;
import java.util.function.Function;
import mil.nga.sf.Geometry;

public class DataSetMapping<T> extends AbstractMapping<T> {

    public DataSetMapping(String schema, String table) {
        super(schema, table);
    }
    
    @Override
    public void mapBoolean(String columnName, Function<T, Boolean> func) {
        super.mapBoolean(columnName, func);
    }
    
    @Override
    public void mapDouble(String columnName, Function<T, Number> func) {
        super.mapDouble(columnName, func);
    }
    
    @Override
    public void mapTimeStamp(String columnName, Function<T, LocalDateTime> func) {
        super.mapTimeStamp(columnName, func);
    }
    
    public void mapGeometry(String columnName, Function<T, Geometry> func) {
        PostgisExtensions.mapPostgis(this, columnName, func);
    }
    
    @Override
    public void mapInteger(String columnName, Function<T, Number> func) {
        super.mapInteger(columnName, func);
    }
    
    @Override
    public void mapText(String columnName, Function<T, String> func) {
        super.mapText(columnName, func);
    }
    
    @Override
    public void mapVarChar(String columnName, Function<T, String> func) {
        super.mapVarChar(columnName, func);
    }
}
