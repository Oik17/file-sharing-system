package middleware

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/Oik17/file-sharing-system/internal/utils"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

var JWTSecret = []byte(utils.Config("JWT_SECRET_KEY"))

func Protected(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing JWT token")
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return JWTSecret, nil
		})

		if err != nil || !token.Valid {
			return echo.NewHTTPError(http.StatusUnauthorized, "Invalid JWT token")
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to parse JWT claims")
		}

		userIDStr, ok := claims["user_id"].(string)
		if !ok {
			return echo.NewHTTPError(http.StatusInternalServerError, "User ID claim missing or invalid")
		}

		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Invalid user ID format")
		}

		// sessionKey := "session:" + userIDStr
		// storedToken, err := database.RedisClient.Get(context.Background(), sessionKey).Result()
		// if err != nil || storedToken != tokenStr {
		// 	return echo.NewHTTPError(http.StatusUnauthorized, "Session expired or invalid")
		// }

		c.Set("user_id", userID)
		return next(c)
	}
}

func AdminProtected(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing JWT token")
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return JWTSecret, nil
		})

		if err != nil || !token.Valid {
			return echo.NewHTTPError(http.StatusUnauthorized, "Invalid JWT token")
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to parse JWT claims")
		}

		userIDStr, ok := claims["id"].(string)
		if !ok {
			return echo.NewHTTPError(http.StatusInternalServerError, "User ID claim missing or invalid")
		}

		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Invalid user ID format")
		}
		role, ok := claims["role"].(bool)
		log.Printf("role: %t", role)
		if !ok || !role {
			return echo.NewHTTPError(http.StatusForbidden, "Access forbidden: Admins only")
		}

		c.Set("user_id", userID)
		return next(c)
	}
}
