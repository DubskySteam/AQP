package de.smartdata.porter.importer.descriptors;

import java.time.LocalDateTime;

/**
 * Class describing a stream
 * 
 * @author ffehring
 */
public class SourceDescriptor {
    
    String name;
    String path;
    LocalDateTime createDateTime;
    LocalDateTime modifyDateTime;
    
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public LocalDateTime getCreateDateTime() {
        return createDateTime;
    }

    public void setCreateDateTime(LocalDateTime createDateTime) {
        this.createDateTime = createDateTime;
    }

    public LocalDateTime getModifyDateTime() {
        return modifyDateTime;
    }

    public void setModifyDateTime(LocalDateTime modifyDateTime) {
        this.modifyDateTime = modifyDateTime;
    }
}
