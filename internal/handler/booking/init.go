package booking

import (
	"context"

	base "github.com/SangBejoo/Template/gen/proto"
)

type BookingHandler interface {
	GetSummary(ctx context.Context, req *base.GetSummaryRequest) (*base.BookingSummaryResponse, error)
}
