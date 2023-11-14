/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.fhbielefeld.scl.reflection.packages;

/**
 *
 * @author ffehring
 */
public class PackageReflectionException extends Exception {

    /**
     * Creates a new instance of <code>PackageReflectionException</code> without
     * detail message.
     */
    public PackageReflectionException() {
    }

    /**
     * Constructs an instance of <code>PackageReflectionException</code> with
     * the specified detail message.
     *
     * @param msg the detail message.
     */
    public PackageReflectionException(String msg) {
        super(msg);
    }
}
