import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function parseDate(value) {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function sameDay(first, second) {
  return (
    first &&
    second &&
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addYears(date, amount) {
  return new Date(date.getFullYear() + amount, date.getMonth(), 1);
}

export default function DatePickerField({ label, value, onChange, onOpen }) {
  const selectedDate = parseDate(value);
  const [visible, setVisible] = useState(false);
  const [viewDate, setViewDate] = useState(
    selectedDate || new Date(new Date().getFullYear() - 10, 0, 1)
  );

  const openPicker = () => {
    setViewDate(selectedDate || new Date(new Date().getFullYear() - 10, 0, 1));
    setVisible(true);
    onOpen?.();
  };

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = Array.from({ length: firstDay }, () => null);

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [viewDate]);

  const handleSelect = (date) => {
    onChange(formatDate(date));
    setVisible(false);
  };

  const clearDate = () => {
    onChange("");
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.field} onPress={openPicker}>
        <Text style={[styles.fieldText, !value && styles.placeholder]}>
          {value || "Select date"}
        </Text>
        <Text style={styles.calendarIcon}>Calendar</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setViewDate((current) => addYears(current, -1))}
              >
                <Text style={styles.navButtonText}>{"<<"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setViewDate((current) => addMonths(current, -1))}
              >
                <Text style={styles.navButtonText}>{"<"}</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </Text>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setViewDate((current) => addMonths(current, 1))}
              >
                <Text style={styles.navButtonText}>{">"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setViewDate((current) => addYears(current, 1))}
              >
                <Text style={styles.navButtonText}>{">>"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {weekDays.map((day) => (
                <Text key={day} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {days.map((date, index) => {
                if (!date) {
                  return <View key={`blank-${index}`} style={styles.dayCell} />;
                }

                const isSelected = sameDay(date, selectedDate);

                return (
                  <TouchableOpacity
                    key={formatDate(date)}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => handleSelect(date)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton} onPress={clearDate}>
                <Text style={styles.actionButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.doneButton]}
                onPress={() => setVisible(false)}
              >
                <Text style={[styles.actionButtonText, styles.doneButtonText]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  field: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  fieldText: {
    color: "#111",
    fontSize: 15,
  },
  placeholder: {
    color: "#777",
  },
  calendarIcon: {
    color: "#0d6ecf",
    fontWeight: "bold",
    marginLeft: 12,
  },
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 18,
  },
  modal: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  navButton: {
    minWidth: 34,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 6,
    paddingVertical: 8,
  },
  navButtonText: {
    color: "#0d6ecf",
    fontWeight: "bold",
  },
  monthTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    color: "#666",
    fontWeight: "bold",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  dayCellSelected: {
    backgroundColor: "#2196f3",
  },
  dayText: {
    color: "#111",
    fontWeight: "600",
  },
  dayTextSelected: {
    color: "#fff",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionButtonText: {
    fontWeight: "bold",
  },
  doneButton: {
    borderColor: "#2196f3",
    backgroundColor: "#2196f3",
  },
  doneButtonText: {
    color: "#fff",
  },
});
