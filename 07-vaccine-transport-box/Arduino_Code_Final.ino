// ===================================================================
// Vaccine Transport Box - FINAL version (Parts 1-4 + Bonus LED)
// Arduino Uno + TMP36 (A0) + 16x2 I2C LCD (SDA=A4, SCL=A5)
// Bonus: red warning LED on pin 8 through a 220 ohm resistor
// ===================================================================
// Improvements vs. the starter sketch:
//   Option A : clearer handling messages on LCD line 2
//   Display  : no lcd.clear() every loop (no flicker), padded lines
//   Bonus    : LED OFF in SAFE/CAUTION, ON in HOLD, BLINKING in MOVE_BOX
// Hamzeh Al Shamali - 1108979 - Workshop 7 (tested in Tinkercad)
// ===================================================================

#include <Adafruit_LiquidCrystal.h>

// Tinkercad I2C LCD: address index 0 (= 0x20)
Adafruit_LiquidCrystal lcd(0);

const int SENSOR_PIN = A0;
const int LED_PIN    = 8;      // BONUS

// Classroom thresholds (not real vaccine specs)
const float T_CAUTION = 28.0;
const float T_HOLD    = 30.0;
const float T_MOVE    = 32.0;

enum State { SAFE, CAUTION, HOLD, MOVE_BOX };
State state = SAFE;

// ---------- Sensor input ----------
float readTempC() {
  int raw = analogRead(SENSOR_PIN);          // 0..1023
  float voltage = raw * 5.0 / 1024.0;        // volts
  return (voltage - 0.5) * 100.0;            // TMP36: 10 mV/C, 0.5 V offset
}

// ---------- FSM: next state depends only on T ----------
// Checking from the highest range down lets a big jump skip states
// (e.g. 25 -> 33 goes SAFE -> MOVE_BOX directly).
// (int instead of State: avoids the Arduino auto-prototype
//  error "'State' does not name a type")
int getState(float t) {
  if (t >= T_MOVE)    return MOVE_BOX;
  if (t >= T_HOLD)    return HOLD;
  if (t >= T_CAUTION) return CAUTION;
  return SAFE;
}

// ---------- Option A: clearer messages (all <= 16 chars) ----------
const char* stateMessage(int s) {
  switch (s) {
    case SAFE:     return "SAFE: OK";
    case CAUTION:  return "CHECK TEMP";
    case HOLD:     return "HOLD: COOL BOX";
    case MOVE_BOX: return "MOVE BOX NOW!";
  }
  return "";
}

// Print text on one LCD row and clear the rest of the row
void printRow(int row, const char* text) {
  lcd.setCursor(0, row);
  lcd.print(text);
  for (int i = strlen(text); i < 16; i++) lcd.print(' ');
}

// ---------- BONUS: LED output ----------
bool blinkOn = false;   // toggles every loop for the MOVE_BOX blink

void updateLed(int s) {
  blinkOn = !blinkOn;
  if (s == HOLD) {
    digitalWrite(LED_PIN, HIGH);                 // steady ON
  } else if (s == MOVE_BOX) {
    digitalWrite(LED_PIN, blinkOn ? HIGH : LOW); // blink
  } else {
    digitalWrite(LED_PIN, LOW);                  // OFF
  }
}

void setup() {
  lcd.begin(16, 2);
  lcd.setBacklight(1);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  float t = readTempC();
  state = (State)getState(t);

  // Line 1: "Temp: 29.4 C"
  lcd.setCursor(0, 0);
  lcd.print("Temp: ");
  lcd.print(t, 1);
  lcd.print(" C    ");        // Tinkercad LCD has no degree glyph

  // Option A: handling instruction on line 2
  printRow(1, stateMessage(state));

  updateLed(state);

  Serial.print("T = ");
  Serial.print(t, 1);
  Serial.print(" C  ->  ");
  Serial.println(stateMessage(state));

  delay(250);
}
