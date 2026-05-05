package com.internhub.dao;

import com.internhub.model.User;
import com.internhub.util.DBConnection;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * UserDAO - Data Access Object for User operations
 * Uses JDBC with PreparedStatement for all queries (SQL injection safe)
 */
public class UserDAO {

    /**
     * Register a new student user
     * @return newly created User or null if email already exists
     */
    public User register(String name, String email, String password, 
                          String phone, String college, Double cgpa, String skills) throws SQLException {
        String sql = "INSERT INTO users (name, email, password, role, phone, college, cgpa, skills) VALUES (?, ?, ?, 'student', ?, ?, ?, ?)";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt(10));
            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, hashedPassword);
            ps.setString(4, phone);
            ps.setString(5, college);
            if (cgpa != null) ps.setDouble(6, cgpa); else ps.setNull(6, Types.DECIMAL);
            ps.setString(7, skills);
            
            int rows = ps.executeUpdate();
            if (rows == 0) return null;
            
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return findById(keys.getInt(1));
            }
        }
        return null;
    }

    /**
     * Authenticate user by email + password
     * @return User if credentials match, null otherwise
     */
    public User authenticate(String email, String password) throws SQLException {
        String sql = "SELECT * FROM users WHERE email = ?";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    String storedHash = rs.getString("password");
                    if (BCrypt.checkpw(password, storedHash)) {
                        return mapUser(rs);
                    }
                }
            }
        }
        return null;
    }

    /**
     * Find user by ID
     */
    public User findById(int id) throws SQLException {
        String sql = "SELECT * FROM users WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapUser(rs);
            }
        }
        return null;
    }

    /**
     * Check if email already exists
     */
    public boolean emailExists(String email) throws SQLException {
        String sql = "SELECT id FROM users WHERE email = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    /**
     * Get all student users with pagination
     */
    public List<User> getAllStudents(int page, int pageSize) throws SQLException {
        String sql = "SELECT * FROM users WHERE role = 'student' ORDER BY created_at DESC LIMIT ? OFFSET ?";
        List<User> users = new ArrayList<>();
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, pageSize);
            ps.setInt(2, (page - 1) * pageSize);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) users.add(mapUser(rs));
            }
        }
        return users;
    }

    /**
     * Count total students
     */
    public int countStudents() throws SQLException {
        String sql = "SELECT COUNT(*) FROM users WHERE role = 'student'";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    /**
     * Update user profile
     */
    public void updateProfile(int userId, String name, String phone, String college, Double cgpa, String skills) throws SQLException {
        String sql = "UPDATE users SET name=?, phone=?, college=?, cgpa=?, skills=? WHERE id=?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, name);
            ps.setString(2, phone);
            ps.setString(3, college);
            if (cgpa != null) ps.setDouble(4, cgpa); else ps.setNull(4, Types.DECIMAL);
            ps.setString(5, skills);
            ps.setInt(6, userId);
            ps.executeUpdate();
        }
    }

    /**
     * Map ResultSet to User object
     */
    private User mapUser(ResultSet rs) throws SQLException {
        User u = new User();
        u.setId(rs.getInt("id"));
        u.setName(rs.getString("name"));
        u.setEmail(rs.getString("email"));
        u.setPassword(rs.getString("password"));
        u.setRole(rs.getString("role"));
        u.setPhone(rs.getString("phone"));
        u.setCollege(rs.getString("college"));
        double cgpa = rs.getDouble("cgpa");
        if (!rs.wasNull()) u.setCgpa(cgpa);
        u.setSkills(rs.getString("skills"));
        u.setCreatedAt(rs.getTimestamp("created_at"));
        return u;
    }
}
