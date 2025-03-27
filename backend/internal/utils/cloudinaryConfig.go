package utils

import (
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
)

func CloudinaryInit() (*cloudinary.Cloudinary, error) {
	cld, err := cloudinary.NewFromParams(
		os.Getenv("CLOUDINARY_CLOUD_NAME"),
		os.Getenv("CLOUDINARY_API_KEY"),
		os.Getenv("CLOUDINARY_API_SECRET"),
	)
	cld.Config.URL.Secure = true

	return cld, err
}
