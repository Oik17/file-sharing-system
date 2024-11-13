package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID             uuid.UUID `json:"id" db:"id"`
	Email          string    `json:"email" db:"email"`
	Username       string    `json:"username" db:"username"`
	ProfilePicture string    `json:"profile_picture" db:"profile_picture"`
	VerifiedEmail  bool      `json:"verified_email" db:"verified_email"`
	Files          []string  `json:"files" db:"files"`
	StorageQuota   int64     `json:"storage_quota" db:"storage_quota"` // in bytes
	StorageUsed    int64     `json:"storage_used" db:"storage_used"`   // in bytes
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
	AccessToken    string    `json:"access_token" db:"access_token"`
	RefreshToken   string    `json:"refresh_token" db:"refresh_token"`
}
