package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

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
)

func HandleLogin(c echo.Context) error {
	url := oauthConfig.AuthCodeURL(oauthStateString)
	return c.Redirect(http.StatusTemporaryRedirect, url)
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

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Successfully logged in",
		"data":    user,
		"status":  true,
	})
}
