package dependency

import (
	"github.com/SangBejoo/Template/init/infra"
	"google.golang.org/grpc"

	base "github.com/SangBejoo/Template/gen/proto"
	baseGrpcServer "github.com/SangBejoo/Template/internal/handler/base"
	bookingGrpcHandler "github.com/SangBejoo/Template/internal/handler/booking"
	bookingRepository "github.com/SangBejoo/Template/internal/repository/booking"
	bookingUseCase "github.com/SangBejoo/Template/internal/usecase/booking"
)

func InitGrpcDependency(server *grpc.Server, repo infra.Repository) {
	baseServer := baseGrpcServer.NewBaseHandler()
	base.RegisterBaseServer(server, baseServer)
	bookingRepo := bookingRepository.NewBookingRepository()
	bookingUC := bookingUseCase.NewBookingUseCase(bookingRepo)
	bookingServer := bookingGrpcHandler.NewBookingHandler(bookingUC)
	base.RegisterBookingServer(server, bookingServer)
}
