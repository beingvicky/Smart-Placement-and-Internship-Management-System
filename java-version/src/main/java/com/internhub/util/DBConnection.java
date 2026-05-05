package com.internhub.util;

import java.sql.*;

/**
 * DBConnection – Singleton database connection utility
 * Uses JDBC to connect to MySQL
 * Configure credentials in db.properties
 */
public class DBConnection {
    // ── Change these for your local MySQL setup ──────────────
    private static final String URL      = "jdbc:mysql://localhost:3306/internhub_db?useSSL=false&serverTimezone=UTC";
    private static final String USERNAME = "root";
    private static final String PASSWORD = "";  // ← Your MySQL password
    // ─────────────────────────────────────────────────────────

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("MySQL JDBC Driver not found. Add mysql-connector-java to pom.xml", e);
        }
    }

    /**
     * Get a fresh connection from DriverManager
     * For production: switch to a connection pool (HikariCP or c3p0)
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USERNAME, PASSWORD);
    }

    /**
     * Close connection, statement, and result set safely
     */
    public static void close(Connection conn, PreparedStatement ps, ResultSet rs) {
        try { if (rs   != null) rs.close();   } catch (SQLException e) { e.printStackTrace(); }
        try { if (ps   != null) ps.close();   } catch (SQLException e) { e.printStackTrace(); }
        try { if (conn != null) conn.close(); } catch (SQLException e) { e.printStackTrace(); }
    }
}
