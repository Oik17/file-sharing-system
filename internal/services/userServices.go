package services

import (
	"database/sql"

	"github.com/Oik17/file-sharing-system/internal/database"
	"github.com/Oik17/file-sharing-system/internal/models"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

func CreateOrUpdateUser(userInfo map[string]interface{}) (models.User, error) {
	db := database.DB.Db

	email, _ := userInfo["email"].(string)
	accessToken, _ := userInfo["access_token"].(string)

	var existingUser models.User
	err := db.QueryRow(`SELECT * FROM users WHERE email = $1`, email).Scan(
		&existingUser.ID,
		&existingUser.Username,
		&existingUser.Email,
		&existingUser.ProfilePicture,
		&existingUser.VerifiedEmail,
		pq.Array(&existingUser.Files),
		&existingUser.StorageQuota,
		&existingUser.StorageUsed,
		&existingUser.CreatedAt,
		&existingUser.UpdatedAt,
		&existingUser.AccessToken,
		&existingUser.RefreshToken, 
	)
	if err == nil {
		existingUser.AccessToken = accessToken
		_, err = db.Exec(`UPDATE users SET access_token = $1 WHERE email = $2`, accessToken, email)

		if err != nil {
			return models.User{}, err
		}

		return existingUser, nil
	}

	if err != nil && err != sql.ErrNoRows {
		return models.User{}, err
	}

	return createUser(userInfo)
}

func createUser(userInfo map[string]interface{}) (models.User, error) {
	db := database.DB.Db

	id := uuid.New()
	name, _ := userInfo["name"].(string)
	email, _ := userInfo["email"].(string)
	profilePicture, _ := userInfo["picture"].(string)
	isVerified, _ := userInfo["verified_email"].(bool)
	accessToken, _ := userInfo["access_token"].(string)

	var user models.User
	err := db.QueryRow(`INSERT INTO users (id, username, email, profile_picture, verified_email, access_token) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
		id, name, email, profilePicture, isVerified, accessToken).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.ProfilePicture,
		&user.VerifiedEmail,
		pq.Array(&user.Files),
		&user.StorageQuota,
		&user.StorageUsed,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.AccessToken,
		&user.RefreshToken, 
	)
	if err != nil {
		return models.User{}, err
	}

	return user, nil
}
