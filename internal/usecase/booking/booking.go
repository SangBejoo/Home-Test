package booking

import (
	"context"
	"sort"
	"strings"
	"time"

	base "github.com/SangBejoo/Template/gen/proto"
	"github.com/SangBejoo/Template/internal/entity"
)

type roomData struct {
	summary        *RoomSummary
	minBookingDate time.Time
	maxBookingDate time.Time
	minStartTime   time.Time
	maxEndTime     time.Time
}

type bookingUseCase struct {
	repo entity.BookingRepository
}

func NewBookingUseCase(repo entity.BookingRepository) BookingUseCase {
	return &bookingUseCase{repo: repo}
}

func (u *bookingUseCase) GetSummary(ctx context.Context, req *base.GetSummaryRequest) (*BookingSummary, error) {
	bookings, err := u.repo.GetBookings(ctx)
	if err != nil {
		return nil, err
	}

	consumptions, err := u.repo.GetConsumptionMasters(ctx)
	if err != nil {
		return nil, err
	}

	// Create a map for consumption maxPrice
	priceMap := make(map[string]int)
	for _, c := range consumptions {
		priceMap[c.Name] = c.MaxPrice
	}

	// Filter by date if provided
	filteredBookings := bookings
	if req.StartDate != "" || req.EndDate != "" {
		filteredBookings = []*entity.Booking{}
		for _, b := range bookings {
			include := true
			if req.StartDate != "" {
				if b.BookingDate.Before(parseDate(req.StartDate)) {
					include = false
				}
			}
			if req.EndDate != "" {
				if b.BookingDate.After(parseDate(req.EndDate)) {
					include = false
				}
			}
			if include {
				filteredBookings = append(filteredBookings, b)
			}
		}
	}

	// Process summary with filtered bookings
	totalBookings := len(filteredBookings)
	totalParticipants := 0
	officeMap := make(map[string]map[string]*roomData) // office -> room -> roomData

	for _, b := range filteredBookings {
		totalParticipants += b.Participants

		// Filter out generic office names
		if strings.HasPrefix(b.OfficeName, "officeName ") {
			continue
		}
		// Filter out generic room names
		if strings.HasPrefix(b.RoomName, "roomName ") {
			continue
		}

		if officeMap[b.OfficeName] == nil {
			officeMap[b.OfficeName] = make(map[string]*roomData)
		}
		if officeMap[b.OfficeName][b.RoomName] == nil {
			officeMap[b.OfficeName][b.RoomName] = &roomData{
				summary: &RoomSummary{
					RoomName:     b.RoomName,
					Consumptions: []*ConsumptionSummary{},
				},
				minBookingDate: b.BookingDate,
				maxBookingDate: b.BookingDate,
				minStartTime:   b.StartTime,
				maxEndTime:     b.EndTime,
			}
		}
		room := officeMap[b.OfficeName][b.RoomName]
		room.summary.BookingCount++
		room.summary.TotalParticipants += b.Participants

		// Update min/max dates
		if b.BookingDate.Before(room.minBookingDate) {
			room.minBookingDate = b.BookingDate
		}
		if b.BookingDate.After(room.maxBookingDate) {
			room.maxBookingDate = b.BookingDate
		}
		if b.StartTime.Before(room.minStartTime) {
			room.minStartTime = b.StartTime
		}
		if b.EndTime.After(room.maxEndTime) {
			room.maxEndTime = b.EndTime
		}

		consMap := make(map[string]*ConsumptionSummary)
		for _, cons := range room.summary.Consumptions {
			consMap[cons.ConsumptionName] = cons
		}
		for _, c := range b.ListConsumption {
			if consMap[c.Name] == nil {
				newCons := &ConsumptionSummary{ConsumptionName: c.Name}
				consMap[c.Name] = newCons
				room.summary.Consumptions = append(room.summary.Consumptions, newCons)
			}
			consMap[c.Name].Count++
			if maxPrice, exists := priceMap[c.Name]; exists {
				consMap[c.Name].TotalCost += maxPrice * b.Participants
			}
		}
		// Update the room in map
		officeMap[b.OfficeName][b.RoomName] = room
	}

	var offices []OfficeSummary
	for officeName, roomMap := range officeMap {
		var rooms []RoomSummary
		for _, room := range roomMap {
			// Sort consumptions by count descending
			sort.Slice(room.summary.Consumptions, func(i, j int) bool {
				return room.summary.Consumptions[i].Count > room.summary.Consumptions[j].Count
			})
			// Set date strings
			room.summary.BookingStartDate = room.minBookingDate.Format("2006-01-02")
			room.summary.BookingEndDate = room.maxBookingDate.Format("2006-01-02")
			room.summary.StartTime = room.minStartTime.Format(time.RFC3339)
			room.summary.EndTime = room.maxEndTime.Format(time.RFC3339)
			rooms = append(rooms, *room.summary)
		}
		// Sort rooms by bookingCount descending
		sort.Slice(rooms, func(i, j int) bool {
			return rooms[i].BookingCount > rooms[j].BookingCount
		})
		offices = append(offices, OfficeSummary{
			OfficeName: officeName,
			Rooms:      rooms,
		})
	}
	// Sort offices by total rooms or something, but since no bookingCount per office, maybe by name or leave as is
	sort.Slice(offices, func(i, j int) bool {
		return offices[i].OfficeName < offices[j].OfficeName // alphabetical
	})

	return &BookingSummary{
		TotalBookings:     totalBookings,
		TotalParticipants: totalParticipants,
		Offices:           offices,
		StartDate:         req.StartDate,
		EndDate:           req.EndDate,
	}, nil
}

func parseDate(dateStr string) time.Time {
	t, _ := time.Parse("2006-01-02", dateStr)
	return t
}
