package models

import "github.com/google/uuid"

type File struct {
	ID            uuid.UUID `json:"id" db:"id"`
	UserID        uuid.UUID `json:"user_id" db:"user_id"`
	ParentFolders []string  `json:"parent_folders" db:"parent_folders"`
	Level         int64     `json:"level" db:"level"` //File level in the folder hierarchy
	Name          string    `json:"name" db:"name"`
	FileLink      string    `json:"file_link" db:"file_link"` //S3 Link
	IsFolder      bool      `json:"is_folder" db:"is_folder"`
	IsStarred     bool      `json:"is_starred" db:"is_starred"`
	CreatedAt     string    `json:"created_at" db:"created_at"`
	UpdatedAt     string    `json:"updated_at" db:"updated_at"`
}
