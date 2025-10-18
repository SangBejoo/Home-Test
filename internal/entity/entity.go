package entity

import (
	"context"
	"time"
)

type Note struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

type Booking struct {
	ID              string        `json:"id"`
	BookingDate     time.Time     `json:"bookingDate"`
	OfficeName      string        `json:"officeName"`
	StartTime       time.Time     `json:"startTime"`
	EndTime         time.Time     `json:"endTime"`
	ListConsumption []Consumption `json:"listConsumption"`
	Participants    int           `json:"participants"`
	RoomName        string        `json:"roomName"`
}

type Consumption struct {
	Name string `json:"name"`
}

type ConsumptionMaster struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	Name      string    `json:"name"`
	MaxPrice  int       `json:"maxPrice"`
}

type BookingRepository interface {
	GetBookings(ctx context.Context) ([]*Booking, error)
	GetConsumptionMasters(ctx context.Context) ([]*ConsumptionMaster, error)
}
