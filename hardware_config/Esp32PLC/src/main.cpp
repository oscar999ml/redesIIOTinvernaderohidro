/**
 * ESP32 — Nodo SCADA por WiFi + TCP directo (sin WebSockets)
 *
 * Se conecta a red "perroLobo" y al backend vía TCP puerto 4002.
 * Controla GPIO12/GPIO2 (LED), GPIO14 (LED indicador WiFi).
 * Botón GPIO0 hace toggle local. Reporta estado cada 2s.
 *
 * CONTRATO (JSON + \n sobre TCP):
 *   Envia:  {"nodo_id":1,"tipo":"estado","datos":{"led":true,"boton":false}}
 *   Recibe: {"nodo_id":1,"accion":"set_led","valor":true}
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClient.h>

// ── Config WiFi ──────────────────────────────────────────────────────────
const char* WIFI_SSID  = "perroLobo";
const char* WIFI_PASS  = "perroloba123";

// ── Backend TCP ──────────────────────────────────────────────────────────
const char* TCP_HOST   = "192.168.100.6";
const uint16_t TCP_PORT = 4002;

// ── Hardware ─────────────────────────────────────────────────────────────
#define NODO_ID        1
#define PIN_LED        12
#define PIN_LED2        2
#define PIN_BOTON       0
#define PIN_WIFI_LED   14
#define REPORT_MS     2000

WiFiClient tcpClient;
unsigned long lastReport = 0;
unsigned long lastReconnect = 0;
bool estadoLED = false;
bool estadoBotonPrevio = true;

void enviarEstado();
void procesarComando(const String& linea);
void conectarTcp();

void setup() {
  Serial.begin(115200);

  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_LED2, OUTPUT);
  pinMode(PIN_BOTON, INPUT_PULLUP);
  pinMode(PIN_WIFI_LED, OUTPUT);

  digitalWrite(PIN_LED, LOW);
  digitalWrite(PIN_LED2, LOW);
  digitalWrite(PIN_WIFI_LED, LOW);

  for (int i = 0; i < 3; i++) {
    digitalWrite(PIN_LED, HIGH); digitalWrite(PIN_LED2, HIGH); delay(150);
    digitalWrite(PIN_LED, LOW);  digitalWrite(PIN_LED2, LOW);  delay(150);
  }

  Serial.print("Conectando a WiFi ");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi OK - IP: " + WiFi.localIP().toString());
  digitalWrite(PIN_WIFI_LED, HIGH);

  conectarTcp();
}

void conectarTcp() {
  Serial.print("Conectando TCP a ");
  Serial.print(TCP_HOST);
  Serial.print(":");
  Serial.println(TCP_PORT);
  if (tcpClient.connect(TCP_HOST, TCP_PORT)) {
    Serial.println("TCP conectado");
    enviarEstado();
  } else {
    Serial.println("TCP falló");
    lastReconnect = millis();
  }
}

void loop() {
  if (!tcpClient.connected()) {
    if (millis() - lastReconnect > 5000) {
      lastReconnect = millis();
      conectarTcp();
    }
    return;
  }

  if (tcpClient.available()) {
    String linea = tcpClient.readStringUntil('\n');
    linea.trim();
    if (linea.length() > 0) procesarComando(linea);
  }

  bool btnActual = digitalRead(PIN_BOTON);
  if (btnActual != estadoBotonPrevio) {
    estadoBotonPrevio = btnActual;
    if (btnActual == LOW) {
      estadoLED = !estadoLED;
      digitalWrite(PIN_LED, estadoLED ? HIGH : LOW);
      digitalWrite(PIN_LED2, estadoLED ? HIGH : LOW);
      enviarEstado();
    }
  }

  if (millis() - lastReport >= REPORT_MS) {
    lastReport = millis();
    enviarEstado();
  }
}

void enviarEstado() {
  String json = "{\"nodo_id\":" + String(NODO_ID) +
    ",\"tipo\":\"estado\"" +
    ",\"datos\":{\"led\":" + String(estadoLED ? "true" : "false") +
    ",\"boton\":" + String(estadoBotonPrevio == LOW ? "true" : "false") + "}}";
  tcpClient.println(json);
}

void procesarComando(const String& linea) {
  if (linea.indexOf("\"set_led\"") >= 0) {
    bool valor = (linea.indexOf("\"valor\":true") >= 0) ||
                 (linea.indexOf("\"valor\":1") >= 0);
    estadoLED = valor;
    digitalWrite(PIN_LED, estadoLED ? HIGH : LOW);
    digitalWrite(PIN_LED2, estadoLED ? HIGH : LOW);
    enviarEstado();
  }
}
