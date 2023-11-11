package de.fhbielefeld.smartmonitoring.jpa;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.xml.bind.annotation.XmlRootElement;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Entity
@Table(name = "tbl_location_join_oo", schema = "smartmonitoring")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "TblLocationJoinOo.findAll", query = "SELECT t FROM TblLocationJoinOo t ORDER BY t.id"),
    @NamedQuery(name = "TblLocationJoinOo.findById", query = "SELECT t FROM TblLocationJoinOo t WHERE t.id = :id"),
    @NamedQuery(name = "TblLocationJoinOo.findByObservedObject", query = "SELECT t FROM TblLocationJoinOo t WHERE t.oo = :oo"),
    @NamedQuery(name = "TblLocationJoinOo.findByLocation", query = "SELECT t FROM TblLocationJoinOo t WHERE t.loc = :loc"),
    @NamedQuery(name = "TblLocationJoinOo.findByObservedObjectAndLocation", query = "SELECT t FROM TblLocationJoinOo t WHERE t.loc = :loc AND t.oo = :oo"),
    @NamedQuery(name = "TblLocationJoinOo.findByValidFrom", query = "SELECT t FROM TblLocationJoinOo t WHERE t.valid_from = :valid_from"),
    @NamedQuery(name = "TblLocationJoinOo.findByValidUntil", query = "SELECT t FROM TblLocationJoinOo t WHERE t.valid_until LIKE :valid_until"),
    @NamedQuery(name = "TblLocationJoinOo.findByValidTime", query = "SELECT t FROM TblLocationJoinOo t WHERE t.valid_from >= :valid_from AND t.valid_until <= :valid_until ORDER BY t.valid_from")
})
@Schema(name="TblLocationJoinOo", description="Connection between observed objects and locations")
public class TblLocationJoinOo implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @Schema(description = "ObservedObject at the location")
    private TblObservedObject oo;
    @OneToOne
    @Schema(description = "ObservedObjects location")
    private TblLocation loc;
    @Schema(description = "Date and time the observedobject starts to be at the location")
    private LocalDateTime valid_from;
    @Schema(description = "Date and time the observedobject ents to be at the location")
    private LocalDateTime valid_until;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TblObservedObject getOo() {
        return oo;
    }

    public void setOo(TblObservedObject oo) {
        this.oo = oo;
    }

    public TblLocation getLoc() {
        return loc;
    }

    public void setLoc(TblLocation loc) {
        this.loc = loc;
    }

    public LocalDateTime getValid_from() {
        return valid_from;
    }

    public void setValid_from(LocalDateTime valid_from) {
        this.valid_from = valid_from;
    }

    public LocalDateTime getValid_until() {
        return valid_until;
    }

    public void setValid_until(LocalDateTime valid_until) {
        this.valid_until = valid_until;
    }
}
