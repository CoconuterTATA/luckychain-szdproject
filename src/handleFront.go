package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type Message struct {
	Action string `json:"action"`
	Count  int    `json:"count"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}                             // 用于升级HTTP连接到WebSocket的工具
var reactConn *websocket.Conn // 保存与React应用的WebSocket连接

func handleTransaction(c *gin.Context) {
	var request struct {
		Count int `json:"count"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	log.Println("收到交易数量:", request.Count)

	// 处理交易逻辑

	if reactConn == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No connection to LuckyChain"})
		return
	}

	message := Message{
		Action: "TestTPS",
		Count:  request.Count,
	}
	messageBytes, err := json.Marshal(message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// 将count发送到LuckyChain
	err = reactConn.WriteMessage(websocket.TextMessage, messageBytes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 等待LuckyChain的响应
	_, response, err := reactConn.ReadMessage()
	fmt.Println(response)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 将响应返回给Vue应用
	c.JSON(http.StatusOK, gin.H{"message": "Transaction processed successfully", "TpsResponse": string(response)})

}

func handleLuckyConnection(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	reactConn = conn

	conn.SetCloseHandler(func(code int, text string) error {
		log.Printf("WebSocket closed with code %d and text: %s\n", code, text)
		reactConn = nil
		return nil
	})
}
