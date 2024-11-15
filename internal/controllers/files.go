package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/Oik17/file-sharing-system/internal/utils"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type S3UploadError struct {
	Stage   string
	Message string
	Err     error
}

func (e *S3UploadError) Error() string {
	return fmt.Sprintf("%s: %s - %v", e.Stage, e.Message, e.Err)
}

func validateConfig() error {
	required := []string{
		"AWS_REGION",
		"AWS_ACCESS_KEY_ID",
		"AWS_SECRET_ACCESS_KEY",
		"AWS_S3_BUCKET",
	}

	for _, key := range required {
		if utils.Config(key) == "" {
			return fmt.Errorf("missing required configuration: %s", key)
		}
	}
	return nil
}

func initAWSSession() (*session.Session, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(utils.Config("AWS_REGION")),
		Credentials: credentials.NewStaticCredentials(
			utils.Config("AWS_ACCESS_KEY_ID"),
			utils.Config("AWS_SECRET_ACCESS_KEY"),
			"",
		),
	})
	if err != nil {
		return nil, &S3UploadError{
			Stage:   "AWS Session Creation",
			Message: "Failed to create AWS session",
			Err:     err,
		}
	}
	return sess, nil
}

func UploadFilesToS3(c echo.Context) error {
	if err := validateConfig(); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"message": "Configuration Error",
			"data":    err.Error(),
			"status":  "false",
		})
	}

	if err := c.Request().ParseMultipartForm(32 << 20); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"status":  "false",
			"message": "Failed to parse multipart form",
			"data":    err.Error(),
		})
	}

	files := c.Request().MultipartForm.File["files"]
	if len(files) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"message": "Validation Error",
			"data":    "No files were provided",
			"status":  "false",
		})
	}

	sess, err := initAWSSession()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"message": "AWS Configuration Error",
			"data":    err.Error(),
			"status":  "false",
		})
	}

	svc := s3.New(sess)
	uploadedFiles := make([]map[string]string, 0, len(files))
	bucket := utils.Config("AWS_S3_BUCKET")

	for _, fileHeader := range files {
		if fileHeader.Size > 10<<20 {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"message": "File Size Error",
				"data":    fmt.Sprintf("File %s exceeds 10MB limit", fileHeader.Filename),
				"status":  "false",
			})
		}

		file, err := fileHeader.Open()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"status":  "false",
				"message": fmt.Sprintf("Failed to open file %s", fileHeader.Filename),
				"data":    err.Error(),
			})
		}
		defer file.Close()

		filename := fmt.Sprintf("%s-%s", uuid.New().String(), fileHeader.Filename)

		input := &s3.PutObjectInput{
			Bucket: aws.String(bucket),
			Key:    aws.String(filename),
			Body:   file,
			Metadata: map[string]*string{
				"OriginalFilename": aws.String(fileHeader.Filename),
				"UploadTimestamp":  aws.String(time.Now().UTC().Format(time.RFC3339)),
			},
		}

		_, err = svc.PutObject(input)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"message": fmt.Sprintf("Failed to upload file %s to S3", fileHeader.Filename),
				"data":    err.Error(),
				"status":  "false",
			})
		}

		req, _ := svc.GetObjectRequest(&s3.GetObjectInput{
			Bucket: aws.String(bucket),
			Key:    aws.String(filename),
		})

		urlStr, err := req.Presign(24 * time.Hour)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"message": fmt.Sprintf("Failed to generate presigned URL for %s", filename),
				"data":    err.Error(),
				"status":  "false",
			})
		}

		uploadedFiles = append(uploadedFiles, map[string]string{
			"filename":     filename,
			"originalName": fileHeader.Filename,
			"url":          urlStr,
			"size":         fmt.Sprintf("%d", fileHeader.Size),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Files uploaded successfully",
		"data":    uploadedFiles,
		"status":  "true",
	})
}
