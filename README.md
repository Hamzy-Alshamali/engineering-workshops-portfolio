# Engineering Workshops Portfolio — Hamzeh Al Shamali

First-year **Computer Engineering** student at **Abu Dhabi University**.
This repository collects the seven hands-on workshops I completed in **ECS100/ECS200 – Introduction to Engineering & Computing** (Fall 2026), covering electronics, robotics, energy systems, 3D design, artificial intelligence and embedded systems.

| # | Workshop | Area | Tools |
|---|----------|------|-------|
| 1 | [Op-Amp Lab Report in LaTeX](#1-summing--difference-amplifiers--ieee-report-in-latex) | Electronics / Technical writing | LaTeX, Overleaf, LM741, NI myDAQ |
| 2 | [VEX Robotics Challenges](#2-vex-robotics-challenges) | Robotics / Programming | VEXcode VR (blocks) |
| 3 | [Renewable Energy Design](#3-renewable-energy-design-challenge) | Energy systems | Solar + battery design simulator |
| 4 | [3D Enclosure Design](#4-3d-enclosure-design) | CAD / 3D design | Tinkercad, STL |
| 5 | [AI Space Invaders](#5-ai--space-invaders) | Machine learning | Behavioral cloning, Q-learning |
| 6 | [Generative AI Workshop](#6-generative-ai-workshop) | AI / Web / Computer vision | NotebookLM, JavaScript, ONNX |
| 7 | [Vaccine Transport Box](#7-vaccine-transport-box) | Embedded systems / Biomedical | Arduino Uno, TMP36, I2C LCD, Tinkercad |

---

## 1. Summing & Difference Amplifiers — IEEE Report in LaTeX
Built and tested summing and difference amplifier circuits using the **LM741 op-amp** and **NI myDAQ**, then wrote the full report in **IEEE conference format** using LaTeX/Overleaf.
- Summing amplifier results agreed with theory (errors between 0.95% and 8.77%)
- Difference amplifier achieved an experimental gain of **1.005** (ideal: 1)
- Report includes auto-numbered figures, tables, equations, cross-references and citations

📁 `01-latex-ieee-report/`

## 2. VEX Robotics Challenges
Programmed a virtual robot in **VEXcode VR** to solve the *Wall Maze* and *Castle Crasher* challenges. *(Pair work with Mahmoud Osama Al-Atamneh.)*

📁 `02-vex-robotics/`

## 3. Renewable Energy Design Challenge
Designed a solar + battery system for a realistic four-person household (16 appliance types, ~33–40 kWh/day).
- Found that **battery capacity**, not panel count, was the limiting factor
- Final design: **92.3% renewable coverage** (target 90%) at **AED 41,580** (budget AED 42,000)

📁 `03-renewable-energy-design/`

## 4. 3D Enclosure Design
Designed a 3D-printable enclosure (base + lid with locating lip) for the Arduino, LCD and sensor electronics of the vaccine monitor, to exact millimetre specifications in **Tinkercad**.

📁 `04-3d-enclosure-design/` · [View in Tinkercad](https://www.tinkercad.com/things/5p4kkCTwVEj-project-5?sharecode=dvwFspzOuDPzqKuD5yXxnbzw2vlmanUw_cVxxFuwDVM)

## 5. AI — Space Invaders
Trained game-playing agents with two machine-learning approaches and compared them on fixed missions:
- **Behavioral cloning:** neural networks trained on my own gameplay, testing different layer sizes and epochs
- **Reinforcement learning (Q-learning):** tuning episodes, exploration rate and rewards

📁 `05-ai-space-invaders/` (exported experiment runs)

## 6. Generative AI Workshop
Three activities using AI tools in a careful, test-driven way:
1. **Research papers** — extracted and evidence-checked information from academic papers with NotebookLM
2. **To-do dashboard** — built a web task dashboard and tested it
3. **Digit Lens (camera digit classifier)** — a web app that reads handwritten digits from a camera in real time using the pretrained **MNIST-12 ONNX** model, with digit segmentation, a model card and positive/negative tests

📁 `06-generative-ai/`

## 7. Vaccine Transport Box
Temperature-monitoring prototype for vaccine transport using an **Arduino Uno**, **TMP36** sensor and **16×2 I2C LCD**.
- Designed a **finite state machine** (SAFE → CAUTION → HOLD → MOVE_BOX) with thresholds at 28 °C, 30 °C and 32 °C
- Built and tested the circuit in Tinkercad
- **Improvement:** clear handling instructions on the LCD and flicker-free display updates
- **Bonus:** red warning LED (off / steady / blinking depending on state)

📁 `07-vaccine-transport-box/` · [View in Tinkercad](https://www.tinkercad.com/things/byI07ZQHcuS-sizzling-waasa-crift?sharecode=PTjJ3ycnifk7KhpWKAWChryJ181soy9yRiAqREZQf8M)

---

## Skills
- **Hardware & electronics:** Arduino, sensors, op-amps, NI myDAQ, circuit design
- **Programming:** C/C++ (Arduino), JavaScript, MATLAB, block-based robotics
- **AI:** neural networks, Q-learning, ONNX model inference, generative AI tools
- **Design & documentation:** Tinkercad (3D + circuits), LaTeX/IEEE reports, FSM design

## Contact
- LinkedIn: *(add link)*
- Email: *(add email)*
