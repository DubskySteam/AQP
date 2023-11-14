/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.smartdata.porter.importer.parser.xlsx;

/**
 *
 * @author cem
 */
public class XLSXHelper {
    public static String getColumn(String cellId)
    {
        if(cellId == null)
            return null;

        return cellId.replaceAll("\\d+", "");
    }

    public static long getRow(String cellId)
    {
        if(cellId == null)
            return -1l;

        return Long.parseLong(cellId.replaceAll("\\D+", ""));
    }
}
