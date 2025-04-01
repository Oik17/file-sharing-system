package utils

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
)

type S3UploadError struct {
	Stage   string
	Message string
	Err     error
}

func (e *S3UploadError) Error() string {
	return fmt.Sprintf("%s: %s - %v", e.Stage, e.Message, e.Err)
}

func ValidateConfig() error {
	required := []string{
		"AWS_REGION",
		"AWS_ACCESS_KEY_ID",
		"AWS_SECRET_ACCESS_KEY",
		"AWS_S3_BUCKET",
	}

	for _, key := range required {
		if Config(key) == "" {
			return fmt.Errorf("missing required configuration: %s", key)
		}
	}
	return nil
}

func InitAWSSession() (*session.Session, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(Config("AWS_REGION")),
		Credentials: credentials.NewStaticCredentials(
			Config("AWS_ACCESS_KEY_ID"),
			Config("AWS_SECRET_ACCESS_KEY"),
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
