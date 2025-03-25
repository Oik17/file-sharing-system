package routes

import (
	"github.com/Oik17/file-sharing-system/internal/controllers"
	"github.com/Oik17/file-sharing-system/internal/middleware"
	"github.com/labstack/echo/v4"
)

func RandomRoutes(e *echo.Echo) {
	// e.Use(middleware.Protected)
	// e.POST("/upload", controllers.UploadFilesToS3)
	e.POST("/upload", controllers.UploadFilesToS3, middleware.Protected)

}
