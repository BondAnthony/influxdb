package http_test

import (
	"context"
	"net/http/httptest"
	"testing"

	platform "github.com/influxdata/influxdb"
	"github.com/influxdata/influxdb/http"
	"github.com/influxdata/influxdb/inmem"
	_ "github.com/influxdata/influxdb/query/builtin"
	"github.com/influxdata/influxdb/task"
	"github.com/influxdata/influxdb/task/backend"
	tmock "github.com/influxdata/influxdb/task/mock"
	"github.com/influxdata/influxdb/task/servicetest"
)

func httpTaskServiceFactory(t *testing.T) (*servicetest.System, context.CancelFunc) {
	store := backend.NewInMemStore()
	rrw := backend.NewInMemRunReaderWriter()
	sch := tmock.NewScheduler()

	ctx, cancel := context.WithCancel(context.Background())

	i := inmem.NewService()

	backingTS := task.PlatformAdapter(store, rrw, sch, i, i, i)

	h := http.NewAuthenticationHandler()
	h.AuthorizationService = i
	th := http.NewTaskHandler(http.NewMockTaskBackend(t))
	th.TaskService = backingTS
	th.AuthorizationService = i
	th.OrganizationService = i
	th.UserService = i
	th.UserResourceMappingService = i
	h.Handler = th

	org := &platform.Organization{Name: t.Name() + "_org"}
	if err := i.CreateOrganization(ctx, org); err != nil {
		t.Fatal(err)
	}
	user := &platform.User{Name: t.Name() + "_user"}
	if err := i.CreateUser(ctx, user); err != nil {
		t.Fatal(err)
	}
	auth := platform.Authorization{UserID: user.ID, OrgID: org.ID}
	if err := i.CreateAuthorization(ctx, &auth); err != nil {
		t.Fatal(err)
	}

	server := httptest.NewServer(h)
	go func() {
		<-ctx.Done()
		server.Close()
	}()

	tsFunc := func() platform.TaskService {
		return http.TaskService{
			Addr:  server.URL,
			Token: auth.Token,
		}
	}

	cFunc := func() (servicetest.TestCreds, error) {
		return servicetest.TestCreds{
			OrgID:           org.ID,
			Org:             org.Name,
			UserID:          user.ID,
			AuthorizationID: auth.ID,
			Token:           auth.Token,
		}, nil
	}

	return &servicetest.System{
		S:               store,
		LR:              rrw,
		LW:              rrw,
		I:               i,
		Ctx:             ctx,
		TaskServiceFunc: tsFunc,
		CredsFunc:       cFunc,
	}, cancel
}

func TestTaskService(t *testing.T) {
	t.Parallel()

	servicetest.TestTaskService(t, httpTaskServiceFactory)
}
