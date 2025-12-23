use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ApiConfig {
    #[serde(rename = "apiUrl")]
    pub api_url: String,
}
