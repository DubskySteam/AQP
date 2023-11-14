package de.smartdata.porter.importer.parser.kennlinien;

import de.smartdata.porter.importer.dataset.DataSet;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DataSet for storing pv kennlinien data.
 *
 * @author Florian Fehring
 */
public class KennlinienDataSet extends DataSet {
    
    private boolean indexUI;
    private LocalDateTime ts;
    private int mesurementno;
    private double ff;
    private double rds;
    private double uf;
    private String kind; // Kind of kennlinie (bright / dark)
    private final List<Double> us = new ArrayList<>();
    private final List<Double> is = new ArrayList<>();

    public KennlinienDataSet(boolean indexUI) {
        super();
        this.indexUI = indexUI;
    }
    
    public void setTs(LocalDateTime ts) {
        this.ts = ts;
    }

    public LocalDateTime getTs() {
        return ts;
    }

    public void setMesurementno(int mesurementno) {
        this.mesurementno = mesurementno;
    }

    public int getMeasurementno() {
        return this.mesurementno;
    }

    public void setFf(double ff) {
        this.ff = ff;
    }

    public double getFf() {
        return this.ff;
    }

    public void setRds(double rds) {
        this.rds = rds;
    }

    public double getRds() {
        return this.rds;
    }

    public void setUf(double uf) {
        this.uf = uf;
    }

    public double getUf() {
        return this.uf;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public String getKind() {
        return this.kind;
    }
    
    /**
     * Add an measurement
     *
     * @param u U value
     * @param i I value
     */
    public void addMeasurement(Double u, Double i) {
        this.us.add(u);
        this.is.add(i);
    }

    public boolean hasMeasurements() {
        return this.us.size() > 0 || this.is.size() > 0;
    }
    
    @Override
    public JsonObject toJson() {
        JsonObjectBuilder job = Json.createObjectBuilder();
        job.add("ts", this.ts.toString());
        job.add("mesurementno", this.mesurementno);
        job.add("ff", this.ff);
        job.add("rds", this.rds);
        job.add("uf", this.uf);
        job.add("kind", this.kind);
        if (indexUI) {
            for (int i = 0; i < us.size(); i++) {
                job.add("U" + i, us.get(i));
                job.add("I" + i, is.get(i));
            }
        } else {
            job.add("current", is.get(0));
            job.add("voltage", us.get(0));
        }
        return job.build();
    }
}
