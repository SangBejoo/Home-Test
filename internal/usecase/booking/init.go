package booking

import (
	"context"

	base "github.com/SangBejoo/Template/gen/proto"
)

type BookingUseCase interface {
	GetSummary(ctx context.Context, req *base.GetSummaryRequest) (*BookingSummary, error)
}

type BookingSummary struct {
	TotalBookings     int
	TotalParticipants int
	Offices           []OfficeSummary
	StartDate         string
	EndDate           string
}

type OfficeSummary struct {
	OfficeName string
	Rooms      []RoomSummary
}

type RoomSummary struct {
	RoomName          string
	BookingCount      int
	TotalParticipants int
	Consumptions      []*ConsumptionSummary
	BookingStartDate  string
	BookingEndDate    string
	StartTime         string
	EndTime           string
}

type ConsumptionSummary struct {
	ConsumptionName string
	Count           int
	TotalCost       int
}
