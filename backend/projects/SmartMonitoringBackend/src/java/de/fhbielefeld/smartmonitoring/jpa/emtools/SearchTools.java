package de.fhbielefeld.smartmonitoring.jpa.emtools;

import java.beans.BeanInfo;
import java.beans.IntrospectionException;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Collection;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import jakarta.persistence.Entity;
import jakarta.transaction.UserTransaction;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Table;

/**
 * Class realising JPA search mechanisms
 *
 * @author ffehring
 */
public class SearchTools {

    private EntityManager em;
    private UserTransaction utx;

    public SearchTools(EntityManager em, UserTransaction utx) {
        this.em = em;
        this.utx = utx;
    }

    /**
     * Finds objects with equaly informations, as the given object.
     *
     * SupressWarnings for reflection mechanism
     * 
     * @param <T>       Type of the enttity to find (one JPA Modelclass)
     * @param entity    Entity of the same type, where to find equalities for
     * @return          List of found equal entities or null
     * @throws de.fhbielefeld.smartmonitoring.jpa.emtools.EntityToolsException
     */
    @SuppressWarnings("unchecked")
    public <T extends Object> List<T> findEqualInformation(T entity) throws EntityToolsException {
        try {
            Class entityclass = entity.getClass();
            // Check if given object is an entity
            if (!entityclass.isAnnotationPresent(Entity.class)) {
                throw new EntityToolsException("Given object is not an entity");
            }
            String whereclause = "";
            // Get entity fields
            BeanInfo beanInfo = Introspector.getBeanInfo(entityclass);
            int i = 0;
            for (PropertyDescriptor pd : beanInfo.getPropertyDescriptors()) {
                // Get method for reading attribute
                Method readmethod = pd.getReadMethod();
                int modifiers = readmethod.getModifiers();
                // Ignoring methods, that are private (all JPA getters will be public)
                if (!Modifier.toString(modifiers).contains("private") && !Modifier.toString(modifiers).contains("protected")) {
                    // Exclude class-property, Collections and id
                    if (!pd.getDisplayName().equals("resource") 
                            && !pd.getDisplayName().equals("class") 
                            && pd.getPropertyType()!=Collection.class
                            && !pd.getDisplayName().equals("id")) {
                        if (i > 0) {
                            whereclause += " AND ";
                        }
                        if (pd.getPropertyType() == Class.class) {
                            Object obj = readmethod.invoke(entity);
                            Class cl = obj.getClass();
                            Method idmethod = cl.getMethod("getId");
                            System.out.println("id of " + pd.getDisplayName() + " : " + idmethod.invoke(obj));
                        } else {
                            if (pd.getPropertyType() == String.class) {
                                String value = (String) readmethod.invoke(entity);
                                if(value==null || value.isEmpty()) {
                                    whereclause += "("+pd.getDisplayName()+"='" + value + "' or " + pd.getDisplayName() + "=null)";
                                } else {
                                    whereclause += pd.getDisplayName()+"='" + value + "'";
                                }
                            } else {
                                whereclause += pd.getDisplayName()+"=" + readmethod.invoke(entity);
                            }
                        }
                        i++;
                    }

                }
            }
            // Get entity table name
            String tablename = entityclass.getName();
            String schemaname = "";
            if (entityclass.isAnnotationPresent(Table.class)) {
                Table tbl = (Table) entityclass.getAnnotation(Table.class);
                tablename = tbl.name();
                schemaname = tbl.schema() + ".";
            }

            // Create find SQL Statement
            String sql = "SELECT id FROM " + schemaname + tablename;
            sql += " WHERE " + whereclause;
            List<T> equalentities = this.em.createNativeQuery(sql, entityclass).getResultList();
            return equalentities;
        } catch (IntrospectionException | IllegalAccessException | IllegalArgumentException | InvocationTargetException | NoSuchMethodException | SecurityException ex) {
            Logger.getLogger(SearchTools.class.getName()).log(Level.SEVERE, null, ex);
        }
        return null;
    }
}
