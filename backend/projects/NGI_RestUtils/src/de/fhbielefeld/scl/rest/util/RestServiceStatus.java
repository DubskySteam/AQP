/*
 * Copyright (c) Klaus Schlender to Present.
 * All rights reserved.
 */
package de.fhbielefeld.scl.rest.util;

/**
 *
 * @author Klaus Schlender <webapps@klausschlender.com>
 */
public class RestServiceStatus {
    
    //is the service active and still in progress
    private boolean aktiv;
    //whole content todo
    private int todo;
    //already done content
    private int done;

    public RestServiceStatus(){
        this.aktiv = false;
        this.todo = 0;
        this.done = 0;
    }
    
    public RestServiceStatus(boolean aktiv, int todo, int done) {
        this.aktiv = aktiv;
        this.todo = todo;
        this.done = done;
    }
    
    public RestServiceStatus(boolean aktiv, int todo) {
        this.aktiv = aktiv;
        this.todo = todo;
        this.done = 0;
    }
    
    public boolean isAktiv() {
        return aktiv;
    }

    public void setAktiv(boolean aktiv) {
        this.aktiv = aktiv;
    }

    public int getTodo() {
        return todo;
    }

    public void setTodo(int todo) {
        this.todo = todo;
    }

    public int getDone() {
        return done;
    }

    public void setDone(int done) {
        this.done = done;
    }
    
    public int getProgressInPercent() {
        //Calculate percentage of progress
        if(!this.aktiv || todo==0){
        return 100;//not active and todo 0, than complete
        }else{
        int progress = done*100/todo;
        return progress;
        }
    }
        
}
