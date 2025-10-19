package booking

import (
	"context"

	base "github.com/SangBejoo/Template/gen/proto"
	"github.com/SangBejoo/Template/internal/usecase/booking"
)

type bookingGRPCHandler struct {
	base.UnimplementedBookingServer
	usecase booking.BookingUseCase
}

func NewBookingHandler(usecase booking.BookingUseCase) *bookingGRPCHandler {
	return &bookingGRPCHandler{usecase: usecase}
}

func (h *bookingGRPCHandler) GetSummary(ctx context.Context, req *base.GetSummaryRequest) (*base.BookingSummaryResponse, error) {
	// Call usecase to get summary
	summary, err := h.usecase.GetSummary(ctx, req)
	if err != nil {
		return nil, err
	}
	// Convert to proto
	var offices []*base.OfficeSummary
	for _, o := range summary.Offices {
		var rooms []*base.RoomSummary
		for _, r := range o.Rooms {
			var consumptions []*base.ConsumptionSummary
			for _, c := range r.Consumptions {
				consumptions = append(consumptions, &base.ConsumptionSummary{
					ConsumptionName: c.ConsumptionName,
					OrderCount:      int32(c.OrderCount),
					TotalPortions:   int32(c.TotalPortions),
					PricePerPortion: int32(c.PricePerPortion),
					TotalCost:       int32(c.TotalCost),
				})
			}
			rooms = append(rooms, &base.RoomSummary{
				RoomName:          r.RoomName,
				BookingCount:      int32(r.BookingCount),
				TotalParticipants: int32(r.TotalParticipants),
				Consumptions:      consumptions,
				BookingStartDate:  r.BookingStartDate,
				BookingEndDate:    r.BookingEndDate,
				StartTime:         r.StartTime,
				EndTime:           r.EndTime,
			})
		}
		offices = append(offices, &base.OfficeSummary{
			OfficeName: o.OfficeName,
			Rooms:      rooms,
		})
	}
	return &base.BookingSummaryResponse{
		TotalBookings:     int32(summary.TotalBookings),
		TotalParticipants: int32(summary.TotalParticipants),
		Offices:           offices,
		StartDate:         summary.StartDate,
		EndDate:           summary.EndDate,
	}, nil
}
