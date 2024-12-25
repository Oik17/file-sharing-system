package controllers

import (
	"log"
	"net/http"

	"github.com/Oik17/file-sharing-system/internal/utils"
	"github.com/labstack/echo/v4"
)

// type Cloudinary struct {
// 	Config config.Configuration
// 	Admin  admin.API
// 	Upload uploader.API
// 	Logger *logger.Logger
// }

func UploadToCloudinary(c echo.Context) error {
	var cld, err = utils.CloudinaryInit()
	if err != nil {
		log.Fatalf("Failed to intialize Cloudinary, %v", err)
	}
	log.Printf("Cloudinary initialized, %v", cld)

	// resp, err := cld.Upload.Upload(c, file, uploader.UploadParams{})
	// if err != nil {
	// 	log.Fatalf("Failed to upload file to Cloudinary, %v", err)
	// }
	// log.Printf("File uploaded to Cloudinary, %v", resp)
	return c.JSON(http.StatusAccepted, map[string]interface{}{
		"message": "File uploaded to Cloudinary",
		"data":    "resp",
		"status":  true,
	})
}
