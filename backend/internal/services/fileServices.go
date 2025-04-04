package services

import "github.com/Oik17/file-sharing-system/internal/database"

func GetFileByCode(code string) (string, error) {
	db := database.DB.Db
	query := `SELECT file_link FROM files WHERE share_link=$1`
	var fileURL string
	err := db.Get(&fileURL, query, code)
	if err != nil {
		return "", err
	}
	return fileURL, nil

}
