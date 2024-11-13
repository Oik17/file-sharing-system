package main

import (
	"net/http"

	"github.com/Oik17/file-sharing-system/internal/controllers"
	"github.com/Oik17/file-sharing-system/internal/database"
	"github.com/labstack/echo/v4"
)

func main() {
	database.Connect()
	e := echo.New()
	e.GET("/", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"message": "Hello, Echo!"})
	})

	e.GET("/login", controllers.HandleLogin)
	e.GET("/callback", controllers.HandleCallback)
	e.Start(":8080")
}
