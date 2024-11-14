package routes

import (
	"github.com/Oik17/file-sharing-system/internal/controllers"
	"github.com/labstack/echo/v4"
)

func RandomRoutes(e *echo.Echo) {

	e.POST("/upload", controllers.UploadFilesToS3)
}
