package com.internhub.model;

import java.sql.Timestamp;

/**
 * Internship model - represents an internship posting
 * Maps to 'internships' table
 */
public class Internship {
    private int id;
    private String title;
    private String company;
    private String location;
    private int stipend;
    private String duration;
    private String domain;
    private String description;
    private String requirements;
    private int openings;
    private String status;
    private int postedBy;
    private Timestamp createdAt;

    public Internship() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public int getStipend() { return stipend; }
    public void setStipend(int stipend) { this.stipend = stipend; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }

    public int getOpenings() { return openings; }
    public void setOpenings(int openings) { this.openings = openings; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getPostedBy() { return postedBy; }
    public void setPostedBy(int postedBy) { this.postedBy = postedBy; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public String getFormattedStipend() {
        return stipend > 0 ? "₹" + String.format("%,d", stipend) + "/month" : "Unpaid";
    }
}
