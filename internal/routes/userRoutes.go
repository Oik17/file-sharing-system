package routes

import (
	"github.com/Oik17/file-sharing-system/internal/controllers"
	"github.com/labstack/echo/v4"
)

func UserRoutes(e *echo.Echo) {
	e.GET("/login", controllers.HandleLogin)
	e.GET("/callback", controllers.HandleCallback)

}
