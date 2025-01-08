package controllers

import (
	"log"
	"net/http"

	"github.com/Oik17/file-sharing-system/internal/utils"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/labstack/echo/v4"
)

// type Cloudinary struct {
// 	Config config.Configuration
// 	Admin  admin.API
// 	Upload uploader.API
// 	Logger *logger.Logger
// }

func UploadToCloudinary(c echo.Context) error {
	cld, err := utils.CloudinaryInit()
	if err != nil {
		log.Printf("Failed to initialize Cloudinary: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"message": "Failed to initialize cloud storage",
			"error":   err.Error(),
			"status":  false,
		})
	}

	file, err := c.FormFile("file")
	if err != nil {
		log.Printf("Failed to get file from request: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"message": "Failed to process file",
			"error":   err.Error(),
			"status":  false,
		})
	}

	src, err := file.Open()
	if err != nil {
		log.Printf("Failed to open file: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"message": "Failed to process file",
			"error":   err.Error(),
			"status":  false,
		})
	}
	defer src.Close()

	uploadParams := uploader.UploadParams{
		Folder:         "file-sharing-system",
		AllowedFormats: []string{"jpg", "png", "pdf", "doc", "docx", "xls", "xlsx"},
		ResourceType:   "auto",
	}

	result, err := cld.Upload.Upload(c.Request().Context(), src, uploadParams)
	if err != nil {
		log.Printf("Failed to upload file to Cloudinary: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"message": "Failed to upload file to cloud storage",
			"error":   err.Error(),
			"status":  false,
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "File uploaded successfully",
		"data": map[string]interface{}{
			"url":          result.SecureURL,
			"resourceType": result.ResourceType,
			"format":       result.Format,
			"size":         result.Bytes,
			"fileName":     file.Filename,
		},
		"status": true,
	})
}
