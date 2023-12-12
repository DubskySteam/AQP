package de.hsbi.smartsocial.Config;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Author: Clemens Maas
 * Date: 2023/11/30
 */
@WebServlet("/swagger-ui/*")
public class SwaggerConfig extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.getRequestDispatcher("/webjars/swagger-ui/5.9.0/index.html").forward(req, resp);
    }

}
