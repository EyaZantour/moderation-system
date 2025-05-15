# 🛡️ Real-Time Content Moderation System

A microservices-based backend system that classifies and stores user messages in real-time using **Kafka**, **gRPC**, **REST**, **GraphQL**, and **MongoDB**.

---

## 🔧 Stack Used

- **Node.js** for all services
- **Kafka** for message queuing
- **gRPC** for fast internal RPC
- **REST** for content submission
- **GraphQL** for querying moderated content
- **MongoDB** for storing results

---

## 📁 Architecture

api-gateway ──REST──▶ content-service ──Kafka──▶ moderation-service ──gRPC──▶ classification-service
▲ │
GraphQL ◀─── REST ─────── MongoDB ◀─────────┘


---

## 🧩 Microservices Overview

| Service                | Port   | Role                                                                 |
|------------------------|--------|----------------------------------------------------------------------|
| `api-gateway`          | 4000   | Receives requests, sends content via REST, exposes GraphQL endpoint |
| `content-service`      | 4001   | Publishes messages to Kafka topic (`moderation-topic`)               |
| `moderation-service`   | 4002   | Consumes Kafka messages, classifies content via gRPC, stores in DB   |
| `classification-service` | 50051 | Classifies messages based on a bad words list (via gRPC)             |
| `MongoDB`              | 27017  | Stores all moderated messages                                        |

---

## 🚀 How to Run Locally

### 1. Start Kafka and Zookeeper on your machine
Make sure Kafka is running on `localhost:9092`

### 2. Start services in order (each in a terminal):

```bash
cd classification-service && node index.js
cd moderation-service && node index.js
cd content-service && node index.js
cd api-gateway && node index.js
```

🧪 Test Example

POST a message (REST)

POST http://localhost:4000/submit
```bash
Content-Type: application/json

{
  "content": "you are so dumb!"
}
```


Query messages (GraphQL)

```bash
query {
  messages {
    content
    classification
  }
}
```


📦 Future Improvements

Replace word list with an AI-powered classification model

Add user authentication


📄 License
MIT


