package api

type SendSMSRequest struct {
	Recipient string   `json:"recipient" binding:"required"`
	Message   string   `json:"message" binding:"required"`
	Providers []string `json:"providers"`
	TTL       int      `json:"ttl"`
}

type AcceptedResponse struct {
	Success    bool   `json:"success"`
	Message    string `json:"message"`
	TrackingID string `json:"tracking_id"`
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
