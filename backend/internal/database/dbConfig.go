package database

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/Oik17/file-sharing-system/internal/utils"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq" // Import the PostgreSQL driver
)

type Dbinstance struct {
	Db *sqlx.DB
}

var DB Dbinstance

func InitDB() {
	p := utils.Config("DB_PORT")
	port, err := strconv.Atoi(p)
	if err != nil {
		fmt.Println("Error parsing str to int")
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=disable TimeZone=Asia/Shanghai", utils.Config("DB_HOST"), utils.Config("DB_USER"), utils.Config("DB_PASSWORD"), utils.Config("DB_NAME"), port)

	db, err := sqlx.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err.Error())
		log.Fatal("Failed to connect to database. \n", err)
		os.Exit(2)
	}

	if err := db.Ping(); err != nil {
		log.Fatal(err.Error())
		log.Fatal("Failed to ping the database. \n", err)
		os.Exit(2)
	}

	log.Println("Connected")

	runMigrations(db)

	DB = Dbinstance{
		Db: db,
	}
}

func runMigrations(db *sqlx.DB) {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS test (test VARCHAR(255));
		
		CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY,
			email VARCHAR(255) UNIQUE NOT NULL,
			username VARCHAR(255),
			profile_picture TEXT,
			verified_email BOOLEAN DEFAULT FALSE,
			files TEXT[],
			storage_quota BIGINT DEFAULT 0,
			storage_used BIGINT DEFAULT 0,
			created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
			access_token TEXT,
			refresh_token TEXT
);

		CREATE TABLE IF NOT EXISTS files (
			id UUID PRIMARY KEY,
			user_id UUID,
			parent_folders TEXT[],
			level BIGINT,
			name VARCHAR(255),
			file_link TEXT,
			share_link TEXT,
			is_folder BOOLEAN DEFAULT FALSE,
			is_starred BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		);

	`)

	if err != nil {
		log.Fatal("Failed to run migrations. \n", err)
		os.Exit(2)
	}

	log.Println("Migrations completed")
}
