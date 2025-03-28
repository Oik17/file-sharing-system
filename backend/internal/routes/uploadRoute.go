package routes

import (
	"github.com/Oik17/file-sharing-system/internal/controllers"
	"github.com/Oik17/file-sharing-system/internal/middleware"
	"github.com/labstack/echo/v4"
)

func UploadRoutes(e *echo.Echo) {
	// e.Use(middleware.Protected)
	// e.POST("/upload", controllers.UploadFilesToS3)
	e.POST("/upload", controllers.UploadFilesToS3, middleware.Protected)
	e.GET("/files/get", controllers.ListFilesInFolder, middleware.Protected)
	e.POST("/files/createFolder", controllers.CreateFolder, middleware.Protected)
	e.GET("/files/getFolder", controllers.ListUserFolders, middleware.Protected)
}
