package booking

import (
	"context"

	"github.com/SangBejoo/Template/internal/entity"
)

type BookingRepository interface {
	GetBookings(ctx context.Context) ([]*entity.Booking, error)
	GetConsumptionMasters(ctx context.Context) ([]*entity.ConsumptionMaster, error)
}
