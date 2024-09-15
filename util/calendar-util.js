const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const UserAvailability = require('../models/user-availability-model');
const DT_FMT = 'YYYY-MM-DD HH:mm:ss';

exports.populateMonthlyCalendar = (year, month) => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = [];
    const date = new Date(year, month - 1, 1);
    while (date.getMonth() === month - 1) {
        days.push({
            dayInMonth: date.getDate(),
            weekOfDay: daysOfWeek[date.getDay()]
        });
        date.setDate(date.getDate() + 1);
    }
    return days;
}

exports.populateUserDayCalendar = async (year, month, date, interval, id) => {
    let hours = [];
    const docs = await UserAvailability.find({
        startTime: {
            $gte: dayjs.utc(`${year}-${month}-${date} 00:00:00`, DT_FMT).toDate()
        },
        endTime: {
            $lte: dayjs.utc(`${year}-${month}-${date} 23:59:59`, DT_FMT).toDate()
        }
    });

    if (interval === 'HOUR') {
        for (let hour = 0; hour < 24; hour++) {
            const time = dayjs().startOf('day').add(hour, 'hour');
            const dateToCheck = dayjs.utc(`${year}-${month}-${date} ${time.format('HH:mm:ss')}`, DT_FMT).toDate();
           // console.log('date to check-----> ',dateToCheck);
            let isAvailable = true;
            for (const avblty of docs) {
                if (dateToCheck >= avblty.startTime && dateToCheck <= avblty.endTime) {
                    isAvailable = false; break;
                }
            }
            hours.push({ slot: time.format('HH:mm'), isAvailable: isAvailable });
        }
    }
    else {
        let time = dayjs().startOf('day');
        for (let i = 0; i < 48; i++) {
            const dateToCheck = dayjs.utc(`${year}-${month}-${date} ${time.format('HH:mm:ss')}`, DT_FMT).toDate();
          //  console.log('date to check-----> ',dateToCheck);
            let isAvailable = true;
            for (const avblty of docs) {
                if (dateToCheck >= avblty.startTime && dateToCheck <= avblty.endTime) {
                    isAvailable = false; break;
                }
            }
            hours.push({ slot: time.format('HH:mm'), isAvailable: isAvailable });
            time = time.add(30, 'minute');
        }
    }
    return hours;
}