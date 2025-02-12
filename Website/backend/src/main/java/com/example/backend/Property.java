package com.example.backend;

public class Property {
    private int id;
    private String title;
    private String location;
    private String price;
    private String area;
    private String type;
    private String image;

    // Constructor
    public Property(int id, String title, String location, String price, String area, String type, String image) {
        this.id = id;
        this.title = title;
        this.location = location;
        this.price = price;
        this.area = area;
        this.type = type;
        this.image = image;
    }

    // Getters and setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
