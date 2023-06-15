package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r1 := gin.Default()

	r1.Use(cors.Default())
	r1.GET("/ws", handleLuckyConnection)
	r1.POST("/api/transaction", handleTransaction)

	log.Fatal(r1.Run(":3000")) // 在 0.0.0.0:3000 上启动服务
}
