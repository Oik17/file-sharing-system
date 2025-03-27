package controllers

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/Oik17/file-sharing-system/internal/database"
	"github.com/Oik17/file-sharing-system/internal/models"
	"github.com/Oik17/file-sharing-system/internal/utils"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/lib/pq"
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

	userID, ok := c.Get("user_id").(uuid.UUID)
	if !ok {

		userIDStr := c.FormValue("user_id")
		var err error
		userID, err = uuid.Parse(userIDStr)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"message": "Invalid user ID",
				"data":    err.Error(),
				"status":  "false",
			})
		}
	}

	parentFolderID := c.FormValue("parent_folder_id")

	var parentFolders []string
	var level int64 = 0

	if parentFolderID != "" {
		var parentFolder struct {
			ParentFolders pq.StringArray `json:"parent_folders" db:"parent_folders"` 
			Level         int64          `json:"level" db:"level"`
		}

		err := database.DB.Db.Get(&parentFolder, `
			SELECT COALESCE(parent_folders, ARRAY[]::TEXT[]) AS parent_folders, level 
			FROM files 
			WHERE id = $1 AND user_id = $2 AND is_folder = true`,
			parentFolderID, userID,
		)

		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"message": "Invalid parent folder",
				"data":    err.Error(),
				"status":  "false",
			})
		}

		parentFolders = append(parentFolder.ParentFolders, parentFolderID)

		level = parentFolder.Level + 1
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

		s3Path := fmt.Sprintf("users/%s", userID)
		if len(parentFolders) > 0 {
			s3Path = fmt.Sprintf("%s/folder_%s", s3Path, parentFolders[len(parentFolders)-1])
		}

		uniqueFilename := fmt.Sprintf("%s-%s", uuid.New().String(), fileHeader.Filename)
		s3Key := fmt.Sprintf("%s/%s", s3Path, uniqueFilename)

		input := &s3.PutObjectInput{
			Bucket: aws.String(bucket),
			Key:    aws.String(s3Key),
			Body:   file,
			Metadata: map[string]*string{
				"OriginalFilename": aws.String(fileHeader.Filename),
				"UploadTimestamp":  aws.String(time.Now().UTC().Format(time.RFC3339)),
				"UserID":           aws.String(userID.String()),
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
			Key:    aws.String(s3Key),
		})

		urlStr, err := req.Presign(24 * time.Hour)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"message": fmt.Sprintf("Failed to generate presigned URL for %s", uniqueFilename),
				"data":    err.Error(),
				"status":  "false",
			})
		}

		fileID := uuid.New()

		_, err = database.DB.Db.NamedExec(`
				INSERT INTO files (id, user_id, parent_folders, level, name, file_link, is_folder, created_at, updated_at)
				VALUES (:id, :user_id, :parent_folders, :level, :name, :file_link, :is_folder, :created_at, :updated_at)
			`, map[string]interface{}{
			"id":             fileID,
			"user_id":        userID,
			"parent_folders": pq.Array(parentFolders),
			"level":          level,
			"name":           fileHeader.Filename,
			"file_link":      s3Key,
			"is_folder":      false,
			"created_at":     time.Now().UTC().Format(time.RFC3339),
			"updated_at":     time.Now().UTC().Format(time.RFC3339),
		})

		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"message": "Failed to save file metadata",
				"data":    err.Error(),
				"status":  "false",
			})
		}

		uploadedFiles = append(uploadedFiles, map[string]string{
			"id":           fileID.String(),
			"filename":     uniqueFilename,
			"originalName": fileHeader.Filename,
			"url":          urlStr,
			"size":         fmt.Sprintf("%d", fileHeader.Size),
			"path":         s3Key,
		})
	}

	for _, fileHeader := range files {
		_, err := database.DB.Db.Exec(`
            UPDATE users 
            SET storage_used = storage_used + $1 
            WHERE id = $2
        `, fileHeader.Size, userID)

		if err != nil {

			log.Printf("Failed to update user storage quota: %v", err)
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Files uploaded successfully",
		"data":    uploadedFiles,
		"status":  "true",
	})
}

func ListFilesInFolder(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)
	folderID := c.QueryParam("folder_id")

	var files []models.File
	var query string
	var args []interface{}

	if folderID == "" {

		query = "SELECT * FROM files WHERE user_id = $1 AND array_length(parent_folders, 1) IS NULL ORDER BY is_folder DESC, name ASC"
		args = []interface{}{userID}
	} else {

		query = "SELECT * FROM files WHERE user_id = $1 AND $2 = ANY(parent_folders) AND array_length(parent_folders, 1) > 0 ORDER BY is_folder DESC, name ASC"
		args = []interface{}{userID, folderID}
	}

	err := database.DB.Db.Select(&files, query, args...)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"message": "Failed to list files",
			"data":    err.Error(),
			"status":  "false",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Files retrieved successfully",
		"data":    files,
		"status":  "true",
	})
}

func CreateFolder(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)

	folderName := c.FormValue("folder_name")
	parentFolderID := c.FormValue("parent_folder_id")

	if folderName == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"message": "Folder name is required",
			"status":  "false",
		})
	}

	var parentFolders []string
	var level int64 = 0

	if parentFolderID != "" {
		var parentFolder struct {
			ParentFolders pq.StringArray `json:"parent_folders" db:"parent_folders"` // Correctly use pq.StringArray
			Level         int64          `json:"level" db:"level"`
		}

		err := database.DB.Db.Get(&parentFolder, `
			SELECT COALESCE(parent_folders, ARRAY[]::TEXT[]) AS parent_folders, level 
			FROM files 
			WHERE id = $1 AND user_id = $2 AND is_folder = true`,
			parentFolderID, userID,
		)

		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"message": "Invalid parent folder",
				"data":    err.Error(),
				"status":  "false",
			})
		}

		// No need for sql.NullString checks since pq.StringArray is just []string
		parentFolders = append(parentFolder.ParentFolders, parentFolderID)

		level = parentFolder.Level + 1
	}
	log.Println(level)
	folderID := uuid.New()
	_, err := database.DB.Db.NamedExec(`
    INSERT INTO files (id, user_id, parent_folders, level, name, is_folder, created_at, updated_at)
    VALUES (:id, :user_id, :parent_folders, :level, :name, :is_folder, :created_at, :updated_at)
`, map[string]interface{}{
		"id":             folderID,
		"user_id":        userID,
		"parent_folders": pq.Array(parentFolders),
		"level":          level,
		"name":           folderName,
		"is_folder":      true,
		"created_at":     time.Now().UTC().Format(time.RFC3339),
		"updated_at":     time.Now().UTC().Format(time.RFC3339),
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"message": "Failed to create folder",
			"data":    err.Error(),
			"status":  "false",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Folder created successfully",
		"data": map[string]string{
			"id":   folderID.String(),
			"name": folderName,
		},
		"status": "true",
	})
}
