package main

import (
	"html/template"
	"io"
	"net/http"

	"github.com/Oik17/file-sharing-system/internal/database"
	"github.com/Oik17/file-sharing-system/internal/routes"
	"github.com/Oik17/file-sharing-system/internal/utils"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Template struct {
	templates *template.Template
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

func main() {
	database.Connect()
	e := echo.New()

	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: `{"time":"${time_custom}","remote_ip":"${remote_ip}",` +
			`"host":"${host}","method":"${method}","uri":"${uri}","user_agent":"${user_agent}",` +
			`"status":${status},"error":"${error}","latency":${latency},"latency_human":"${latency_human}"}` + "\n",
		CustomTimeFormat: "02/01/2006 15:04:05",
	}))

	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	e.GET("/ping", func(c echo.Context) error {
		return c.String(http.StatusOK, "pong")
	})

	e.Renderer = utils.InitHTMLTemplate(e)

	e.GET("/", func(c echo.Context) error {
		return c.Render(http.StatusOK, "render.html", map[string]interface{}{
			"title": "Welcome to Echo",
		})
	})

	routes.UserRoutes(e)
	routes.RandomRoutes(e)
	e.Start(":8080")
}
