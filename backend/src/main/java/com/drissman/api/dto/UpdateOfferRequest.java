package com.drissman.api.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class UpdateOfferRequest {
    private String name;
    private String description;
    private Integer price;
    private Integer hours;
    private Boolean active;
}
