package providers

import "sms-gateway/backend-server-b/internal/config"

// GetProvider returns an SmsProvider based on the given name and configuration.
func GetProvider(name string, cfg config.ProviderConfig) SmsProvider {
	switch name {
	case "Provider-A":
		return NewProviderA(cfg)
	case "Provider-B":
		return NewProviderB(cfg)
	default:
		return nil
	}
}
