package models

type MessagePayload struct {
	TrackingID string   `json:"tracking_id"`
	Recipient  string   `json:"recipient"`
	Message    string   `json:"message"`
	Providers  []string `json:"providers"`
	TTL        int      `json:"ttl"`
}
