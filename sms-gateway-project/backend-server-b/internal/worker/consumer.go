package worker

import (
	"encoding/json"

	amqp "github.com/rabbitmq/amqp091-go"
	"sms-gateway/backend-server-b/internal/services"
)

// Consumer consumes messages from RabbitMQ and processes them via PolicyEngine.
type Consumer struct {
	ConnURL   string
	QueueName string
	Engine    *services.PolicyEngine
}

// NewConsumer creates a new Consumer.
func NewConsumer(url, queue string, engine *services.PolicyEngine) *Consumer {
	return &Consumer{ConnURL: url, QueueName: queue, Engine: engine}
}

// StartConsumer starts consuming messages.
func (c *Consumer) StartConsumer() error {
	conn, err := amqp.Dial(c.ConnURL)
	if err != nil {
		return err
	}
	ch, err := conn.Channel()
	if err != nil {
		return err
	}
	if _, err := ch.QueueDeclare(c.QueueName, true, false, false, false, nil); err != nil {
		return err
	}

	msgs, err := ch.Consume(c.QueueName, "", false, false, false, false, nil)
	if err != nil {
		return err
	}

	go func() {
		for msg := range msgs {
			var payload services.MessagePayload
			if err := json.Unmarshal(msg.Body, &payload); err != nil {
				msg.Nack(false, false)
				continue
			}
			if err := c.Engine.ProcessMessage(payload); err != nil {
				msg.Nack(false, true)
				continue
			}
			msg.Ack(false)
		}
	}()

	return nil
}
