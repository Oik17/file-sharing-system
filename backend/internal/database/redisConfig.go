package database

import (
	"context"
	"log"

	"github.com/Oik17/file-sharing-system/internal/utils"
	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func InitRedis() {
	// redisDB, err := strconv.Atoi(utils.Config("REDIS_DB"))
	// if err != nil {
	// 	log.Fatalf("Invalid REDIS_DB value: %v", err)
	// }

	// RedisClient = redis.NewClient(&redis.Options{
	// 	Addr:     fmt.Sprintf("%s:%s", utils.Config("REDIS_HOST"), utils.Config("REDIS_PORT")),
	// 	Password: utils.Config("REDIS_PASSWORD"),
	// 	DB:       redisDB,
	// })

	opt, _ := redis.ParseURL(utils.Config("REDIS_URI"))
	RedisClient = redis.NewClient(opt)

	ctx := context.Background()

	err := RedisClient.Set(ctx, "foo", "bar", 0).Err()
	if err != nil {
		panic(err)
	}

	val, err := RedisClient.Get(ctx, "foo").Result()
	if err != nil {
		panic(err)
	}
	log.Println("foo", val)
	log.Println("Redis Connected")
}
