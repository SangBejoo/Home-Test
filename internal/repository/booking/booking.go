package booking

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/SangBejoo/Template/internal/entity"
)

type bookingRepository struct {
	client *http.Client
}

func NewBookingRepository() entity.BookingRepository {
	return &bookingRepository{client: &http.Client{}}
}

func (r *bookingRepository) GetBookings(ctx context.Context) ([]*entity.Booking, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", "https://66876cc30bc7155dc017a662.mockapi.io/api/dummy-data/bookingList", nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var bookings []*entity.Booking
	err = json.NewDecoder(resp.Body).Decode(&bookings)
	if err != nil {
		return nil, err
	}
	return bookings, nil
}

func (r *bookingRepository) GetConsumptionMasters(ctx context.Context) ([]*entity.ConsumptionMaster, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", "https://6686cb5583c983911b03a7f3.mockapi.io/api/dummy-data/masterJenisKonsumsi", nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var consumptions []*entity.ConsumptionMaster
	err = json.NewDecoder(resp.Body).Decode(&consumptions)
	if err != nil {
		return nil, err
	}
	return consumptions, nil
}
