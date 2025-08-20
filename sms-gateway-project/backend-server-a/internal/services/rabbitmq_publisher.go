package services

import (
	"context"
	"encoding/json"

	amqp "github.com/rabbitmq/amqp091-go"

	"sms-gateway/backend-server-a/internal/models"
)

type RabbitMQPublisher struct {
	conn      *amqp.Connection
	ch        *amqp.Channel
	queueName string
}

func NewPublisher(url, queue string) (*RabbitMQPublisher, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, err
	}
	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, err
	}
	if _, err := ch.QueueDeclare(queue, true, false, false, false, nil); err != nil {
		ch.Close()
		conn.Close()
		return nil, err
	}
	return &RabbitMQPublisher{conn: conn, ch: ch, queueName: queue}, nil
}

func (p *RabbitMQPublisher) Publish(ctx context.Context, payload models.MessagePayload) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	return p.ch.PublishWithContext(ctx, "", p.queueName, false, false, amqp.Publishing{
		ContentType: "application/json",
		Body:        body,
	})
}

func (p *RabbitMQPublisher) Close() {
	if p.ch != nil {
		p.ch.Close()
	}
	if p.conn != nil {
		p.conn.Close()
	}
}
