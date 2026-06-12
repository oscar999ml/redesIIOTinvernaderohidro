/**
 * ESP8266 Nodo 1 — Control LED + Reporte de estado
 *
 * CONTRATO:
 *   - Se conecta al WiFi AP del ESP32 ("InvernaderoNet")
 *   - Se conecta al TCP server del ESP32 (:3333)
 *   - Recibe comandos: {"nodo_id":1,"accion":"set_led","valor":true/false}
 *   - Reporta estado:  {"nodo_id":1,"tipo":"estado","datos":{"led":true/false,...}}
 *
 * Hardware:
 *   - LED en GPIO2 (D4) — activo HIGH
 */

#include <Arduino.h>
#include <ESP8266WiFi.h>

#define NODO_ID      1
#define PIN_LED      2  // GPIO2 (D4)
#define REPORT_MS    2000

// ── WiFi ───────────────────────────────────────────────────────
const char* AP_SSID  = "InvernaderoNet";
const char* AP_PASS  = "control123";
const char* HOST     = "192.168.4.1"; // IP del ESP32 AP
const int   TCP_PORT = 3333;

WiFiClient client;
unsigned long lastReport = 0;
bool estadoLED = false;

// ── Prototipos ─────────────────────────────────────────────────
void conectarWiFi();
void conectarTCP();
void enviarEstado();
void procesarLinea(const String& linea);

// ── Setup ──────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_LED, LOW);

  conectarWiFi();
  conectarTCP();
}

// ── Loop ───────────────────────────────────────────────────────
void loop() {
  // Reconectar WiFi si se perdió
  if (WiFi.status() != WL_CONNECTED) {
    conectarWiFi();
    delay(1000);
    return;
  }

  // Reconectar TCP si se perdió
  if (!client.connected()) {
    conectarTCP();
    delay(500);
    return;
  }

  // Leer comandos del ESP32
  while (client.available()) {
    String linea = client.readStringUntil('\n');
    linea.trim();
    if (linea.length() > 0) procesarLinea(linea);
  }

  // Reporte periódico
  if (millis() - lastReport >= REPORT_MS) {
    lastReport = millis();
    enviarEstado();
  }
}

// ── Conectar a WiFi AP del ESP32 ──────────────────────────────
void conectarWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(AP_SSID, AP_PASS);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    attempts++;
  }
}

// ── Conectar TCP al ESP32 ─────────────────────────────────────
void conectarTCP() {
  if (client.connected()) return;
  if (!client.connect(HOST, TCP_PORT)) return;
  enviarEstado();
}

// ── Enviar estado actual al ESP32 ─────────────────────────────
void enviarEstado() {
  if (!client.connected()) return;
  String json = "{\"nodo_id\":" + String(NODO_ID) +
    ",\"tipo\":\"estado\"" +
    ",\"datos\":{\"led\":" + String(estadoLED ? "true" : "false") + "}}";
  client.println(json);
}

// ── Procesar comando recibido ─────────────────────────────────
void procesarLinea(const String& linea) {
  // Buscar accion set_led
  if (linea.indexOf("\"set_led\"") >= 0) {
    bool valor = (linea.indexOf("\"valor\":true") >= 0) ||
                 (linea.indexOf("\"valor\":1") >= 0);
    estadoLED = valor;
    digitalWrite(PIN_LED, estadoLED ? HIGH : LOW);
    enviarEstado(); // responder inmediatamente
  }
}
