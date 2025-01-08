package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"

	"github.com/Oik17/file-sharing-system/internal/services"
	"github.com/Oik17/file-sharing-system/internal/utils"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var (
	oauthConfig = &oauth2.Config{
		ClientID:     utils.Config("GOOGLE_CLIENT_ID"),
		ClientSecret: utils.Config("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  "http://localhost:8080/callback",
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/calendar"},
		Endpoint:     google.Endpoint,
	}
	oauthStateString = "random"

	jwtSecretKey = []byte(utils.Config("JWT_SECRET_KEY"))
)

func GenerateJWT(userID string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // 24 hours expiration
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// Sign the token with the secret key
	signedToken, err := token.SignedString(jwtSecretKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign JWT token: %v", err)
	}

	return signedToken, nil
}

func HandleCallback(c echo.Context) error {
	state := c.QueryParam("state")
	if state != oauthStateString {
		log.Printf("invalid oauth state, expected '%s', got '%s'\n", oauthStateString, state)
		return c.Redirect(http.StatusTemporaryRedirect, "/")
	}

	code := c.QueryParam("code")
	token, err := oauthConfig.Exchange(context.Background(), code)
	if err != nil {
		log.Printf("oauthConfig.Exchange() failed with '%s'\n", err)
		return c.Redirect(http.StatusTemporaryRedirect, "/")
	}

	response, err := http.Get(fmt.Sprintf("https://www.googleapis.com/oauth2/v2/userinfo?access_token=%s", token.AccessToken))
	if err != nil {
		log.Printf("Get: %s\n", err)
		return c.Redirect(http.StatusTemporaryRedirect, "/")
	}
	defer response.Body.Close()

	userInfo := make(map[string]interface{})
	if err := json.NewDecoder(response.Body).Decode(&userInfo); err != nil {
		log.Printf("Decode: %s\n", err)
		return c.Redirect(http.StatusTemporaryRedirect, "/")
	}
	userInfo["access_token"] = token.AccessToken
	log.Println(userInfo)

	user, err := services.CreateOrUpdateUser(userInfo)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "Failed to create user",
			"data":    err.Error(),
			"status":  false,
		})
	}

	// Convert `uuid.UUID` to string
	userID := user.ID.String()

	// Generate JWT token
	jwtToken, err := GenerateJWT(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "Failed to generate token",
			"data":    err.Error(),
			"status":  false,
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Successfully logged in",
		"token":   jwtToken,
		"data":    user,
		"status":  true,
	})
}

func HandleLogin(c echo.Context) error {
	url := oauthConfig.AuthCodeURL(oauthStateString)
	return c.Redirect(http.StatusTemporaryRedirect, url)
}
