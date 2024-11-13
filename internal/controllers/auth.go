package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"

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

	// user, err := services.CreateOrUpdateUser(userInfo)
	// if err != nil {
	// 	log.Fatal(err)
	// 	return c.JSON(http.StatusInternalServerError, echo.Map{
	// 		"message": "Failed to create user",
	// 		"data":    err.Error(),
	// 		"status":  false,
	// 	})
	// }

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Successfully logged in",
		"data":    userInfo,
		"status":  true,
	})
}

var secretKey = []byte("your-secret-key")

type AuthController struct{}

func (ac *AuthController) Login(c echo.Context) error {
	username := c.FormValue("username")
	password := c.FormValue("password")

	if username == "admin" && password == "password" {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"username": username,
			"exp":      time.Now().Add(time.Hour * 24).Unix(),
		})

		tokenString, err := token.SignedString(secretKey)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Could not generate token"})
		}

		return c.JSON(http.StatusOK, echo.Map{"token": tokenString})
	} else {
		return c.JSON(http.StatusUnauthorized, echo.Map{"error": "Invalid credentials"})
	}
}

func (ac *AuthController) AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		tokenString := c.Request().Header.Get("Authorization")
		if tokenString == "" {
			return c.JSON(http.StatusUnauthorized, echo.Map{"error": "Authorization header is required"})
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return secretKey, nil
		})

		if err != nil || !token.Valid {
			return c.JSON(http.StatusUnauthorized, echo.Map{"error": "Invalid token"})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Could not parse claims"})
		}

		c.Set("username", claims["username"])
		return next(c)
	}
}

func (ac *AuthController) ProtectedRoute(c echo.Context) error {
	username := c.Get("username").(string)
	return c.JSON(http.StatusOK, echo.Map{"message": "Hello " + username + ", this is a protected route"})
}
