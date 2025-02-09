const dayjs = require("dayjs");

const isToday = require("dayjs/plugin/isToday");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(isToday);
dayjs.extend(utc);
dayjs.extend(timezone);

const getMinutesFromMidnight = (date) => {
    return date.hour() * 60 + date.minute();
};

const getSlots = ({
                      calendarTimeZone,
                      eventLength,
                      selectedTimeZone,
                      selectedDate,
                      dayStartTime,
                      dayEndTime,
                      weekdays,
                  }) => {

    if (!selectedDate) return [];

    if (!weekdays.includes(selectedDate.day())) return [];

    const lowerBound = selectedDate.tz(selectedTimeZone).startOf("day");

    // Simple case, same timezone
    if (calendarTimeZone === selectedTimeZone) {
        const slots = [];
        const now = dayjs();
        for (
            let minutes = dayStartTime;
            minutes <= dayEndTime - eventLength;
            minutes += parseInt(eventLength, 10)
        ) {
            const slotTime = lowerBound.add(minutes, "minutes");
            if (slotTime > now) {
                slots.push({time: slotTime});
            }
        }
        return slots;
    }

    const upperBound = selectedDate.tz(selectedTimeZone).endOf("day");

    // We need to start generating slots from the start of the calendarTimeZone day
    const startDateTime = lowerBound
        .tz(calendarTimeZone)
        .startOf("day")
        .add(dayStartTime, "minutes");

    let phase = 0;
    if (startDateTime < lowerBound) {
        // Getting minutes of the first event in the day of the chooser
        const diff = lowerBound.diff(startDateTime, "minutes");

        // finding first event
        phase = diff + eventLength - (diff % eventLength);
    }

    // We can stop as soon as the selectedTimeZone day ends
    const endDateTime = upperBound
        .tz(calendarTimeZone)
        .subtract(eventLength, "minutes");

    const maxMinutes = endDateTime.diff(startDateTime, "minutes");

    const slots = [];
    const now = dayjs();
    for (
        let minutes = phase;
        minutes <= maxMinutes;
        minutes += parseInt(eventLength, 10)
    ) {
        const slotTime = startDateTime.add(minutes, "minutes");

        const minutesFromMidnight = getMinutesFromMidnight(slotTime);

        if (
            minutesFromMidnight < dayStartTime ||
            minutesFromMidnight > dayEndTime - eventLength ||
            slotTime < now
        ) {
            continue;
        }

        slots.push({time: slotTime.tz(selectedTimeZone)});
    }

    return slots;
};

export default getSlots
